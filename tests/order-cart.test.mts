import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const projectRoot = resolve(import.meta.dirname, "..");
const experienceSource = readFileSync(
  resolve(projectRoot, "app/order-experience.tsx"),
  "utf8",
);
const cartSource = readFileSync(
  resolve(projectRoot, "app/order-cart.tsx"),
  "utf8",
);
const actionSource = readFileSync(
  resolve(projectRoot, "app/actions.ts"),
  "utf8",
);
const carteContentSource = readFileSync(
  resolve(projectRoot, "app/carte/carte-content.tsx"),
  "utf8",
);
const experienceStyleSource = readFileSync(
  resolve(projectRoot, "app/order-experience.module.css"),
  "utf8",
);

test("le bandeau de commande ouvre le panier avant tout envoi", () => {
  assert.ok(experienceSource.includes("Voir le panier"));
  assert.ok(experienceSource.includes('aria-haspopup="dialog"'));
  assert.ok(experienceSource.includes("setIsCartOpen(true)"));
  assert.ok(!experienceSource.includes("Envoyer sur WhatsApp"));
});

test("le panier permet de relire et modifier chaque article", () => {
  assert.ok(cartSource.includes("<dialog"));
  assert.ok(cartSource.includes("lines.map"));
  assert.ok(cartSource.includes("onChangeQuantity(itemId, -1)"));
  assert.ok(cartSource.includes("onChangeQuantity(item.id, 1)"));
  assert.ok(cartSource.includes("Sous-total"));
  assert.ok(cartSource.includes("deliveryFee"));
});

test("la validation WhatsApp se trouve dans le récapitulatif", () => {
  assert.ok(cartSource.includes('type="submit"'));
  assert.ok(cartSource.includes("Valider sur WhatsApp"));
  assert.ok(cartSource.includes("isOrderReady"));
  assert.ok(cartSource.includes("setupActionLabel"));
});

test("la livraison exige un mode de paiement validé côté client et serveur", () => {
  assert.ok(experienceSource.includes('name="paymentMethod"'));
  assert.ok(experienceSource.includes("hasValidPaymentMethod"));
  assert.ok(experienceSource.includes("Une capture d’écran ne"));
  assert.ok(cartSource.includes("getDeliveryPaymentMethodLabel"));
  assert.ok(actionSource.includes("isDeliveryPaymentMethod"));
  assert.ok(actionSource.includes("Paiement :"));
});

test("un lien direct peut ouvrir la carte avec la livraison présélectionnée", () => {
  assert.ok(carteContentSource.includes('searchParams.get("mode")'));
  assert.ok(carteContentSource.includes('"livraison"'));
  assert.ok(experienceSource.includes("initialFulfillmentMethod"));
  assert.ok(experienceSource.includes("Espèces ou TWINT"));
});

test("le panier gère explicitement son état vide", () => {
  assert.ok(cartSource.includes("Votre panier est vide."));
  assert.ok(cartSource.includes("Retourner à la carte"));
  assert.ok(cartSource.includes("onReturnToMenu"));
});

test("la suppression d’une ligne conserve un point de focus clavier", () => {
  assert.ok(cartSource.includes("lineButtonRefs"));
  assert.ok(cartSource.includes("emptyReturnButtonRef"));
  assert.ok(cartSource.includes("nextFocusId"));
});

test("une erreur de validation disparaît après correction de la commande", () => {
  assert.ok(experienceSource.includes("orderRevision"));
  assert.ok(experienceSource.includes("submittedRevision"));
  assert.ok(experienceSource.includes("visibleActionState"));
});

test("la zone visible suit la zone réellement détectée pour la livraison", () => {
  assert.ok(experienceSource.includes("setRegion(result.suggestedRegion)"));
  assert.ok(
    experienceSource.includes(
      "DELIVERY_ZONES[zoneCheck.region].label",
    ),
  );
});

test("le survol ne masque pas la catégorie sélectionnée", () => {
  assert.ok(
    experienceStyleSource.includes(
      "button:not(.categoryActive):hover",
    ),
  );
  assert.ok(
    !experienceStyleSource.includes(".categoryRail button:hover {"),
  );
});
