import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateDeliveryFee,
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
