import "server-only";

import type { RegionId } from "@/data/delivery-zones";
import {
  getStatisticsLocation,
  type FulfillmentMethod,
  type StatisticsPeriod,
} from "@/lib/order-statistics-model";
import {
  ensureAnalyticsSchema,
  getAnalyticsDatabase,
} from "@/lib/postgres";

export type OrderHandoffInput = {
  region: RegionId;
  fulfillment: FulfillmentMethod;
  postalCode: string;
  city: string;
};

type SummaryQueryRow = {
  handoffs: number;
  delivery_handoffs: number;
  pickup_handoffs: number;
};

type LocationQueryRow = {
  postal_code: string;
  city: string;
  handoffs: number;
};

type RegionQueryRow = {
  region: RegionId;
  fulfillment: FulfillmentMethod;
  handoffs: number;
};

type TrendQueryRow = {
  day: string;
  handoffs: number;
};

export type OrderStatisticsSnapshot = {
  periodDays: StatisticsPeriod;
  summary: {
    handoffs: number;
    deliveryHandoffs: number;
    pickupHandoffs: number;
  };
  locations: Array<{
    postalCode: string;
    city: string;
    handoffs: number;
  }>;
  regions: Array<{
    region: RegionId;
    fulfillment: FulfillmentMethod;
    handoffs: number;
  }>;
  trend: Array<{
    day: string;
    handoffs: number;
  }>;
};

export type OrderStatisticsResult =
  | { status: "ready"; snapshot: OrderStatisticsSnapshot }
  | { status: "unconfigured" }
  | { status: "error" };

function analyticsErrorCode(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code.slice(0, 24);
  }

  return "unknown";
}

export async function trackOrderHandoff(input: OrderHandoffInput) {
  const database = getAnalyticsDatabase();
  if (!database) {
    return;
  }

  const location = getStatisticsLocation(
    input.fulfillment,
    input.postalCode,
    input.city,
  );
  if (!location) {
    return;
  }

  try {
    await ensureAnalyticsSchema(database);
    await database`
      WITH expired_rows AS (
        DELETE FROM whatsapp_handoff_daily
        WHERE stat_date <
          (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Zurich')::date - 730
      )
      INSERT INTO whatsapp_handoff_daily (
        stat_date,
        region,
        fulfillment,
        postal_code,
        city_key,
        city_label,
        handoff_count
      )
      VALUES (
        (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Zurich')::date,
        ${input.region},
        ${input.fulfillment},
        ${location.postalCode},
        ${location.cityKey},
        ${location.cityLabel},
        1
      )
      ON CONFLICT (
        stat_date,
        region,
        fulfillment,
        postal_code,
        city_key
      )
      DO UPDATE SET
        handoff_count = whatsapp_handoff_daily.handoff_count + 1,
        city_label = EXCLUDED.city_label
    `;
  } catch (error) {
    console.error(
      `[order-statistics] write failed (${analyticsErrorCode(error)})`,
    );
  }
}

export async function getOrderStatistics(
  periodDays: StatisticsPeriod,
): Promise<OrderStatisticsResult> {
  const database = getAnalyticsDatabase();
  if (!database) {
    return { status: "unconfigured" };
  }

  const daysBack = periodDays - 1;
  const trendDays = Math.min(periodDays, 14);

  try {
    await ensureAnalyticsSchema(database);
    const [summaryRows, locationRows, regionRows, trendRows] =
      await Promise.all([
        database<SummaryQueryRow[]>`
          SELECT
            COALESCE(SUM(handoff_count), 0)::int AS handoffs,
            COALESCE(
              SUM(handoff_count) FILTER (WHERE fulfillment = 'delivery'),
              0
            )::int AS delivery_handoffs,
            COALESCE(
              SUM(handoff_count) FILTER (WHERE fulfillment = 'pickup'),
              0
            )::int AS pickup_handoffs
          FROM whatsapp_handoff_daily
          WHERE stat_date BETWEEN
            (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Zurich')::date -
              ${daysBack}::int
            AND (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Zurich')::date
        `,
        database<LocationQueryRow[]>`
          SELECT
            postal_code,
            MAX(city_label) AS city,
            SUM(handoff_count)::int AS handoffs
          FROM whatsapp_handoff_daily
          WHERE
            fulfillment = 'delivery'
            AND stat_date BETWEEN
              (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Zurich')::date -
              ${daysBack}::int
              AND (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Zurich')::date
          GROUP BY postal_code, city_key
          HAVING SUM(handoff_count) >= 2
          ORDER BY handoffs DESC, city ASC
          LIMIT 10
        `,
        database<RegionQueryRow[]>`
          SELECT
            region,
            fulfillment,
            SUM(handoff_count)::int AS handoffs
          FROM whatsapp_handoff_daily
          WHERE stat_date BETWEEN
            (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Zurich')::date -
              ${daysBack}::int
            AND (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Zurich')::date
          GROUP BY region, fulfillment
          ORDER BY handoffs DESC
        `,
        database<TrendQueryRow[]>`
          WITH days AS (
            SELECT generate_series(
              (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Zurich')::date -
                ${trendDays - 1}::int,
              (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Zurich')::date,
              interval '1 day'
            )::date AS day
          )
          SELECT
            days.day::text AS day,
            COALESCE(SUM(whatsapp_handoff_daily.handoff_count), 0)::int
              AS handoffs
          FROM days
          LEFT JOIN whatsapp_handoff_daily
            ON whatsapp_handoff_daily.stat_date = days.day
          GROUP BY days.day
          ORDER BY days.day ASC
        `,
      ]);

    const summary = summaryRows[0] ?? {
      handoffs: 0,
      delivery_handoffs: 0,
      pickup_handoffs: 0,
    };

    return {
      status: "ready",
      snapshot: {
        periodDays,
        summary: {
          handoffs: summary.handoffs,
          deliveryHandoffs: summary.delivery_handoffs,
          pickupHandoffs: summary.pickup_handoffs,
        },
        locations: locationRows.map((row) => ({
          postalCode: row.postal_code,
          city: row.city,
          handoffs: row.handoffs,
        })),
        regions: regionRows.map((row) => ({
          region: row.region,
          fulfillment: row.fulfillment,
          handoffs: row.handoffs,
        })),
        trend: trendRows.map((row) => ({
          day: row.day,
          handoffs: row.handoffs,
        })),
      },
    };
  } catch (error) {
    console.error(
      `[order-statistics] read failed (${analyticsErrorCode(error)})`,
    );
    return { status: "error" };
  }
}
