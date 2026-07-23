import { NextResponse } from "next/server";
import {
  DELIVERY_ZONES,
  type RegionId,
} from "@/data/delivery-zones";
import { validateDeliveryZone } from "@/lib/validate-delivery-zone";

type DeliveryZoneRequest = {
  region?: unknown;
  streetAddress?: unknown;
  postalCode?: unknown;
  city?: unknown;
};

export async function POST(request: Request) {
  let payload: DeliveryZoneRequest;
  try {
    payload = (await request.json()) as DeliveryZoneRequest;
  } catch {
    return NextResponse.json({ status: "not_found" }, { status: 400 });
  }

  const region = typeof payload.region === "string" ? payload.region : "";
  const streetAddress =
    typeof payload.streetAddress === "string"
      ? payload.streetAddress.trim()
      : "";
  const postalCode =
    typeof payload.postalCode === "string" ? payload.postalCode.trim() : "";
  const city = typeof payload.city === "string" ? payload.city.trim() : "";

  if (
    !(region in DELIVERY_ZONES) ||
    streetAddress.length < 5 ||
    streetAddress.length > 120 ||
    !/^\d{4}$/.test(postalCode) ||
    city.length < 2 ||
    city.length > 80
  ) {
    return NextResponse.json({ status: "not_found" }, { status: 400 });
  }

  const result = await validateDeliveryZone(
    region as RegionId,
    streetAddress,
    postalCode,
    city,
  );

  return NextResponse.json(result, {
    status: result.status === "service_error" ? 503 : 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
