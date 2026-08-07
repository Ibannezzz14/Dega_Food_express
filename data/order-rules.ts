export const DELIVERY_FEE = 7.9;
export const FREE_DELIVERY_THRESHOLD = 150;

export type DeliveryPricing =
  | {
      kind: "known";
      fee: number;
      total: number;
    }
  | {
      kind: "to_confirm";
      fee: null;
      total: null;
    };

export function calculateDeliveryFee(itemsSubtotal: number) {
  return itemsSubtotal > FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

export function calculateDeliveryPricing(
  itemsSubtotal: number,
  mode: "standard" | "to_confirm",
): DeliveryPricing {
  if (mode === "to_confirm") {
    return { kind: "to_confirm", fee: null, total: null };
  }

  const fee = calculateDeliveryFee(itemsSubtotal);
  return {
    kind: "known",
    fee,
    total: itemsSubtotal + fee,
  };
}
