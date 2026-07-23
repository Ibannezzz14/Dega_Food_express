import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { menuItems } from "../data/menu.ts";

const projectRoot = resolve(import.meta.dirname, "..");
const editorialImages = [
  "/images/editorial/alloco-tilapia-ivoirien.webp",
  "/images/editorial/tilapia-frais-glace-pexels.webp",
] as const;
const pendingImageIds = [] as const;

const evianImage = "/images/menu/drinks/eau-evian-33cl-officiel.webp";
const beignetsImage = "/images/menu/beignets-puff-puff-pexels.webp";
const suppliedAttiekeTilapiaImage =
  "/images/menu/attieke-tilapia-proprietaire.webp";
const suppliedAllocoPoissonImage =
  "/images/menu/alloco-poisson-braise-proprietaire.webp";
const suppliedDessertImage = "/images/menu/deguee-proprietaire.webp";
const suppliedPlacaliImage =
  "/images/menu/placali-sauce-kope-proprietaire.webp";
const suppliedMainDishImages = {
  "attieke-poulet-choukouya":
    "/images/menu/attieke-poulet-choukouya-proprietaire.webp",
  "attieke-agneau-choukouya":
    "/images/menu/attieke-agneau-choukouya-proprietaire.webp",
  "alloco-poulet-choukouya":
    "/images/menu/alloco-poulet-choukouya-proprietaire.webp",
  "alloco-agneau-choukouya":
    "/images/menu/alloco-agneau-choukouya-proprietaire.webp",
} as const;

const suppliedDrinkImages = {
  "bissap-33": "/images/menu/drinks/bissap-33cl-proprietaire.webp",
  "bissap-1l": "/images/menu/drinks/bissap-1l-proprietaire.webp",
  "gingembre-33": "/images/menu/drinks/gingembre-33cl-proprietaire.webp",
  "gingembre-1l": "/images/menu/drinks/gingembre-1l-proprietaire.webp",
  guinness: "/images/menu/drinks/guinness-33cl-proprietaire.webp",
  "super-bock": "/images/menu/drinks/super-bock-33cl-proprietaire.webp",
  "vin-rouge-primitivo-merlot":
    "/images/menu/drinks/primitivo-merlot-proprietaire.webp",
  "vin-rose-oeil-perdrix":
    "/images/menu/drinks/oeil-de-perdrix-proprietaire.webp",
} as const;

test("chaque photo validée est locale et optimisée", () => {
  assert.equal(menuItems.length, 18);
  assert.ok(
    menuItems.every(
      (item) => Number.isFinite(item.price) && item.price > 0,
    ),
  );

  for (const item of menuItems) {
    if (item.imageStatus === "pending") {
      assert.equal(item.image, undefined);
      assert.equal(item.imageAlt, undefined);
      continue;
    }

    assert.match(
      item.image,
      /^\/images\/menu\/(?:drinks\/)?[a-z0-9-]+\.webp$/,
    );
    assert.ok(item.imageAlt.trim().length >= 8, `Texte alternatif trop court : ${item.id}`);

    const imagePath = resolve(projectRoot, "public", item.image.slice(1));
    assert.ok(existsSync(imagePath), `Image manquante : ${item.image}`);
    assert.ok(
      statSync(imagePath).size <= 180_000,
      `Image trop lourde : ${item.image}`,
    );
  }
});

test("les références Boissons conservent leurs prix et décrivent leur conditionnement", () => {
  const expectedDrinks = [
    {
      id: "eau-plate",
      price: 2.5,
      volume: "33 cl",
      packaging: undefined,
    },
    { id: "bissap-33", price: 5, volume: "33 cl", packaging: undefined },
    { id: "bissap-1l", price: 14, volume: "1 L", packaging: undefined },
    { id: "gingembre-33", price: 5, volume: "33 cl", packaging: undefined },
    { id: "gingembre-1l", price: 14, volume: "1 L", packaging: undefined },
    {
      id: "guinness",
      price: 6,
      volume: "33 cl",
      packaging: "canette",
    },
    {
      id: "super-bock",
      price: 5,
      volume: "33 cl",
      packaging: "bouteille",
    },
    {
      id: "vin-rouge-primitivo-merlot",
      price: 25,
      volume: undefined,
      packaging: "bouteille",
    },
    {
      id: "vin-rose-oeil-perdrix",
      price: 25,
      volume: undefined,
      packaging: "bouteille",
    },
  ] as const;

  for (const expected of expectedDrinks) {
    const item = menuItems.find((candidate) => candidate.id === expected.id);

    assert.ok(item, `Boisson manquante : ${expected.id}`);
    assert.equal(item.price, expected.price, `Prix modifié : ${expected.id}`);
    assert.equal(item.volume, expected.volume, `Volume incorrect : ${expected.id}`);
    assert.equal(
      item.packaging,
      expected.packaging,
      `Conditionnement incorrect : ${expected.id}`,
    );
    if (item.imageStatus === "pending") {
      assert.equal(item.image, undefined);
    } else {
      assert.match(item.image, /^\/images\/menu\/drinks\/[a-z0-9-]+\.webp$/);
    }
  }
});

test("les photographies éditoriales sont locales et optimisées", () => {
  for (const image of editorialImages) {
    const imagePath = resolve(projectRoot, "public", image.slice(1));

    assert.ok(existsSync(imagePath), `Image manquante : ${image}`);
    assert.ok(
      statSync(imagePath).size <= 250_000,
      `Image éditoriale trop lourde : ${image}`,
    );
  }
});

