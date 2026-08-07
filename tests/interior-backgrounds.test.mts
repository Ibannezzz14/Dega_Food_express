import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const projectRoot = resolve(import.meta.dirname, "..");

function read(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

function rule(source: string, selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`));

  assert.ok(match, `Règle CSS introuvable : ${selector}`);
  return match[1];
}

const siteConfig = read("config/site-config.ts");
const presentationCss = read("app/presentation/presentation.module.css");
const orderCss = read("components/order/order-experience.module.css");
const cateringCss = read("app/evenements/evenements.module.css");
const reviewsCss = read("app/avis/avis.module.css");
const contactCss = read("app/contact/contact.module.css");
const legalCss = read("app/legal.module.css");

test("les pages éditoriales reprennent le grunge sans uniformiser tous les fonds", () => {
  assert.match(rule(presentationCss, ".hero"), /home-grunge-hero\.webp/);
  assert.match(rule(presentationCss, ".callToAction"), /home-grunge-paper\.webp/);
  assert.match(rule(orderCss, ".menuPageIntro"), /home-grunge-hero\.webp/);
  assert.match(rule(cateringCss, ".hero"), /home-grunge-hero\.webp/);
  assert.match(rule(cateringCss, ".finalContacts"), /home-grunge-paper\.webp/);
  assert.match(rule(legalCss, ".hero"), /home-grunge-paper\.webp/);
});

test("la page Avis utilise la variante papier avec son propre voile vert", () => {
  assert.ok(
    siteConfig.includes(
      'testimonialsBackdrop: "/images/site/home-grunge-paper.webp"',
    ),
  );
  assert.match(rule(reviewsCss, ".hero::after"), /linear-gradient/);
  assert.match(rule(reviewsCss, ".testimonialsSection"), /#f6f0e5/);
});

test("la page Contact reprend le grunge sombre sans retourner son motif", () => {
  assert.ok(
    siteConfig.includes(
      'hospitalityBackdrop: "/images/site/home-grunge-hero.webp"',
    ),
  );
  assert.match(rule(contactCss, ".introBand::after"), /linear-gradient/);
  assert.doesNotMatch(rule(contactCss, ".introBackdrop"), /scaleX/);
});

test("les surfaces de lecture et d’action restent calmes et opaques", () => {
  assert.doesNotMatch(rule(cateringCss, ".formPanel"), /home-grunge|url\(/);
  assert.doesNotMatch(rule(cateringCss, ".field textarea"), /home-grunge|url\(/);
  assert.doesNotMatch(rule(orderCss, ".menuSection"), /home-grunge|url\(/);
  assert.doesNotMatch(rule(legalCss, ".content"), /home-grunge|url\(/);
  assert.match(rule(contactCss, ".directory"), /#f6f0e5/);
});

test("le grunge reste absent du chrome global et de l’administration", () => {
  const protectedSources = [
    "components/layout/site-header.module.css",
    "components/layout/site-footer.module.css",
    "app/statistiques/statistiques.module.css",
    "app/statistiques/avis/avis-admin.module.css",
  ].map(read);

  for (const source of protectedSources) {
    assert.doesNotMatch(source, /home-grunge/);
  }
});
