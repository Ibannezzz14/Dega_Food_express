import type { AddressFormValue } from "@/lib/address-suggestions";

export type DeliveryAddressIssue =
  | "street_address"
  | "postal_code"
  | "city";

export function normalizeTextInput(value: unknown) {
  return typeof value === "string"
    ? value.normalize("NFKC").trim().replace(/\s+/g, " ")
    : "";
}

export function normalizeDeliveryAddress(input: {
  streetAddress: unknown;
  postalCode: unknown;
  city: unknown;
}): AddressFormValue {
  return {
    streetAddress: normalizeTextInput(input.streetAddress),
    postalCode: normalizeTextInput(input.postalCode),
    city: normalizeTextInput(input.city),
  };
}

export function getDeliveryAddressIssue({
  streetAddress,
  postalCode,
  city,
}: AddressFormValue): DeliveryAddressIssue | null {
  if (
    streetAddress.length < 5 ||
    streetAddress.length > 120 ||
    !/\d/.test(streetAddress)
  ) {
    return "street_address";
  }

  if (!/^\d{4}$/.test(postalCode)) {
    return "postal_code";
  }

  if (city.length < 2 || city.length > 80) {
    return "city";
  }

  return null;
}
