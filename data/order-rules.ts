export const DELIVERY_FEE = 7.9;
export const FREE_DELIVERY_THRESHOLD = 150;

export function calculateDeliveryFee(itemsSubtotal: number) {
  return itemsSubtotal > FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}
