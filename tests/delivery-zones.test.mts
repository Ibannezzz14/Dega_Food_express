import assert from "node:assert/strict";
import test from "node:test";
import {
  DELIVERY_ZONES,
  PUBLIC_REGIONS,
  distanceFromDeliveryZone,
  findEligibleDeliveryZone,
  isDeliveryRegionId,
  resolveDeliveryZone,
} from "../data/delivery-zones.ts";

test("associe chaque centre à sa propre zone de livraison", () => {
  assert.equal(
    findEligibleDeliveryZone(DELIVERY_ZONES.lausanne.center),
    "lausanne",
  );
  assert.equal(
    findEligibleDeliveryZone(DELIVERY_ZONES.lucens.center),
    "lucens",
  );
});

test("choisit la zone la plus proche lorsque les rayons se chevauchent", () => {
  assert.ok(
    distanceFromDeliveryZone("lausanne", DELIVERY_ZONES.lucens.center) <=
      DELIVERY_ZONES.lausanne.radiusKm,
  );
  assert.equal(
    findEligibleDeliveryZone(DELIVERY_ZONES.lucens.center),
    "lucens",
  );
  assert.deepEqual(
    resolveDeliveryZone("lausanne", DELIVERY_ZONES.lucens.center),
    {
      status: "outside",
      region: "lausanne",
      distanceKm: distanceFromDeliveryZone(
        "lausanne",
        DELIVERY_ZONES.lucens.center,
      ),
      suggestedRegion: "lucens",
    },
  );
  assert.deepEqual(
    resolveDeliveryZone("lucens", DELIVERY_ZONES.lucens.center),
    {
      status: "eligible",
      region: "lucens",
      distanceKm: 0,
    },
  );
});

test("refuse une adresse située à Genève", () => {
  const geneva = {
    latitude: 46.210251,
    longitude: 6.146667,
  };

  assert.equal(findEligibleDeliveryZone(geneva), undefined);
  assert.deepEqual(resolveDeliveryZone("lausanne", geneva), {
    status: "outside",
    region: "lausanne",
    distanceKm: distanceFromDeliveryZone("lausanne", geneva),
    suggestedRegion: null,
  });
  assert.ok(
    distanceFromDeliveryZone("lausanne", geneva) >
      DELIVERY_ZONES.lausanne.radiusKm,
  );
  assert.ok(
    distanceFromDeliveryZone("lucens", geneva) >
      DELIVERY_ZONES.lucens.radiusKm,
  );
});

test("affiche Genève sans l’activer comme zone de commande", () => {
  const geneva = PUBLIC_REGIONS.find((region) => region.id === "geneve");

  assert.deepEqual(geneva, {
    id: "geneve",
    label: "Genève",
    selectionLabel: "Genève",
    availability: "coming_soon",
    availabilityLabel: "Contact bientôt disponible",
  });
  assert.equal(isDeliveryRegionId("geneve"), false);
  assert.equal(isDeliveryRegionId("Genève"), false);
});
