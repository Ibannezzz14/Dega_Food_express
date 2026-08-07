export const DELIVERY_PAYMENT_METHODS = [
  {
    id: "cash",
    label: "Espèces à la livraison",
    shortLabel: "Espèces",
  },
  {
    id: "twint",
    label: "TWINT à la livraison",
    shortLabel: "TWINT",
  },
] as const;

export type DeliveryPaymentMethod =
  (typeof DELIVERY_PAYMENT_METHODS)[number]["id"];

export function isDeliveryPaymentMethod(
  value: unknown,
): value is DeliveryPaymentMethod {
  return DELIVERY_PAYMENT_METHODS.some((method) => method.id === value);
}

export function getDeliveryPaymentMethodLabel(
  paymentMethod: DeliveryPaymentMethod,
) {
  return DELIVERY_PAYMENT_METHODS.find(
    (method) => method.id === paymentMethod,
  )!.label;
}
