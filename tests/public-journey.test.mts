import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const projectRoot = resolve(import.meta.dirname, "..");

function readProjectFile(path: string) {
  return readFileSync(resolve(projectRoot, path), "utf8");
}

test("chaque contenu principal peut recevoir le focus après navigation", () => {
  const appRoot = resolve(projectRoot, "app");
  const files = readdirSync(appRoot, { recursive: true, encoding: "utf8" })
    .filter((path) => path.endsWith(".tsx"));

  for (const path of files) {
    const source = readFileSync(resolve(appRoot, path), "utf8");
    const mainCount = (source.match(/<main\b/g) ?? []).length;

    if (mainCount === 0) {
      continue;
    }

    assert.equal(
      (source.match(/tabIndex=\{-1\}/g) ?? []).length,
      mainCount,
      `${path} doit rendre chaque <main> focalisable`,
    );
  }
});

test("les pages d’action expliquent la prochaine étape sans ambiguïté", () => {
  const orderExperience = readProjectFile(
    "components/order/order-experience.tsx",
  );
  const contactPage = readProjectFile("app/contact/page.tsx");
  const reviewsPage = readProjectFile("app/avis/page.tsx");

  assert.ok(orderExperience.includes("menuPageIntroText"));
  assert.ok(orderExperience.includes("ensuite envoyée sur WhatsApp"));
  assert.ok(contactPage.includes("contact correspondant"));
  assert.ok(contactPage.includes("Écrire sur WhatsApp"));
  assert.ok(reviewsPage.includes("Témoignages de nos clients"));
  assert.ok(reviewsPage.includes("reçus directement sur Instagram"));
});

test("le vocabulaire public reste stable entre navigation et appels à l’action", () => {
  const siteConfig = readProjectFile("config/site-config.ts");
  const footer = readProjectFile("components/layout/site-footer.tsx");
  const presentation = readProjectFile(
    "app/presentation/presentation-story.tsx",
  );

  assert.ok(
    siteConfig.includes('{ href: "/presentation", label: "Notre histoire" }'),
  );
  assert.ok(
    siteConfig.includes('{ href: "/avis", label: "Témoignages" }'),
  );
  assert.ok(footer.includes("Voir la carte"));
  assert.ok(presentation.includes("Voir la carte"));
  assert.ok(!footer.includes("Voir le menu"));
});

test("les avatars réservent leur espace avant le chargement", () => {
  const reviewCard = readProjectFile("components/reviews/review-card.tsx");

  assert.ok(reviewCard.includes("width={48}"));
  assert.ok(reviewCard.includes("height={48}"));
});

test("la page de confidentialité renvoie vers le portail GeoAdmin actuel", () => {
  const privacyPage = readProjectFile("app/confidentialite/page.tsx");

  assert.ok(privacyPage.includes('href="https://www.geo.admin.ch/fr/"'));
  assert.ok(!privacyPage.includes("geo-admin-ch-2"));
});
