import assert from "node:assert/strict";
import test from "node:test";
import {
  getStatisticsLocation,
  normalizeStatisticsCityKey,
  parseStatisticsPeriod,
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
    getStatisticsLocation("delivery", "1003", "  Lausanne  "),
    {
      postalCode: "1003",
      cityKey: "lausanne",
      cityLabel: "Lausanne",
    },
  );
  assert.equal(getStatisticsLocation("delivery", "12", "Lausanne"), null);
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
