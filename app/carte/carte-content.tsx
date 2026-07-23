"use client";

import { useSearchParams } from "next/navigation";
import OrderExperience from "../order-experience";

export default function CarteContent() {
  const searchParams = useSearchParams();
  const zone = searchParams.get("zone");
  const initialRegion =
    zone === "lausanne" || zone === "lucens" ? zone : null;

  return <OrderExperience initialRegion={initialRegion} />;
}
