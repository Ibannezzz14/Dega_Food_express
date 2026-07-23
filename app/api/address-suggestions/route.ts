import { NextResponse } from "next/server";
import { DELIVERY_ZONES, type RegionId } from "@/data/delivery-zones";
import {
  POSTAL_LOCALITY_LAYER,
  normalizeAddressQuery,
  parseGeoAdminAddress,
  parseGeoAdminPostalLocality,
  type AddressLookupSuggestion,
  type GeoAdminAddressResult,
} from "@/lib/address-suggestions";

type AddressSearchField = "streetAddress" | "postalCode" | "city";

type AddressSuggestionRequest = {
  field?: unknown;
  query?: unknown;
  region?: unknown;
  postalCode?: unknown;
  city?: unknown;
};

type GeoAdminResponse = {
  results?: GeoAdminAddressResult[];
};

function noStoreJson(
  body: { suggestions: AddressLookupSuggestion[] },
  status = 200,
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function isAddressSearchField(value: unknown): value is AddressSearchField {
  return (
    value === "streetAddress" ||
    value === "postalCode" ||
    value === "city"
  );
}

export async function POST(request: Request) {
  let payload: AddressSuggestionRequest;
  try {
    payload = (await request.json()) as AddressSuggestionRequest;
  } catch {
    return noStoreJson({ suggestions: [] }, 400);
  }

  if (payload.field !== undefined && !isAddressSearchField(payload.field)) {
    return noStoreJson({ suggestions: [] }, 400);
  }

  const field = isAddressSearchField(payload.field)
    ? payload.field
    : "streetAddress";
  const rawQuery = typeof payload.query === "string" ? payload.query : "";
  const query =
    field === "postalCode"
      ? rawQuery.replace(/\D/g, "").slice(0, 4)
      : normalizeAddressQuery(rawQuery);
  const region = typeof payload.region === "string" ? payload.region : "";
  const postalCode =
    typeof payload.postalCode === "string"
      ? payload.postalCode.replace(/\D/g, "").slice(0, 4)
      : "";
  const city =
    typeof payload.city === "string"
      ? normalizeAddressQuery(payload.city).slice(0, 80)
      : "";

  const hasKnownRegion = Object.prototype.hasOwnProperty.call(
    DELIVERY_ZONES,
    region,
  );
  const minimumQueryLength = field === "streetAddress" ? 3 : 2;
  const maximumQueryLength =
    field === "postalCode" ? 4 : field === "city" ? 80 : 120;
  if (
    query.length < minimumQueryLength ||
    query.length > maximumQueryLength ||
    query.split(" ").length > 10 ||
    (region.length > 0 && !hasKnownRegion)
  ) {
    return noStoreJson({ suggestions: [] }, 400);
  }

  const searchUrl = new URL(
    "https://api3.geo.admin.ch/rest/services/ech/SearchServer",
  );

  if (field === "streetAddress") {
    const enteredLocationHint = `${postalCode} ${city}`.trim();
    const locationHint =
      enteredLocationHint ||
      (hasKnownRegion ? DELIVERY_ZONES[region as RegionId].label : "");

    searchUrl.searchParams.set(
      "searchText",
      `${query} ${locationHint}`.trim(),
    );
    searchUrl.searchParams.set("type", "locations");
    searchUrl.searchParams.set("origins", "address");
  } else if (field === "postalCode") {
    searchUrl.searchParams.set("searchText", query);
    searchUrl.searchParams.set("type", "locations");
    searchUrl.searchParams.set("origins", "zipcode");
  } else {
    searchUrl.searchParams.set("searchText", query);
    searchUrl.searchParams.set("type", "featuresearch");
    searchUrl.searchParams.set("features", POSTAL_LOCALITY_LAYER);
  }

  searchUrl.searchParams.set(
    "limit",
    field === "city" ? "50" : field === "postalCode" ? "20" : "8",
  );
  searchUrl.searchParams.set("sr", "4326");
  searchUrl.searchParams.set("lang", "fr");

  try {
    const response = await fetch(searchUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(4500),
    });

    if (!response.ok) {
      return noStoreJson({ suggestions: [] }, 503);
    }

    const geoAdminPayload = (await response.json()) as GeoAdminResponse;
    const results = Array.isArray(geoAdminPayload.results)
      ? geoAdminPayload.results
      : [];
    const seen = new Set<string>();
    const suggestions = results
      .map((result): AddressLookupSuggestion | null => {
        if (field === "streetAddress") {
          const suggestion = parseGeoAdminAddress(result);
          return suggestion ? { kind: "address", ...suggestion } : null;
        }

        return parseGeoAdminPostalLocality(result);
      })
      .filter((suggestion): suggestion is AddressLookupSuggestion => {
        if (!suggestion) {
          return false;
        }

        const normalizedSuggestion =
          suggestion.kind === "address"
            ? `${suggestion.streetAddress}|${suggestion.postalCode}|${suggestion.city}`.toLocaleLowerCase(
                "fr-CH",
              )
            : `${suggestion.postalCode}|${suggestion.city}`.toLocaleLowerCase(
                "fr-CH",
              );
        if (seen.has(normalizedSuggestion)) {
          return false;
        }

        seen.add(normalizedSuggestion);
        return true;
      })
      .sort((first, second) => {
        if (first.kind !== "locality" || second.kind !== "locality") {
          return 0;
        }

        const matchRank = (value: string, expected: string) => {
          if (!expected) {
            return 0;
          }

          const normalizedValue = value.toLocaleLowerCase("fr-CH");
          const normalizedExpected = expected.toLocaleLowerCase("fr-CH");
          if (normalizedValue === normalizedExpected) {
            return 0;
          }
          if (normalizedValue.startsWith(normalizedExpected)) {
            return 1;
          }
          return normalizedValue.includes(normalizedExpected) ? 2 : 3;
        };

        if (field === "city") {
          const cityRank =
            matchRank(first.city, query) - matchRank(second.city, query);
          if (cityRank !== 0) {
            return cityRank;
          }

          return (
            Number(second.postalCode === postalCode) -
            Number(first.postalCode === postalCode)
          );
        }

        if (field === "postalCode" && city.length >= 2) {
          return (
            matchRank(first.city, city) - matchRank(second.city, city)
          );
        }

        return 0;
      })
      .slice(0, 6);

    return noStoreJson({ suggestions });
  } catch {
    return noStoreJson({ suggestions: [] }, 503);
  }
}
