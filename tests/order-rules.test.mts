import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateDeliveryFee,
  calculateDeliveryPricing,
  DELIVERY_FEE,
} from "../data/order-rules.ts";

test("ajoute les frais jusqu’à 150 CHF inclus", () => {
  assert.equal(calculateDeliveryFee(0), DELIVERY_FEE);
  assert.equal(calculateDeliveryFee(149.99), DELIVERY_FEE);
  assert.equal(calculateDeliveryFee(150), DELIVERY_FEE);
});

test("offre la livraison au-delà de 150 CHF", () => {
  assert.equal(calculateDeliveryFee(150.01), 0);
  assert.equal(calculateDeliveryFee(175), 0);
});

test("ne calcule aucun frais ni total final pour une demande hors zone habituelle", () => {
  assert.deepEqual(calculateDeliveryPricing(80, "to_confirm"), {
    kind: "to_confirm",
    fee: null,
    total: null,
  });
  assert.deepEqual(calculateDeliveryPricing(80, "standard"), {
    kind: "known",
    fee: DELIVERY_FEE,
    total: 80 + DELIVERY_FEE,
  });
});
