import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCateringWhatsAppMessage,
  formatSwissDate,
} from "../lib/catering-whatsapp.ts";

test("formatSwissDate converts an ISO date to the Swiss display format", () => {
  assert.equal(formatSwissDate("2026-09-05"), "05.09.2026");
  assert.equal(formatSwissDate("date à confirmer"), "date à confirmer");
});

test("buildCateringWhatsAppMessage includes the complete catering request", () => {
  const message = buildCateringWhatsAppMessage({
    contactArea: "Lausanne",
    firstName: "Awa",
    lastName: "Koné",
    phone: "+41 79 123 45 67",
    email: "awa@example.com",
    eventType: "Mariage",
    eventDate: "2026-09-05",
    location: "Lausanne",
    guestCount: "80",
    dishes: ["Attiéké tilapia", "Dégué"],
    services: ["Livraison", "Présentation en buffet"],
    details: "Une personne est allergique aux arachides.",
  });

  assert.match(message, /Prénom et nom : Awa Koné/);
  assert.match(message, /Date souhaitée : 05\.09\.2026/);
  assert.match(message, /• Attiéké tilapia/);
  assert.match(message, /• Présentation en buffet/);
  assert.match(message, /allergique aux arachides/);
});

test("buildCateringWhatsAppMessage omits optional empty sections", () => {
  const message = buildCateringWhatsAppMessage({
    contactArea: "Lucens et alentours",
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
