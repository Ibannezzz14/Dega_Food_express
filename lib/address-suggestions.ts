export type AddressSuggestion = {
  key: string;
  label: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

export const POSTAL_LOCALITY_LAYER =
  "ch.swisstopo-vd.ortschaftenverzeichnis_plz";

export type PostalLocalitySuggestion = {
  kind: "locality";
  key: string;
  label: string;
  postalCode: string;
  city: string;
};

export type AddressLookupSuggestion =
  | ({ kind: "address" } & AddressSuggestion)
  | PostalLocalitySuggestion;

export type AddressFormValue = {
  streetAddress: string;
  postalCode: string;
  city: string;
};

export type GeoAdminAddressResult = {
  attrs?: {
    detail?: unknown;
    featureId?: unknown;
    label?: unknown;
    layer?: unknown;
    lat?: unknown;
    lon?: unknown;
    num?: unknown;
    origin?: unknown;
  };
};

const LOWERCASE_LOCALITY_WORDS = new Set([
  "aux",
  "de",
  "des",
  "du",
  "en",
  "la",
  "le",
  "les",
  "près",
  "sous",
  "sur",
]);

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

function decodeHtmlEntity(entity: string) {
  const normalized = entity.toLocaleLowerCase("en");
  if (normalized in HTML_ENTITIES) {
    return HTML_ENTITIES[normalized];
  }

  const isHexadecimal = normalized.startsWith("#x");
  const isDecimal = normalized.startsWith("#");
  if (!isHexadecimal && !isDecimal) {
    return `&${entity};`;
  }

  const codePoint = Number.parseInt(
    normalized.slice(isHexadecimal ? 2 : 1),
    isHexadecimal ? 16 : 10,
  );

  if (
    !Number.isInteger(codePoint) ||
    codePoint < 0 ||
    codePoint > 0x10ffff
  ) {
    return `&${entity};`;
  }

  return String.fromCodePoint(codePoint);
}

function plainTextLabel(value: string) {
  return value
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&([^;\s]+);/g, (_match, entity: string) =>
      decodeHtmlEntity(entity),
    )
    .replace(/\s+/g, " ")
    .trim();
}

function isSwissCoordinate(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= 45.7 &&
    latitude <= 47.9 &&
    longitude >= 5.8 &&
    longitude <= 10.6
  );
}

function formatLocalityName(value: string) {
  let wordIndex = 0;

  return value
    .toLocaleLowerCase("fr-CH")
    .split(/([\s/'’.-]+)/u)
    .map((part) => {
      if (!part || /^[\s/'’.-]+$/u.test(part)) {
        return part;
      }

      const shouldStayLowercase =
        wordIndex > 0 && LOWERCASE_LOCALITY_WORDS.has(part);
      wordIndex += 1;

      if (shouldStayLowercase) {
        return part;
      }

      return `${part.charAt(0).toLocaleUpperCase("fr-CH")}${part.slice(1)}`;
    })
    .join("");
}

export function parseGeoAdminAddress(
  result: GeoAdminAddressResult,
): AddressSuggestion | null {
  const attrs = result.attrs;
  if (
    attrs?.origin !== "address" ||
    typeof attrs.label !== "string" ||
    typeof attrs.lat !== "number" ||
    typeof attrs.lon !== "number" ||
    typeof attrs.num !== "number" ||
    attrs.num <= 0 ||
    !isSwissCoordinate(attrs.lat, attrs.lon)
  ) {
    return null;
  }

  const label = plainTextLabel(attrs.label);
  const addressParts = label.match(/^(.+)\s+([1-9]\d{3})\s+(.+)$/);
  if (!addressParts) {
    return null;
  }

  const streetAddress = addressParts[1].trim();
  const postalCode = addressParts[2];
  const city = addressParts[3].trim();
  if (
    streetAddress.length < 3 ||
    streetAddress.length > 120 ||
    city.length < 2 ||
    city.length > 80 ||
    !/\d/.test(streetAddress) ||
    streetAddress.includes("#")
  ) {
    return null;
  }

  const featureId =
    typeof attrs.featureId === "string" && attrs.featureId.length > 0
      ? attrs.featureId
      : `${streetAddress}-${postalCode}-${city}`;

  return {
    key: `${featureId}-${attrs.lat}-${attrs.lon}`,
    label: `${streetAddress}, ${postalCode} ${city}`,
    streetAddress,
    postalCode,
    city,
    coordinates: {
      latitude: attrs.lat,
      longitude: attrs.lon,
    },
  };
}

export function parseGeoAdminPostalLocality(
  result: GeoAdminAddressResult,
): PostalLocalitySuggestion | null {
  const attrs = result.attrs;
  if (
    !attrs ||
    typeof attrs.lat !== "number" ||
    typeof attrs.lon !== "number" ||
    !isSwissCoordinate(attrs.lat, attrs.lon)
  ) {
    return null;
  }

  let rawLabel = "";
  if (attrs.origin === "zipcode" && typeof attrs.label === "string") {
    rawLabel = plainTextLabel(attrs.label).replace(/\s*-\s*/, " ");
  } else if (
    attrs.origin === "feature" &&
    attrs.layer === POSTAL_LOCALITY_LAYER &&
    typeof attrs.detail === "string"
  ) {
    rawLabel = plainTextLabel(attrs.detail);
  } else {
    return null;
  }

  const localityParts = rawLabel.match(/^([1-9]\d{3})\s+(.+)$/);
  if (!localityParts) {
    return null;
  }

  const postalCode = localityParts[1];
  const city = formatLocalityName(localityParts[2].trim());
  if (city.length < 2 || city.length > 80 || city.includes("#")) {
    return null;
  }

  const featureId =
    typeof attrs.featureId === "string" && attrs.featureId.length > 0
      ? attrs.featureId
      : `${postalCode}-${city}`;

  return {
    kind: "locality",
    key: `locality-${featureId}-${postalCode}-${city}`,
    label: `${postalCode} ${city}`,
    postalCode,
    city,
  };
}

export function applyAddressLookupSuggestion(
  current: AddressFormValue,
  suggestion: AddressLookupSuggestion,
): AddressFormValue {
  if (suggestion.kind === "address") {
    return {
      streetAddress: suggestion.streetAddress,
      postalCode: suggestion.postalCode,
      city: suggestion.city,
    };
  }

  return {
    ...current,
    postalCode: suggestion.postalCode,
    city: suggestion.city,
  };
}

export function normalizeAddressQuery(value: string) {
  return value.normalize("NFKC").replace(/\s+/g, " ").trim();
}