test("les beignets utilisent le nouveau cadrage puff-puff sans modifier le prix", () => {
  const item = menuItems.find((candidate) => candidate.id === "beignets");

  assert.ok(item);
  assert.equal(item.image, beignetsImage);
  assert.equal(item.price, 5);
  assert.equal(item.category, "entrees");
});

test("l’attiéké tilapia utilise le nouveau visuel fourni", () => {
  const item = menuItems.find(
    (candidate) => candidate.id === "attieke-tilapia",
  );

  assert.ok(item);
  assert.equal(item.image, suppliedAttiekeTilapiaImage);
  assert.equal(item.price, 25);
  assert.equal(item.category, "plats");
});

test("l’alloco poisson braisé utilise la photographie fournie", () => {
  const item = menuItems.find((candidate) => candidate.id === "alloco-tilapia");

  assert.ok(item);
  assert.equal(item.name, "Alloco poisson braisé");
  assert.equal(item.image, suppliedAllocoPoissonImage);
  assert.equal(item.price, 25);
  assert.equal(item.category, "plats");
});

test("le placali sauce kopé utilise le nouveau visuel fourni", () => {
  const item = menuItems.find(
    (candidate) => candidate.id === "placali-sauce-kope",
  );

  assert.ok(item);
  assert.equal(item.image, suppliedPlacaliImage);
  assert.equal(item.price, 30);
  assert.equal(item.category, "plats");
});

test("les quatre plats fournis utilisent chacun leur visuel propre", () => {
  for (const [id, image] of Object.entries(suppliedMainDishImages)) {
    const item = menuItems.find((candidate) => candidate.id === id);

    assert.ok(item, `Plat fourni manquant : ${id}`);
    assert.notEqual(item.imageStatus, "pending", `Visuel encore masqué : ${id}`);
    assert.equal(item.image, image, `Mauvais visuel associé : ${id}`);
    assert.equal(item.price, 25, `Prix modifié : ${id}`);
    assert.equal(item.category, "plats");
  }

  assert.equal(
    new Set(Object.values(suppliedMainDishImages)).size,
    Object.keys(suppliedMainDishImages).length,
  );
});

test("chaque boisson fournie utilise son visuel et son format propres", () => {
  for (const [id, image] of Object.entries(suppliedDrinkImages)) {
    const item = menuItems.find((candidate) => candidate.id === id);

    assert.ok(item, `Boisson fournie manquante : ${id}`);
    assert.notEqual(item.imageStatus, "pending", `Visuel encore masqué : ${id}`);
    assert.equal(item.image, image, `Mauvais visuel associé : ${id}`);
  }

  assert.equal(
    new Set(Object.values(suppliedDrinkImages)).size,
    Object.keys(suppliedDrinkImages).length,
  );
});

test("l’eau Evian utilise la bouteille officielle de 33 cl", () => {
  const item = menuItems.find((candidate) => candidate.id === "eau-plate");

  assert.ok(item);
  assert.equal(item.name, "Eau Evian");
  assert.notEqual(item.imageStatus, "pending");
  assert.equal(item.image, evianImage);
  assert.equal(item.volume, "33 cl");
  assert.equal(item.imageFit, "contain");
});

test("le dégué utilise le visuel fourni pour le dessert", () => {
  const item = menuItems.find((candidate) => candidate.id === "deguee");

  assert.ok(item);
  assert.equal(item.name, "Dégué");
  assert.notEqual(item.imageStatus, "pending");
  assert.equal(item.image, suppliedDessertImage);
  assert.equal(item.price, 6);
});

test("les produits sans photographie exacte restent masqués", () => {
  const actualPendingIds = menuItems
    .filter((item) => item.imageStatus === "pending")
    .map((item) => item.id);

  assert.deepEqual(actualPendingIds, pendingImageIds);
  assert.equal(
    menuItems.filter((item) => item.imageStatus !== "pending").length,
    18,
  );
});

test("les sources externes et les visuels fournis sont documentés", () => {
  const registry = readFileSync(
    resolve(projectRoot, "IMAGE_SOURCES.md"),
    "utf8",
  );

  assert.match(registry, /https:\/\/commons\.wikimedia\.org/);
  assert.match(registry, /CC BY-SA 4\.0/);
  assert.match(registry, /gpt-image/);
  assert.ok(registry.includes(beignetsImage));
  assert.ok(
    registry.includes(
      "https://www.pexels.com/photo/close-up-shot-of-delicious-puff-puff-on-white-ceramic-bowl-13915068/",
    ),
  );
  assert.ok(registry.includes("https://www.pexels.com/license/"));
  assert.ok(registry.includes(evianImage));
  assert.ok(registry.includes(suppliedAttiekeTilapiaImage));
  assert.ok(registry.includes(suppliedAllocoPoissonImage));
  assert.ok(registry.includes(suppliedDessertImage));
  assert.ok(registry.includes(suppliedPlacaliImage));
  assert.ok(
    registry.includes(
      "https://www.pexels.com/photo/displayed-raw-tilapia-on-a-row-8352786/",
    ),
  );
  assert.ok(
    registry.includes(
      "https://www.evian.com/fr_ch/produits/bouteilles-en-verre/33cl/",
    ),
  );

  for (const image of Object.values(suppliedDrinkImages)) {
    assert.ok(registry.includes(image), `Source non documentée : ${image}`);
  }

  for (const image of Object.values(suppliedMainDishImages)) {
    assert.ok(registry.includes(image), `Source non documentée : ${image}`);
  }
});
