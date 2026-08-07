"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import {
  isDeliveryRegionId,
  DELIVERY_ZONES,
  type RegionId,
} from "@/data/delivery-zones";
import { menuById, menuItems } from "@/data/menu";
import {
  calculateDeliveryFee,
  FREE_DELIVERY_THRESHOLD,
} from "@/data/order-rules";
import {
  getDeliveryAddressIssue,
  normalizeDeliveryAddress,
  normalizeTextInput,
} from "@/lib/delivery-address";
import {
  getDeliveryPaymentMethodLabel,
  isDeliveryPaymentMethod,
  type DeliveryPaymentMethod,
} from "@/lib/order-payment";
import { trackOrderHandoff } from "@/lib/order-statistics";
import { validateDeliveryZone } from "@/lib/validate-delivery-zone";

export type OrderActionState = {
  status: "idle" | "error";
  message: string;
};

type OrderLine = {
  id: string;
  quantity: number;
};

function isOrderLine(value: unknown): value is OrderLine {
  if (!value || typeof value !== "object") {
    return false;
  }

  const line = value as Partial<OrderLine>;
  return (
    typeof line.id === "string" &&
    Number.isInteger(line.quantity) &&
    Number(line.quantity) >= 1 &&
    Number(line.quantity) <= 20
  );
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-CH", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export async function prepareWhatsAppOrder(
  _previousState: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const regionId = String(formData.get("region") ?? "");

  if (!isDeliveryRegionId(regionId)) {
    return {
      status: "error",
      message: "Choisissez une zone disponible avant de continuer.",
    };
  }

  let resolvedRegionId: RegionId = regionId;
  let region = DELIVERY_ZONES[resolvedRegionId];

  const fulfillment = String(formData.get("fulfillment") ?? "");
  if (fulfillment !== "pickup" && fulfillment !== "delivery") {
    return {
      status: "error",
      message: "Choisissez le retrait ou la livraison avant de continuer.",
    };
  }

  let paymentMethod: DeliveryPaymentMethod | null = null;

  if (fulfillment === "delivery") {
    const submittedPaymentMethod = formData.get("paymentMethod");

    if (!isDeliveryPaymentMethod(submittedPaymentMethod)) {
      return {
        status: "error",
        message:
          "Choisissez le paiement en espèces ou par TWINT à la livraison.",
      };
    }

    paymentMethod = submittedPaymentMethod;
  }

  const { streetAddress, postalCode, city } = normalizeDeliveryAddress({
    streetAddress: formData.get("streetAddress"),
    postalCode: formData.get("postalCode"),
    city: formData.get("city"),
  });
  const addressExtra = normalizeTextInput(formData.get("addressExtra"));

  if (fulfillment === "delivery") {
    const addressIssue = getDeliveryAddressIssue({
      streetAddress,
      postalCode,
      city,
    });

    if (addressIssue === "street_address") {
      return {
        status: "error",
        message: "Indiquez la rue et le numéro de livraison.",
      };
    }

    if (addressIssue === "postal_code") {
      return {
        status: "error",
        message: "Indiquez un NPA suisse à 4 chiffres.",
      };
    }

    if (addressIssue === "city") {
      return {
        status: "error",
        message: "Indiquez la localité de livraison.",
      };
    }

    if (addressExtra.length > 100) {
      return {
        status: "error",
        message: "Le complément d’adresse ne doit pas dépasser 100 caractères.",
      };
    }
  }

  let rawOrder: unknown;
  try {
    rawOrder = JSON.parse(String(formData.get("order") ?? "[]"));
  } catch {
    return {
      status: "error",
      message: "La sélection est illisible. Rechargez la page puis réessayez.",
    };
  }

  if (
    !Array.isArray(rawOrder) ||
    rawOrder.length === 0 ||
    rawOrder.length > menuItems.length ||
    !rawOrder.every(isOrderLine)
  ) {
    return {
      status: "error",
      message: "Ajoutez au moins un article à votre commande.",
    };
  }

  const uniqueIds = new Set(rawOrder.map((line) => line.id));
  if (uniqueIds.size !== rawOrder.length) {
    return {
      status: "error",
      message: "Un article apparaît plusieurs fois. Rechargez la page puis réessayez.",
    };
  }

  if (rawOrder.some((line) => !menuById.has(line.id))) {
    return {
      status: "error",
      message: "Un article n’existe plus dans la carte. Rechargez la page.",
    };
  }

  if (fulfillment === "delivery") {
    const zoneValidation = await validateDeliveryZone(
      regionId,
      streetAddress,
      postalCode,
      city,
    );

    if (zoneValidation.status === "not_found") {
      return {
        status: "error",
        message: "Vérifiez la rue, le NPA et la localité.",
      };
    }

    if (zoneValidation.status === "service_error") {
      return {
        status: "error",
        message:
          "La zone de livraison ne peut pas être vérifiée actuellement. Réessayez.",
      };
    }

    if (zoneValidation.status === "outside") {
      if (zoneValidation.suggestedRegion) {
        resolvedRegionId = zoneValidation.suggestedRegion;
        region = DELIVERY_ZONES[resolvedRegionId];
      } else {
        return {
          status: "error",
          message: "La livraison n’est pas disponible à cette adresse.",
        };
      }
    }
  }

  const lines: string[] = [];
  let itemsSubtotal = 0;

  for (const orderLine of rawOrder) {
    const item = menuById.get(orderLine.id);
    if (!item) {
      return {
        status: "error",
        message: "Un article n’existe plus dans la carte. Rechargez la page.",
      };
    }

    const details = [item.packaging, item.volume].filter(Boolean).join(" · ");
    const itemPrice = `${formatPrice(item.price * orderLine.quantity)} CHF`;

    lines.push(
      `• ${orderLine.quantity} × ${item.name}${details ? ` (${details})` : ""} — ${itemPrice}`,
    );

    itemsSubtotal += item.price * orderLine.quantity;
  }

  const deliveryFee =
    fulfillment === "delivery" ? calculateDeliveryFee(itemsSubtotal) : 0;
  const orderTotal = itemsSubtotal + deliveryFee;
  const deliveryAddressLines =
    fulfillment === "delivery"
      ? [
          `Adresse : ${streetAddress}`,
          `${postalCode} ${city}`,
          addressExtra ? `Complément : ${addressExtra}` : "",
        ]
      : [];

  const message = [
    "Bonjour Dega Food Express,",
    "",
    "Je souhaite passer une commande :",
    fulfillment === "delivery"
      ? "Mode : Livraison"
      : "Mode : Retrait",
    ...deliveryAddressLines,
    fulfillment === "delivery" && paymentMethod
      ? `Paiement : ${getDeliveryPaymentMethodLabel(paymentMethod)}`
      : "Paiement : À convenir lors du retrait",
    "",
    ...lines,
    "",
    fulfillment === "delivery" && itemsSubtotal > 0
      ? `Sous-total : ${formatPrice(itemsSubtotal)} CHF`
      : "",
    fulfillment === "delivery"
      ? deliveryFee === 0
        ? `Livraison : offerte (commande supérieure à ${formatPrice(FREE_DELIVERY_THRESHOLD)} CHF)`
        : `Livraison : ${formatPrice(deliveryFee)} CHF`
      : "",
    orderTotal > 0 ? `Total : ${formatPrice(orderTotal)} CHF` : "",
    "Merci de me confirmer les disponibilités et les détails.",
  ]
    .filter(Boolean)
    .join("\n");

  const whatsAppUrl = `https://wa.me/${region.phone}?text=${encodeURIComponent(message)}`;

  after(async () => {
    await trackOrderHandoff({
      region: resolvedRegionId,
      fulfillment,
      postalCode: fulfillment === "delivery" ? postalCode : "",
      city: fulfillment === "delivery" ? city : "",
    });
  });

  redirect(whatsAppUrl);
}
