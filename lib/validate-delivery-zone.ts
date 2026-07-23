import "server-only";

import {
  DELIVERY_ZONES,
  distanceFromDeliveryZone,
  findEligibleDeliveryZone,
  type DeliveryZoneResult,
  type RegionId,
} from "@/data/delivery-zones";

type GeoAdminResult = {
  attrs?: {
    detail?: string;
    label?: string;
    lat?: number;
    lon?: number;
    origin?: string;
  };
};

type GeoAdminResponse = {
  results?: GeoAdminResult[];
};

function normalizeLocality(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr-CH")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function matchingCoordinates(
  results: GeoAdminResult[],
  postalCode: string,
  city: string,
) {
  const normalizedPostalLocality = normalizeLocality(`${postalCode} ${city}`);

  for (const result of results) {
    const attrs = result.attrs;
    if (
      attrs?.origin !== "address" ||
      typeof attrs.lat !== "number" ||
      typeof attrs.lon !== "number" ||
      typeof attrs.detail !== "string"
    ) {
      continue;
    }

    if (normalizeLocality(attrs.detail).includes(normalizedPostalLocality)) {
      return {
        latitude: attrs.lat,
        longitude: attrs.lon,
      };
    }
  }

  return null;
}

export async function validateDeliveryZone(
  region: RegionId,
  streetAddress: string,
  postalCode: string,
  city: string,
): Promise<DeliveryZoneResult> {
  const searchUrl = new URL(
    "https://api3.geo.admin.ch/rest/services/api/SearchServer",
  );
  searchUrl.searchParams.set(
    "searchText",
    `${streetAddress} ${postalCode} ${city}`,
  );
  searchUrl.searchParams.set("type", "locations");
  searchUrl.searchParams.set("origins", "address");
  searchUrl.searchParams.set("limit", "10");
  searchUrl.searchParams.set("sr", "4326");

  try {
    const response = await fetch(searchUrl, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 604800,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return { status: "service_error" };
    }

    const payload = (await response.json()) as GeoAdminResponse;
    const coordinates = matchingCoordinates(
      Array.isArray(payload.results) ? payload.results : [],
      postalCode,
      city,
    );

    if (!coordinates) {
      return { status: "not_found" };
    }

    const distanceKm = distanceFromDeliveryZone(region, coordinates);
    if (distanceKm <= DELIVERY_ZONES[region].radiusKm) {
      return {
        status: "eligible",
        region,
        distanceKm,
      };
    }

    return {
      status: "outside",
      region,
      distanceKm,
      suggestedRegion: findEligibleDeliveryZone(coordinates) ?? null,
    };
  } catch {
    return { status: "service_error" };
  }
}
