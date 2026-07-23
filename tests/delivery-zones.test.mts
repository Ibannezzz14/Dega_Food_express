import assert from "node:assert/strict";
import test from "node:test";
import {
  DELIVERY_ZONES,
  distanceFromDeliveryZone,
  findEligibleDeliveryZone,
} from "../data/delivery-zones.ts";

test("associe les centres à leur numéro de livraison", () => {
  assert.equal(
    findEligibleDeliveryZone(DELIVERY_ZONES.lausanne.center),
    "lausanne",
  );
  assert.equal(
    findEligibleDeliveryZone(DELIVERY_ZONES.lucens.center),
    "lucens",
  );
});

test("refuse une adresse située à Genève", () => {
  const geneva = {
    latitude: 46.210251,
    longitude: 6.146667,
  };

  assert.equal(findEligibleDeliveryZone(geneva), undefined);
  assert.ok(
    distanceFromDeliveryZone("lausanne", geneva) >
      DELIVERY_ZONES.lausanne.radiusKm,
  );
  assert.ok(
    distanceFromDeliveryZone("lucens", geneva) >
      DELIVERY_ZONES.lucens.radiusKm,
  );
});
