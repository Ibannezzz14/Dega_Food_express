"use client";

import { useSearchParams } from "next/navigation";
import OrderExperience from "@/components/order/order-experience";
import { isDeliveryRegionId } from "@/data/delivery-zones";

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
