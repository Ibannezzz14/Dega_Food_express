import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const projectRoot = resolve(import.meta.dirname, "..");
const pageSource = readFileSync(
  resolve(projectRoot, "app/contact/page.tsx"),
  "utf8",
);
const styleSource = readFileSync(
  resolve(projectRoot, "app/contact/contact.module.css"),
  "utf8",
);

test("la page Contact présente les commandes et Instagram sans faux numéro", () => {
  assert.ok(pageSource.includes("ORDER_CONTACT.displayPhone"));
  assert.ok(pageSource.includes("ORDER_WHATSAPP_HREF"));
  assert.ok(pageSource.includes("CATERING_CONTACT.displayPhone"));
  assert.ok(pageSource.includes("CATERING_WHATSAPP_HREF"));
  assert.ok(pageSource.includes("Écrire sur WhatsApp"));
  assert.ok(pageSource.includes("contact correspondant"));
  assert.ok(pageSource.includes("DELIVERY_SETTINGS.availabilityMessage"));
  assert.ok(pageSource.includes("INSTAGRAM.href"));
  assert.ok(pageSource.includes("CATERING_AREA_SETTINGS.label"));
  assert.equal(pageSource.includes("PAYMENT_CONTACT"), false);
  assert.equal(pageSource.includes("PAYMENT_PHONE_LABEL"), false);
  assert.equal(pageSource.includes('id="payment"'), false);
  assert.ok(pageSource.includes("next/image"));
  assert.ok(pageSource.includes("SITE_CONFIG.images.hospitalityBackdrop"));
});

test("la demande traiteur ouvre directement son contact dédié", () => {
  assert.ok(pageSource.includes("CATERING_WHATSAPP_HREF"));
  assert.equal(pageSource.includes("cateringPrompt"), false);
});

test("la feuille Contact ne conserve plus les styles de l’ancien formulaire", () => {
  assert.ok(!styleSource.includes(".formPanel"));
  assert.ok(!styleSource.includes(".submitButton"));
  assert.ok(!styleSource.includes(".fieldGrid"));
});
