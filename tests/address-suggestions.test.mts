import assert from "node:assert/strict";
import test from "node:test";
import {
  POSTAL_LOCALITY_LAYER,
  applyAddressLookupSuggestion,
  normalizeAddressQuery,
  parseGeoAdminAddress,
  parseGeoAdminPostalLocality,
} from "../lib/address-suggestions.ts";

test("transforme une réponse GeoAdmin en adresse structurée", () => {
  const suggestion = parseGeoAdminAddress({
    attrs: {
      featureId: "884499_0",
      label: "Rue de Bourg 10 <b>1003 Lausanne</b>",
      lat: 46.52004623413086,
      lon: 6.634718894958496,
      num: 10,
      origin: "address",
    },
  });

  assert.deepEqual(suggestion, {
    key: "884499_0-46.52004623413086-6.634718894958496",
    label: "Rue de Bourg 10, 1003 Lausanne",
    streetAddress: "Rue de Bourg 10",
    postalCode: "1003",
    city: "Lausanne",
    coordinates: {
      latitude: 46.52004623413086,
      longitude: 6.634718894958496,
    },
  });
});

test("conserve les numéros complexes et nettoie le HTML", () => {
  const suggestion = parseGeoAdminAddress({
    attrs: {
      featureId: "address-complex",
      label:
        "<script>alert(1)</script>Rue du Lac 10.1 &amp; 12a <b>2502 Biel/Bienne</b>",
      lat: 47.1368,
      lon: 7.2468,
      num: 101,
      origin: "address",
    },
  });

  assert.equal(suggestion?.streetAddress, "Rue du Lac 10.1 & 12a");
  assert.equal(suggestion?.postalCode, "2502");
  assert.equal(suggestion?.city, "Biel/Bienne");
  assert.ok(!suggestion?.label.includes("<"));
});

test("ignore les résultats qui ne sont pas des adresses utilisables", () => {
  assert.equal(
    parseGeoAdminAddress({
      attrs: {
        label: "Landstrasse # <b>8595 Altnau</b>",
        lat: 47.6172,
        lon: 9.2699,
        num: 0,
        origin: "address",
      },
    }),
    null,
  );

  assert.equal(
    parseGeoAdminAddress({
      attrs: {
        label: "Rue de Bourg 10 <b>1003 Lausanne</b>",
        lat: 46.52,
        lon: 6.63,
        num: 10,
        origin: "gazetteer",
      },
    }),
    null,
  );
});

test("normalise la recherche avant l’envoi", () => {
  assert.equal(
    normalizeAddressQuery("  Rue   de   Bourg  10  "),
    "Rue de Bourg 10",
  );
});

test("transforme un résultat NPA en NPA et localité", () => {
  const suggestion = parseGeoAdminPostalLocality({
    attrs: {
      featureId: "150",
      label: "<b>1003 - Lausanne</b>",
      lat: 46.520008,
      lon: 6.630101,
      origin: "zipcode",
    },
  });

  assert.deepEqual(suggestion, {
    kind: "locality",
    key: "locality-150-1003-Lausanne",
    label: "1003 Lausanne",
    postalCode: "1003",
    city: "Lausanne",
  });
});

test("transforme une localité officielle et conserve les noms composés", () => {
  const suggestion = parseGeoAdminPostalLocality({
    attrs: {
      detail: "1522 oulens-sur-lucens",
      featureId: "708",
      label: "1522",
      layer: POSTAL_LOCALITY_LAYER,
      lat: 46.707394,
      lon: 6.815282,
      origin: "feature",
    },
  });

  assert.equal(suggestion?.postalCode, "1522");
  assert.equal(suggestion?.city, "Oulens-sur-Lucens");
});

test("rejette une proposition de localité provenant d’une autre source", () => {
  assert.equal(
    parseGeoAdminPostalLocality({
      attrs: {
        detail: "1003 lausanne",
        featureId: "150",
        layer: "another.layer",
        lat: 46.52,
        lon: 6.63,
        origin: "feature",
      },
    }),
    null,
  );
});

test("une proposition NPA localité préserve la rue déjà saisie", () => {
  assert.deepEqual(
    applyAddressLookupSuggestion(
      {
        streetAddress: "Rue Centrale 12",
        postalCode: "",
        city: "",
      },
      {
        kind: "locality",
        key: "locality-150-1003-Lausanne",
        label: "1003 Lausanne",
        postalCode: "1003",
        city: "Lausanne",
      },
    ),
    {
      streetAddress: "Rue Centrale 12",
      postalCode: "1003",
      city: "Lausanne",
    },
  );
});

test("une proposition d’adresse remplit les trois champs", () => {
  assert.deepEqual(
    applyAddressLookupSuggestion(
      {
        streetAddress: "",
        postalCode: "100",
        city: "Laus",
      },
      {
        kind: "address",
        key: "address-result",
        label: "Rue de Bourg 10, 1003 Lausanne",
        streetAddress: "Rue de Bourg 10",
        postalCode: "1003",
        city: "Lausanne",
        coordinates: {
          latitude: 46.52,
          longitude: 6.63,
        },
      },
    ),
    {
      streetAddress: "Rue de Bourg 10",
      postalCode: "1003",
      city: "Lausanne",
    },
  );
});

test("conserve deux localités distinctes partageant le même NPA", () => {
  const lucens = parseGeoAdminPostalLocality({
    attrs: {
      detail: "1522 lucens",
      featureId: "712",
      layer: POSTAL_LOCALITY_LAYER,
      lat: 46.708527,
      lon: 6.836576,
      origin: "feature",
    },
  });
  const oulens = parseGeoAdminPostalLocality({
    attrs: {
      detail: "1522 oulens-sur-lucens",
      featureId: "708",
      layer: POSTAL_LOCALITY_LAYER,
      lat: 46.707394,
      lon: 6.815282,
      origin: "feature",
    },
  });

  assert.notEqual(lucens?.key, oulens?.key);
  assert.deepEqual(
    [lucens?.city, oulens?.city],
    ["Lucens", "Oulens-sur-Lucens"],
  );
});
