import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const projectRoot = resolve(import.meta.dirname, "..");
const photoWorkspace = resolve(
  projectRoot,
  "PHOTOS-DEGA-FOOD-A-INTEGRER",
);

test("le dossier photo sert uniquement de boîte de dépôt", () => {
  assert.ok(existsSync(resolve(photoWorkspace, "README.md")));
  assert.equal(
    existsSync(resolve(photoWorkspace, "01-PHOTOS-UTILISEES-SUR-LE-SITE")),
    false,
  );
  assert.equal(
    existsSync(resolve(photoWorkspace, "02-SOURCES-ET-ARCHIVES")),
    false,
  );
  assert.equal(
    existsSync(resolve(photoWorkspace, "03-NOUVELLES-PHOTOS-A-INTEGRER")),
    false,
  );

  for (const category of ["entrees", "plats", "desserts", "boissons"]) {
    assert.ok(
      existsSync(resolve(photoWorkspace, "A-INTEGRER", category, ".gitkeep")),
      `Dossier de dépôt manquant : ${category}`,
    );
  }
});

test("les originaux ne sont jamais exposés directement dans public/images", () => {
  const publicImageRoot = resolve(projectRoot, "public/images");
  const rootFiles = readdirSync(publicImageRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);

  assert.deepEqual(rootFiles, []);

  for (const source of [
    "aller-retour-source.png",
    "pastel-source.jpeg",
    "foutou-sauce-graine-source.jpg",
  ]) {
    assert.ok(existsSync(resolve(projectRoot, "assets/source-images/raw", source)));
  }
});

test("les anciens fonds sont archivés hors du dossier public", () => {
  const archivedBackgrounds = [
    "activity-route-textile.webp",
    "hero-textile-ivoirien.webp",
    "hospitality-table-textile.webp",
    "testimonials-clay-textile.webp",
  ];

  for (const filename of archivedBackgrounds) {
    assert.equal(
      existsSync(resolve(projectRoot, "public/images/site", filename)),
      false,
    );
    assert.ok(
      existsSync(
        resolve(
          projectRoot,
          "assets/source-images/legacy/public-images/site",
          filename,
        ),
      ),
    );
  }
});

test("les anciens dossiers locaux ne polluent plus l’arborescence du projet", () => {
  assert.equal(existsSync(resolve(projectRoot, "app/actions")), false);
  assert.equal(existsSync(resolve(projectRoot, ".impeccable")), false);
});
