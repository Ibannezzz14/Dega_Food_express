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
import {
  createRequestId,
  formatPublicErrorReference,
  logServerError,
} from "@/lib/observability";

type GeoAdminResponse = {
  results?: GeoAdminAddressResult[];
};

export async function validateDeliveryZone(
  region: RegionId,
  streetAddress: string,
  postalCode: string,
  city: string,
  requestId = createRequestId(),
): Promise<DeliveryZoneResult> {
  const startedAt = Date.now();
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
      logServerError("geoadmin_delivery_failed", new Error("upstream_status"), {
        requestId,
        route: "GeoAdmin/SearchServer",
        operation: "delivery_validation",
        statusCode: response.status,
        durationMs: Date.now() - startedAt,
      });
      return {
        status: "service_error",
        reference: formatPublicErrorReference(requestId),
      };
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
  } catch (error) {
    logServerError("geoadmin_delivery_failed", error, {
      requestId,
      route: "GeoAdmin/SearchServer",
      operation: "delivery_validation",
      durationMs: Date.now() - startedAt,
    });
    return {
      status: "service_error",
      reference: formatPublicErrorReference(requestId),
    };
  }
}
