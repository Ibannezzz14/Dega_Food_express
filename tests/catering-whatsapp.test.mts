import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import {
  buildCateringWhatsAppMessage,
  formatSwissDate,
} from "../lib/catering-whatsapp.ts";

const projectRoot = resolve(import.meta.dirname, "..");
const cateringFormSource = readFileSync(
  resolve(projectRoot, "app/evenements/catering-form.tsx"),
  "utf8",
);
const cateringPageSource = readFileSync(
  resolve(projectRoot, "app/evenements/page.tsx"),
  "utf8",
);
const cateringCss = readFileSync(
  resolve(projectRoot, "app/evenements/evenements.module.css"),
  "utf8",
);

test("les demandes traiteur utilisent leur numéro WhatsApp dédié", () => {
  assert.ok(cateringFormSource.includes("createCateringWhatsAppHref"));
  assert.equal(cateringFormSource.includes("createOrderWhatsAppHref"), false);
  assert.equal(cateringFormSource.includes("DELIVERY_SETTINGS"), false);
  assert.ok(cateringFormSource.includes("Livraison selon le lieu et le devis"));
  assert.equal(cateringFormSource.includes("CATERING_CONTACT"), false);
  assert.equal(cateringFormSource.includes("ORDER_CONTACT"), false);
  assert.equal(cateringFormSource.includes("CATERING_AREA_SETTINGS"), false);
  assert.equal(cateringFormSource.includes("contactSummary"), false);
});

test("la fin de la page traiteur affiche directement les deux numéros", () => {
  assert.ok(cateringPageSource.includes("ORDER_CONTACT.phoneHref"));
  assert.ok(cateringPageSource.includes("ORDER_CONTACT.displayPhone"));
  assert.ok(cateringPageSource.includes("CATERING_CONTACT.phoneHref"));
  assert.ok(cateringPageSource.includes("CATERING_CONTACT.displayPhone"));
  assert.ok(cateringPageSource.includes("ORDER_CONTACT.label"));
  assert.ok(cateringPageSource.includes("Service traiteur"));
  assert.ok(
    cateringPageSource.includes(
      "les commandes, la livraison ou le service traiteur",
    ),
  );
  assert.ok(
    cateringPageSource.includes("CATERING_AREA_SETTINGS.availabilityMessage"),
  );
  assert.equal(cateringPageSource.includes("DELIVERY_SETTINGS"), false);
  assert.equal(cateringPageSource.includes("ORDER_WHATSAPP_HREF"), false);
});

test("la mise en page traiteur garde ses protections responsive", () => {
  assert.ok(cateringCss.includes("var(--container-wide)"));
  assert.match(cateringCss, /@media \(max-width: 56rem\)/);
  assert.doesNotMatch(cateringCss, /!important|width:\s*100vw/);
  assert.doesNotMatch(cateringCss, /min-height:\s*27rem|scroll-margin-top/);
  assert.ok(
    cateringFormSource.includes(
      'placeholder="Ville, canton, adresse (si connue)"',
    ),
  );
});

test("chaque erreur de prestation reste limitée à son propre groupe", () => {
  assert.ok(
    cateringFormSource.includes(
      'errors.dishes ? styles.choiceGroupError : ""',
    ),
  );
  assert.ok(
    cateringFormSource.includes(
      'errors.services ? styles.choiceGroupError : ""',
    ),
  );
  assert.ok(cateringCss.includes(".choiceGroupError .checkOption"));
  assert.ok(
    cateringFormSource.includes(
      '"catering-dishes-help catering-dishes-error"',
    ),
  );
  assert.ok(
    cateringFormSource.includes(
      '"catering-services-help catering-services-error"',
    ),
  );
  assert.equal(cateringFormSource.includes("styles.fieldsetError"), false);
  assert.equal(cateringCss.includes(".fieldsetError"), false);
});

test("les liens du résumé déplacent le focus vers le contrôle en erreur", () => {
  assert.ok(cateringFormSource.includes("handleErrorLinkClick(event, field)"));
  assert.ok(cateringFormSource.includes("document.getElementById(fieldTargets[field])"));
  assert.ok(
    cateringFormSource.includes(
      'errorTarget.querySelector<HTMLElement>(\'input[type="checkbox"]\')',
    ),
  );
  assert.ok(cateringFormSource.includes("(focusTarget ?? errorTarget).focus()"));
});

test("formatSwissDate converts an ISO date to the Swiss display format", () => {
  assert.equal(formatSwissDate("2026-09-05"), "05.09.2026");
  assert.equal(formatSwissDate("date à confirmer"), "date à confirmer");
});

test("buildCateringWhatsAppMessage includes the complete catering request", () => {
  const message = buildCateringWhatsAppMessage({
    firstName: "Awa",
    lastName: "Koné",
    phone: "+41 79 123 45 67",
    email: "awa@example.com",
    eventType: "Mariage",
    eventDate: "2026-09-05",
    location: "Lucens",
    guestCount: "80",
    dishes: ["Attiéké tilapia", "Dégué"],
    services: [
      "Livraison selon le lieu et le devis",
      "Présentation en buffet",
    ],
    details: "Une personne est allergique aux arachides.",
  });

  assert.match(message, /Prénom et nom : Awa Koné/);
  assert.match(message, /Date souhaitée : 05\.09\.2026/);
  assert.match(message, /• Attiéké tilapia/);
  assert.match(message, /• Présentation en buffet/);
  assert.match(message, /• Livraison selon le lieu et le devis/);
  assert.match(message, /allergique aux arachides/);
  assert.doesNotMatch(message, /Contact souhaité/);
});

test("buildCateringWhatsAppMessage omits optional empty sections", () => {
  const message = buildCateringWhatsAppMessage({
    firstName: "Jean",
    lastName: "Yao",
    phone: "076 000 00 00",
    eventType: "Anniversaire",
    eventDate: "2026-10-12",
    location: "Lucens",
    guestCount: "20",
    dishes: ["Autre plat ou menu à discuter"],
    services: ["À définir avec l’équipe"],
  });

  assert.doesNotMatch(message, /E-mail/);
  assert.doesNotMatch(message, /Informations complémentaires/);
});
