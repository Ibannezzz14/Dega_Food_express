import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const projectRoot = resolve(import.meta.dirname, "..");
const photoWorkspace = resolve(
  projectRoot,
  "PHOTOS-DEGA-FOOD-A-INTEGRER",
);
const retouchWorkspace = resolve(projectRoot, "Photos à retoucher");

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

test("les originaux restent locaux et ne sont jamais exposés dans public/images", () => {
  const publicImageRoot = resolve(projectRoot, "public/images");
  const rootFiles = readdirSync(publicImageRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
  const gitignore = readFileSync(resolve(projectRoot, ".gitignore"), "utf8");

  assert.deepEqual(rootFiles, []);
  assert.ok(gitignore.includes("assets/source-images/"));
  assert.ok(gitignore.includes("Photos à retoucher/"));
});

test("les prises brutes restent dans un dossier local ignoré par Git", () => {
  const gitignore = readFileSync(resolve(projectRoot, ".gitignore"), "utf8");

  assert.ok(gitignore.includes("Photos à retoucher/"));

  if (existsSync(retouchWorkspace)) {
    assert.ok(existsSync(resolve(retouchWorkspace, "README.md")));
  }
});

test("les anciens fonds ne sont plus publiés", () => {
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
  }
});

test("les anciens dossiers locaux ne polluent plus l’arborescence du projet", () => {
  assert.equal(existsSync(resolve(projectRoot, "app/actions")), false);
  assert.equal(existsSync(resolve(projectRoot, ".impeccable")), false);
});
