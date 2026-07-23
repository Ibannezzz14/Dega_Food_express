export const STATISTICS_PERIODS = [7, 30, 90, 365] as const;

export type StatisticsPeriod = (typeof STATISTICS_PERIODS)[number];
export type FulfillmentMethod = "pickup" | "delivery";

export function parseStatisticsPeriod(
  value: string | string[] | undefined,
): StatisticsPeriod {
  const candidate = Array.isArray(value) ? value[0] : value;
  const parsed = Number(candidate);

  return STATISTICS_PERIODS.includes(parsed as StatisticsPeriod)
    ? (parsed as StatisticsPeriod)
    : 30;
}

export function normalizeStatisticsCityKey(value: string) {
  return value
    .normalize("NFD")
    .toLocaleLowerCase("fr-CH")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/ß/g, "ss")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

export function getStatisticsLocation(
  fulfillment: FulfillmentMethod,
  postalCode: string,
  city: string,
) {
  if (fulfillment === "pickup") {
    return {
      postalCode: "",
      cityKey: "",
      cityLabel: "",
    };
  }

  const normalizedPostalCode = postalCode.trim();
  const cityLabel = city
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  const cityKey = normalizeStatisticsCityKey(cityLabel);

  if (
    !/^\d{4}$/.test(normalizedPostalCode) ||
    cityLabel.length < 2 ||
    cityKey.length < 2
  ) {
    return null;
  }

  return {
    postalCode: normalizedPostalCode,
    cityKey,
    cityLabel,
  };
}
