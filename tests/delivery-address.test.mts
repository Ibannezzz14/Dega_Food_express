import assert from "node:assert/strict";
import test from "node:test";
import {
  getDeliveryAddressIssue,
  normalizeDeliveryAddress,
  normalizeTextInput,
} from "../lib/delivery-address.ts";

test("normalise les champs texte sans convertir des valeurs inattendues", () => {
  assert.equal(normalizeTextInput("  Rue   du Lac  4  "), "Rue du Lac 4");
  assert.equal(normalizeTextInput(1234), "");
  assert.equal(normalizeTextInput(null), "");
});

test("valide une adresse de livraison avec rue, numéro, NPA et localité", () => {
  const address = normalizeDeliveryAddress({
    streetAddress: "  Rue de Bourg 10 ",
    postalCode: " 1003 ",
    city: " Lausanne ",
  });

  assert.deepEqual(address, {
    streetAddress: "Rue de Bourg 10",
    postalCode: "1003",
    city: "Lausanne",
  });
  assert.equal(getDeliveryAddressIssue(address), null);
});

test("identifie précisément le premier champ d’adresse invalide", () => {
  assert.equal(
    getDeliveryAddressIssue({
      streetAddress: "Rue de Bourg",
      postalCode: "1003",
      city: "Lausanne",
    }),
    "street_address",
  );
  assert.equal(
    getDeliveryAddressIssue({
      streetAddress: "Rue de Bourg 10",
      postalCode: "100",
      city: "Lausanne",
    }),
    "postal_code",
  );
  assert.equal(
    getDeliveryAddressIssue({
      streetAddress: "Rue de Bourg 10",
      postalCode: "1003",
      city: "L",
    }),
    "city",
  );
});
