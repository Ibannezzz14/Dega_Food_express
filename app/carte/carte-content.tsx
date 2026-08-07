"use client";

import { useSearchParams } from "next/navigation";
import { isDeliveryRegionId } from "@/data/delivery-zones";
import OrderExperience from "../order-experience";

export default function CarteContent() {
  const searchParams = useSearchParams();
  const zone = searchParams.get("zone");
  const initialRegion = zone && isDeliveryRegionId(zone) ? zone : null;
  const initialFulfillmentMethod =
    searchParams.get("mode") === "livraison" ? "delivery" : null;

  return (
    <OrderExperience
      initialFulfillmentMethod={initialFulfillmentMethod}
      initialRegion={initialRegion}
    />
  );
}
