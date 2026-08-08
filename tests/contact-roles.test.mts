import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const projectRoot = resolve(import.meta.dirname, "..");
const contactSource = readFileSync(
  resolve(projectRoot, "config/site-config.ts"),
  "utf8",
);
const orderActionSource = readFileSync(
  resolve(projectRoot, "app/carte/order-actions.ts"),
  "utf8",
);
const footerSource = readFileSync(
  resolve(projectRoot, "components/layout/site-footer.tsx"),
  "utf8",
);

test("les contacts sont centralisés et le numéro de commande accepte aussi le traiteur", () => {
  assert.ok(contactSource.includes("ORDER_CONTACT"));
  assert.ok(contactSource.includes('createSwissPhone("41766036011")'));
  assert.ok(contactSource.includes('createSwissPhone("41782654081")'));
  assert.ok(
    contactSource.includes('label: "Commandes & service traiteur"'),
  );
  assert.ok(contactSource.includes('label: "Service traiteur"'));
  assert.ok(contactSource.includes("CATERING_CONTACT"));
  assert.equal(contactSource.includes("PAYMENT_CONTACT"), false);
  assert.equal(contactSource.includes("PAYMENT_PHONE"), false);
});

test("les commandes WhatsApp utilisent toujours le contact principal", () => {
  assert.ok(orderActionSource.includes("createOrderWhatsAppHref(message)"));
  assert.ok(!orderActionSource.includes("region.phone"));
  assert.ok(contactSource.includes('regionId: DELIVERY_REGION_ID'));
  assert.equal(
    (contactSource.match(/label: "Commandes & service traiteur"/g) ?? [])
      .length,
    1,
  );
});

test("le footer affiche le contact traiteur séparément", () => {
  assert.ok(footerSource.includes("CATERING_WHATSAPP_HREF"));
  assert.ok(footerSource.includes("CATERING_CONTACT.displayPhone"));
  assert.ok(footerSource.includes("CATERING_AREA_SETTINGS.label"));
  assert.ok(footerSource.includes("ORDER_CONTACT.label"));
  assert.equal(footerSource.includes("DELIVERY_SETTINGS"), false);
  assert.equal(footerSource.includes("Retour en haut"), false);
  assert.equal(footerSource.includes("backToTop"), false);
});
