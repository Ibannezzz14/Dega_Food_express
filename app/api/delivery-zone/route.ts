import { NextResponse } from "next/server";
import { isDeliveryRegionId } from "@/data/delivery-zones";
import {
  getDeliveryAddressIssue,
  normalizeDeliveryAddress,
} from "@/lib/delivery-address";
import {
  hasJsonContentType,
  readJsonObject,
} from "@/lib/read-json-object";
import { validateDeliveryZone } from "@/lib/validate-delivery-zone";
import { createRequestId } from "@/lib/observability";

type DeliveryZoneRequest = {
  region?: unknown;
  streetAddress?: unknown;
  postalCode?: unknown;
  city?: unknown;
};

function noStoreJson(
  body: { status: "not_found" },
  status: 400 | 413 | 415,
  requestId: string,
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Request-Id": requestId,
    },
  });
}

export async function POST(request: Request) {
  const requestId = createRequestId();

  if (!hasJsonContentType(request)) {
    return noStoreJson({ status: "not_found" }, 415, requestId);
  }

  const body = await readJsonObject(request);
  if (!body.ok) {
    return noStoreJson(
      { status: "not_found" },
      body.error === "too_large" ? 413 : 400,
      requestId,
    );
  }
  const payload: DeliveryZoneRequest = body.value;

  const region = typeof payload.region === "string" ? payload.region : "";
  const { streetAddress, postalCode, city } = normalizeDeliveryAddress({
    streetAddress: payload.streetAddress,
    postalCode: payload.postalCode,
    city: payload.city,
  });

  if (
    !isDeliveryRegionId(region) ||
    getDeliveryAddressIssue({ streetAddress, postalCode, city })
  ) {
    return noStoreJson({ status: "not_found" }, 400, requestId);
  }

  const result = await validateDeliveryZone(
    region,
    streetAddress,
    postalCode,
    city,
    requestId,
  );

  return NextResponse.json(result, {
    status: result.status === "service_error" ? 503 : 200,
    headers: {
      "Cache-Control": "no-store",
      "X-Request-Id": requestId,
    },
  });
}
