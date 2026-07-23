"use client";

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { RegionId } from "@/data/delivery-zones";

export type FulfillmentMethod = "pickup" | "delivery";
export type OrderQuantities = Record<string, number>;

type OrderSessionValue = {
  fulfillmentMethod: FulfillmentMethod | null;
  quantities: OrderQuantities;
  region: RegionId | null;
  setFulfillmentMethod: Dispatch<SetStateAction<FulfillmentMethod | null>>;
  setQuantities: Dispatch<SetStateAction<OrderQuantities>>;
  setRegion: Dispatch<SetStateAction<RegionId | null>>;
};

const OrderSessionContext = createContext<OrderSessionValue | null>(null);

export function OrderSessionProvider({ children }: { children: ReactNode }) {
  const [region, setRegion] = useState<RegionId | null>(null);
  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<FulfillmentMethod | null>(null);
  const [quantities, setQuantities] = useState<OrderQuantities>({});

  return (
    <OrderSessionContext.Provider
      value={{
        fulfillmentMethod,
        quantities,
        region,
        setFulfillmentMethod,
        setQuantities,
        setRegion,
      }}
    >
      {children}
    </OrderSessionContext.Provider>
  );
}

export function useOrderSession() {
  const context = useContext(OrderSessionContext);

  if (!context) {
    throw new Error(
      "useOrderSession doit être utilisé dans OrderSessionProvider.",
    );
  }

  return context;
}
