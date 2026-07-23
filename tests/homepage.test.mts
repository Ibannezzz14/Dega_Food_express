import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const projectRoot = resolve(import.meta.dirname, "..");
const heroSource = readFileSync(
  resolve(projectRoot, "app/home-hero.tsx"),
  "utf8",
);
const gallerySource = readFileSync(
  resolve(projectRoot, "app/gallery-section.tsx"),
  "utf8",
);
const homepageSources = [
  heroSource,
  gallerySource,
  readFileSync(resolve(projectRoot, "app/events-section.tsx"), "utf8"),
  readFileSync(resolve(projectRoot, "app/presentation-section.tsx"), "utf8"),
].join("\n");

test("le Hero reste sobre et n’affiche plus de photographie en arrière-plan", () => {
  assert.ok(!heroSource.includes("<Image"));
  assert.ok(
    !heroSource.includes("/images/editorial/tilapia-frais-glace-pexels.webp"),
  );
  assert.equal((heroSource.match(/<h1\b/g) ?? []).length, 1);
});

test("les actions du Hero mènent vers des pages existantes", () => {
  assert.match(
    heroSource,
    /className=\{styles\.primaryAction\} href="\/carte"/,
  );
  assert.match(
    heroSource,
    /className=\{styles\.secondaryAction\} href="\/presentation"/,
  );
});

test("l’ancienne photographie de poisson n’est plus affichée sur l’accueil", () => {
  assert.ok(
    !homepageSources.includes(
      "/images/editorial/alloco-tilapia-ivoirien.webp",
    ),
  );
});

test("le plat signature reprend le nouvel attiéké tilapia fourni", () => {
  assert.ok(
    gallerySource.includes(
      "/images/menu/attieke-tilapia-proprietaire.webp",
    ),
  );
  assert.ok(!gallerySource.includes("/images/menu/attieke-tilapia.webp"));
});

test("les visuels de l’accueil sont réels et correctement associés", () => {
  assert.ok(
    homepageSources.includes(
      "/images/menu/alloco-poisson-braise-proprietaire.webp",
    ),
  );
  assert.ok(
    homepageSources.includes(
      "/images/menu/drinks/bissap-pexels.webp",
    ),
  );
});
