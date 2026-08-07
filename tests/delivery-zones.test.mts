import assert from "node:assert/strict";
import test from "node:test";
import {
  ORDER_WHATSAPP_HREF,
  SITE_CONFIG,
} from "../config/site-config.ts";
import {
  DELIVERY_REGION_IDS,
  DELIVERY_ZONES,
  distanceFromDeliveryZone,
  findEligibleDeliveryZone,
  isDeliveryRegionId,
  resolveDeliveryZone,
} from "../data/delivery-zones.ts";

const regionId = "lucens";

test("Lausanne et Lucens partagent une seule zone et un seul contact de livraison", () => {
  assert.deepEqual(DELIVERY_REGION_IDS, [regionId]);
  assert.equal(isDeliveryRegionId(regionId), true);
  assert.equal(isDeliveryRegionId("lausanne"), false);
  assert.equal(isDeliveryRegionId("lausanne-lucens"), false);
  assert.equal(SITE_CONFIG.delivery.regionId, regionId);
  assert.equal(
    SITE_CONFIG.delivery.availabilityMessage,
    "Livraison disponible à Lausanne, Lucens et dans les régions environnantes",
  );
  assert.equal(SITE_CONFIG.contacts.orders.displayPhone, "076 603 60 11");
  assert.equal(
    SITE_CONFIG.contacts.orders.internationalPhone,
    "41766036011",
  );
  assert.match(ORDER_WHATSAPP_HREF, /^https:\/\/wa\.me\/41766036011\?/);
});

test("les centres de Lausanne, Lucens et une localité intermédiaire sont éligibles", () => {
  const zone = DELIVERY_ZONES[regionId];
  const lausanne = zone.anchors.find((anchor) => anchor.id === "lausanne");
  const lucens = zone.anchors.find((anchor) => anchor.id === "lucens");
  assert.ok(lausanne);
  assert.ok(lucens);

  for (const center of [lausanne.center, lucens.center]) {
    assert.equal(findEligibleDeliveryZone(center), regionId);
    assert.deepEqual(resolveDeliveryZone(regionId, center), {
      status: "eligible",
      region: regionId,
      distanceKm: 0,
    });
  }

  assert.equal(
    findEligibleDeliveryZone({ latitude: 46.6684, longitude: 6.7973 }),
    regionId,
  );
});

test("une adresse suisse hors de la zone habituelle reste envoyable pour confirmation", () => {
  const distantAddress = {
    latitude: 46.2044,
    longitude: 6.1432,
  };

  assert.equal(findEligibleDeliveryZone(distantAddress), undefined);
  assert.deepEqual(resolveDeliveryZone(regionId, distantAddress), {
    status: "on_request",
    region: regionId,
    distanceKm: distanceFromDeliveryZone(regionId, distantAddress),
  });
});

test("le traiteur est disponible dans toute la Suisse sans rayon automatique", () => {
  assert.equal(SITE_CONFIG.cateringArea.label, "Toute la Suisse");
  assert.equal(SITE_CONFIG.cateringArea.nationwide, true);
  assert.deepEqual(SITE_CONFIG.cateringArea.locations, [
    "Suisse romande",
    "Suisse alémanique",
    "Tessin",
  ]);
  assert.equal("radiusKm" in SITE_CONFIG.cateringArea, false);
  assert.match(SITE_CONFIG.cateringArea.detail, /devis personnalisé/i);
});
