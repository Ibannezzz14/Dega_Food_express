import "server-only";

import {
  resolveDeliveryZone,
  type DeliveryZoneResult,
  type RegionId,
} from "@/data/delivery-zones";
import {
  findMatchingGeoAdminAddress,
  type GeoAdminAddressResult,
} from "@/lib/address-suggestions";

type GeoAdminResponse = {
  results?: GeoAdminAddressResult[];
};

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
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return { status: "service_error" };
    }

    const payload = (await response.json()) as GeoAdminResponse;
    const matchingAddress = findMatchingGeoAdminAddress(
      Array.isArray(payload.results) ? payload.results : [],
      {
        streetAddress,
        postalCode,
        city,
      },
    );

    if (!matchingAddress) {
      return { status: "not_found" };
    }

    return resolveDeliveryZone(region, matchingAddress.coordinates);
  } catch {
    return { status: "service_error" };
  }
}
