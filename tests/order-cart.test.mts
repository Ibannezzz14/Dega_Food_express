import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const projectRoot = resolve(import.meta.dirname, "..");
const experienceSource = readFileSync(
  resolve(projectRoot, "components/order/order-experience.tsx"),
  "utf8",
);
const cartSource = readFileSync(
  resolve(projectRoot, "components/order/order-cart.tsx"),
  "utf8",
);
const actionSource = readFileSync(
  resolve(projectRoot, "app/carte/order-actions.ts"),
  "utf8",
);
const cartePageSource = readFileSync(
  resolve(projectRoot, "app/carte/page.tsx"),
  "utf8",
);
const experienceStyleSource = readFileSync(
  resolve(projectRoot, "components/order/order-experience.module.css"),
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
  assert.ok(experienceSource.includes("<strong>{method.label}</strong>"));
  assert.equal(experienceSource.includes("PAYMENT_PHONE_LABEL"), false);
  assert.ok(cartSource.includes("getDeliveryPaymentMethodLabel"));
  assert.ok(actionSource.includes("isDeliveryPaymentMethod"));
  assert.ok(actionSource.includes("Paiement :"));
});

test("les demandes de prix passent par le numéro unique de commande", () => {
  assert.ok(experienceSource.includes("createOrderWhatsAppHref"));
  assert.ok(experienceSource.includes("ORDER_CONTACT.displayPhone"));
  assert.equal(experienceSource.includes("INSTAGRAM.href"), false);
});

test("un lien direct peut ouvrir la carte avec la livraison présélectionnée", () => {
  assert.ok(cartePageSource.includes("await searchParams"));
  assert.ok(cartePageSource.includes("firstValue(params.mode)"));
  assert.ok(cartePageSource.includes('=== "livraison"'));
  assert.ok(cartePageSource.includes("isDeliveryRegionId(zone)"));
  assert.ok(cartePageSource.includes("initialFulfillmentMethod={initialFulfillmentMethod}"));
  assert.ok(cartePageSource.includes("initialRegion={initialRegion}"));
  assert.ok(experienceSource.includes("initialFulfillmentMethod"));
  assert.ok(experienceSource.includes("DELIVERY_PAYMENT_METHODS"));
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

test("une adresse hors de la zone habituelle peut devenir une demande à confirmer", () => {
  assert.ok(experienceSource.includes('zoneCheck.status === "on_request"'));
  assert.ok(experienceSource.includes("Faisabilité et frais"));
  assert.ok(experienceSource.includes("DELIVERY_SETTINGS.availabilityMessage"));
  assert.ok(
    experienceSource.includes(
      "DELIVERY_ZONES[zoneCheck.region].label",
    ),
  );
  assert.ok(cartSource.includes('deliveryFee === null'));
  assert.ok(cartSource.includes("À confirmer"));
  assert.ok(experienceSource.includes("Sous-total des plats"));
  assert.ok(actionSource.includes('zoneValidation.status === "on_request"'));
  assert.ok(actionSource.includes("faisabilité et frais"));
  assert.equal(experienceSource.includes("unsupported_locality"), false);
  assert.equal(experienceSource.includes('zoneCheck.status === "outside"'), false);
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
