import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import vm from "node:vm";

const root = resolve(import.meta.dirname, "..");
const routeFiles = ["entrees", "plats", "desserts", "boissons"].map((route) => `carte/${route}.html`);
const htmlFiles = ["index.html", "menu.html", ...routeFiles];
const pages = htmlFiles.map((file) => ({ file, source: readFileSync(resolve(root, file), "utf8") }));
const script = readFileSync(resolve(root, "assets/js/site.js"), "utf8");
const menuPageScript = readFileSync(resolve(root, "assets/js/menu-page.js"), "utf8");
const menuDataSource = readFileSync(resolve(root, "assets/js/menu-data.js"), "utf8");
const styles = readFileSync(resolve(root, "assets/css/site.css"), "utf8");

const context = { window: {} };
vm.runInNewContext(menuDataSource, context);
const menu = context.window.DEGA_MENU;

const localReferences = new Set(
  pages.flatMap(({ source }) => [...source.matchAll(/assets\/[A-Za-z0-9_./?=-]+/g)].map(([reference]) => reference.split("?")[0])),
);

for (const reference of localReferences) {
  assert.ok(existsSync(resolve(root, reference)), `Fichier local manquant : ${reference}`);
}

for (const localFile of ["assets/js/menu-data.js", "assets/js/menu-page.js", ...routeFiles]) {
  assert.ok(existsSync(resolve(root, localFile)), `Fichier attendu manquant : ${localFile}`);
}

for (const source of [script, menuPageScript]) {
  assert.doesNotMatch(source, /innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function/);
}
assert.doesNotMatch(styles, /transition\s*:\s*all\b/i);

for (const { file, source } of pages) {
  assert.match(source, /Content-Security-Policy/, `CSP manquante : ${file}`);
  assert.doesNotMatch(source, /unsafe-inline|unsafe-eval/);
  assert.doesNotMatch(source, /<style\b|style\s*=|<script(?!\s+src=)/i);
  assert.doesNotMatch(source, /\son[a-z]+\s*=/i);

  for (const match of source.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    assert.match(match[0], /rel="[^"]*noopener[^"]*noreferrer[^"]*"/);
  }

  for (const match of source.matchAll(/<img\b[^>]*>/g)) {
    assert.match(match[0], /\bwidth="\d+"/);
    assert.match(match[0], /\bheight="\d+"/);
  }

  const ids = [...source.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id);
  assert.equal(new Set(ids).size, ids.length, `Identifiant HTML dupliqué : ${file}`);

  for (const [, href] of source.matchAll(/<a\b[^>]*\bhref="([^"]+\.html)(?:#[^"]*)?"[^>]*>/g)) {
    assert.ok(existsSync(resolve(root, dirname(file), href)), `Lien HTML local manquant depuis ${file} : ${href}`);
  }
}

const home = pages.find(({ file }) => file === "index.html").source;
for (const sectionId of ["accueil", "specialites", "prestations", "galerie", "contact", "questions"]) {
  assert.match(home, new RegExp(`id="${sectionId}"`));
}

for (const route of ["entrees", "plats", "desserts", "boissons"]) {
  const page = pages.find(({ file }) => file === `carte/${route}.html`).source;
  assert.match(page, new RegExp(`data-menu-category="${route}"`));
  assert.match(page, new RegExp(`href="${route}\\.html" aria-current="page"`));
  assert.match(page, /id="menu-items"/);
  assert.match(page, /assets\/js\/menu-data\.js/);
  assert.match(page, /assets\/js\/menu-page\.js/);
}

for (const route of routeFiles) {
  assert.match(home, new RegExp(`href="${route.replace(".", "\\.")}"`));
}

const fullSource = pages.map(({ source }) => source).join("\n");
const anchorTags = [...fullSource.matchAll(/<a\b[^>]*>/g)].map(([tag]) => tag);
const orderRoutes = [
  { region: "lausanne", phone: "tel:+41782654081", whatsapp: "https://wa.me/41782654081" },
  { region: "lucens", phone: "tel:+41766036011", whatsapp: "https://wa.me/41766036011" },
];

for (const route of orderRoutes) {
  for (const [channel, destination] of [["phone", route.phone], ["whatsapp", route.whatsapp]]) {
    assert.ok(
      anchorTags.some((tag) => tag.includes(`data-order-region="${route.region}"`) && tag.includes(`data-order-channel="${channel}"`) && tag.includes(`href="${destination}`)),
      `Parcours ${channel} manquant ou incorrect pour ${route.region}`,
    );
  }
}

assert.ok(Array.isArray(menu));
assert.equal(menu.length, 26);
assert.equal(new Set(menu.map(({ id }) => id)).size, menu.length, "Identifiants de produits dupliqués");

const existingItems = new Map([
  ["beignets", 5], ["attieke-tilapia", 25], ["attieke-poulet-choukouya", 25], ["attieke-agneau-choukouya", 25],
  ["alloco-tilapia", 5], ["alloco-poulet-choukouya", 25], ["alloco-agneau-choukouya", 25], ["placali-sauce-kope", 30],
  ["deguee", 6], ["eau-plate", 2.5], ["bissap-33", 5], ["bissap-1l", 14], ["gingembre-33", 5], ["gingembre-1l", 14],
  ["vin-rouge-primitivo-merlot", 25], ["vin-rose-oeil-perdrix", 25], ["guinness", 6], ["super-bock", 5],
]);

for (const [id, price] of existingItems) {
  const item = menu.find((candidate) => candidate.id === id);
  assert.ok(item, `Produit existant manquant : ${id}`);
  assert.equal(item.price, price, `Prix existant modifié : ${id}`);
}

const addedItems = ["coca-cola", "coca-cola-zero", "ice-tea", "fanta", "sprite", "eau-gazeuse", "jus-fruits", "vin-blanc"];
for (const id of addedItems) {
  const item = menu.find((candidate) => candidate.id === id);
  assert.ok(item, `Boisson ajoutée manquante : ${id}`);
  assert.equal(item.price, null, `Le prix à confirmer ne doit pas être inventé : ${id}`);
}

for (const drink of menu.filter(({ category }) => category === "boissons")) {
  assert.ok(drink.volume, `Contenance absente : ${drink.id}`);
}

for (const packagedDrink of menu.filter(({ section }) => section === "bieres" || section === "vins")) {
  assert.ok(packagedDrink.packaging, `Conditionnement absent : ${packagedDrink.id}`);
}

console.log(`Smoke test réussi : ${menu.length} produits, ${routeFiles.length} routes et ${localReferences.size} ressources contrôlés.`);
