import assert from "node:assert/strict";
import test from "node:test";
import {
  PUBLIC_LOCATION_MIN_HANDOFFS,
  getStatisticsLocation,
  normalizeStatisticsCityKey,
  parseStatisticsPeriod,
  shouldDisplayStatisticsLocation,
} from "../lib/order-statistics-model.ts";

test("limite les périodes statistiques aux choix prévus", () => {
  assert.equal(parseStatisticsPeriod("7"), 7);
  assert.equal(parseStatisticsPeriod(["90", "365"]), 90);
  assert.equal(parseStatisticsPeriod("366"), 30);
  assert.equal(parseStatisticsPeriod(undefined), 30);
});

test("fusionne les variantes d’écriture d’une même localité", () => {
  const variants = [
    "Échallens",
    "Echallens",
    "  ÉCHALLENS  ",
    "Échallens",
  ];

  assert.deepEqual(
    variants.map(normalizeStatisticsCityKey),
    ["echallens", "echallens", "echallens", "echallens"],
  );
  assert.equal(normalizeStatisticsCityKey("Biel / Bienne"), "biel bienne");
});

test("ne conserve que le NPA et la localité pour une livraison", () => {
  assert.deepEqual(
    getStatisticsLocation("delivery", "1522", "  Lucens  "),
    {
      postalCode: "1522",
      cityKey: "lucens",
      cityLabel: "Lucens",
    },
  );
  assert.equal(getStatisticsLocation("delivery", "12", "Lucens"), null);
  assert.deepEqual(
    getStatisticsLocation("delivery", "1003", "  Lausanne  "),
    {
      postalCode: "1003",
      cityKey: "lausanne",
      cityLabel: "Lausanne",
    },
  );
});

test("ne conserve aucune localisation client pour un retrait", () => {
  assert.deepEqual(
    getStatisticsLocation(
      "pickup",
      "1201",
      "Une localité qui doit être ignorée",
    ),
    {
      postalCode: "",
      cityKey: "",
      cityLabel: "",
    },
  );
});

test("masque les localités sous le seuil public de confidentialité", () => {
  assert.equal(PUBLIC_LOCATION_MIN_HANDOFFS, 5);
  assert.equal(shouldDisplayStatisticsLocation(4), false);
  assert.equal(shouldDisplayStatisticsLocation(5), true);
  assert.equal(shouldDisplayStatisticsLocation(5.5), false);
});
