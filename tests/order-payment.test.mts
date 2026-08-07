import assert from "node:assert/strict";
import test from "node:test";
import {
  DELIVERY_PAYMENT_METHODS,
  getDeliveryPaymentMethodLabel,
  isDeliveryPaymentMethod,
} from "../lib/order-payment.ts";

test("seuls les deux modes de paiement à la livraison sont acceptés", () => {
  assert.equal(isDeliveryPaymentMethod("cash"), true);
  assert.equal(isDeliveryPaymentMethod("twint"), true);
  assert.equal(isDeliveryPaymentMethod("card"), false);
  assert.equal(isDeliveryPaymentMethod(null), false);
});

test("les libellés de paiement sont explicites pour la commande", () => {
  assert.deepEqual(
    DELIVERY_PAYMENT_METHODS.map(({ id }) => id),
    ["cash", "twint"],
  );
  assert.equal(
    getDeliveryPaymentMethodLabel("cash"),
    "Espèces à la livraison",
  );
  assert.equal(
    getDeliveryPaymentMethodLabel("twint"),
    "TWINT à la livraison",
  );
});
