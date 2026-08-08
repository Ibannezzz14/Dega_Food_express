import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { menuItems } from "../data/menu.ts";

const projectRoot = resolve(import.meta.dirname, "..");
const editorialImages = [
  "/images/site/alloco-tilapia-ivoirien.webp",
  "/images/site/home-grunge-hero.webp",
  "/images/site/home-grunge-paper.webp",
] as const;
const beignetsImage = "/images/menu/beignets-proprietaire.webp";
const suppliedAttiekeTilapiaImage =
  "/images/menu/attieke-tilapia-proprietaire.webp";
const suppliedAllocoPoissonImage =
  "/images/menu/alloco-poisson-braise-retouche.webp";
const suppliedDessertImage = "/images/menu/degue-retouche.webp";
const suppliedPlacaliImage =
  "/images/menu/placali-sauce-kope-proprietaire.webp";
const suppliedMainDishImages = {
  "attieke-poulet-choukouya":
    "/images/menu/attieke-poulet-choukouya-proprietaire.webp",
  "attieke-agneau-choukouya":
    "/images/menu/attieke-agneau-choukouya-proprietaire.webp",
  "alloco-poulet-choukouya":
    "/images/menu/alloco-poulet-choukouya-retouche.webp",
  "alloco-agneau-choukouya":
    "/images/menu/alloco-agneau-choukouya-retouche.webp",
} as const;

const verifiedDrinkImages = {
  "bissap-33": "/images/menu/drinks/bissap-pexels.webp",
  "bissap-1l": "/images/menu/drinks/bissap-pexels.webp",
  "gingembre-33": "/images/menu/drinks/gingembre-pexels.webp",
  "gingembre-1l": "/images/menu/drinks/gingembre-pexels.webp",
} as const;
const removedDrinkIds = [
  "eau-plate",
  "guinness",
  "super-bock",
  "vin-rouge-primitivo-merlot",
  "vin-rose-oeil-perdrix",
] as const;

test("chaque photo validée est locale et optimisée", () => {
  assert.equal(menuItems.length, 16);
  assert.ok(
    menuItems.every(
      (item) => item.price === null || (Number.isFinite(item.price) && item.price > 0),
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

test("l’aller-retour figure dans les entrées", () => {
  const item = menuItems.find((candidate) => candidate.id === "aller-retour");

  assert.ok(item);
  assert.equal(item.name, "Aller-retour");
  assert.equal(item.price, 5);
  assert.equal(item.category, "entrees");
  assert.equal(item.image, "/images/menu/aller-retour.webp");
});

test("les nouvelles photos sont associées à Aller-retour et Pastel", () => {
  const expectedImages = {
    "aller-retour": "/images/menu/aller-retour.webp",
    pastel: "/images/menu/pastel.webp",
  } as const;

  for (const [id, image] of Object.entries(expectedImages)) {
    const item = menuItems.find((candidate) => candidate.id === id);

    assert.ok(item);
    assert.notEqual(item.imageStatus, "pending");
    assert.equal(item.image, image);
    assert.equal(item.category, "entrees");
  }
});

test("les références Boissons conservent leurs prix et décrivent leur conditionnement", () => {
  const expectedDrinks = [
    { id: "bissap-33", price: 5, volume: "33 cl", packaging: undefined },
    { id: "bissap-1l", price: 14, volume: "1 L", packaging: undefined },
    { id: "gingembre-33", price: 5, volume: "33 cl", packaging: undefined },
    { id: "gingembre-1l", price: 14, volume: "1 L", packaging: undefined },
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

test("la carte ne propose plus de bière, de vin ni d’eau", () => {
  for (const id of removedDrinkIds) {
    assert.equal(
      menuItems.some((item) => item.id === id),
      false,
      `Référence encore affichée : ${id}`,
    );
  }
});

test("les photographies éditoriales sont locales et optimisées", () => {
  for (const image of editorialImages) {
    const imagePath = resolve(projectRoot, "public", image.slice(1));

    assert.ok(existsSync(imagePath), `Image manquante : ${image}`);
    assert.ok(
      statSync(imagePath).size <= 300_000,
      `Image éditoriale trop lourde : ${image}`,
    );
  }
});

test("le Dum-Dum utilise la photographie fournie sans modifier le prix", () => {
  const item = menuItems.find((candidate) => candidate.name === "Dum-Dum");

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

test("le foutou sauce graine utilise la nouvelle photo", () => {
  const item = menuItems.find(
    (candidate) => candidate.id === "Foutu_sauceGraine",
  );

  assert.ok(item);
  assert.equal(item.name, "Foutou sauce graine");
  assert.equal(item.image, "/images/menu/foutou-sauce-graine.webp");
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

test("les boissons artisanales utilisent des photographies réelles et sans fausse étiquette", () => {
  for (const [id, image] of Object.entries(verifiedDrinkImages)) {
    const item = menuItems.find((candidate) => candidate.id === id);

    assert.ok(item, `Boisson manquante : ${id}`);
    assert.notEqual(item.imageStatus, "pending", `Visuel masqué : ${id}`);
    assert.equal(item.image, image, `Mauvaise photographie associée : ${id}`);
  }

  assert.equal(
    new Set(Object.values(verifiedDrinkImages)).size,
    2,
  );
});

test("le dégué utilise le visuel fourni pour le dessert", () => {
  const item = menuItems.find((candidate) => candidate.id === "deguee");

  assert.ok(item);
  assert.equal(item.name, "Dégué");
  assert.notEqual(item.imageStatus, "pending");
  assert.equal(item.image, suppliedDessertImage);
  assert.equal(item.price, 6);
});

test("tous les plats de la carte ont désormais un visuel", () => {
  const actualPendingIds = menuItems
    .filter((item) => item.imageStatus === "pending")
    .map((item) => item.id);

  assert.deepEqual(actualPendingIds, []);
  assert.equal(
    menuItems.filter((item) => item.imageStatus !== "pending").length,
    16,
  );

  const pendingPrices = menuItems
    .filter((item) => actualPendingIds.includes(item.id))
    .map((item) => item.price);
  assert.deepEqual(pendingPrices, []);
});

test("les sources externes et les visuels fournis sont documentés", () => {
  const registry = readFileSync(
    resolve(projectRoot, "docs/internal/IMAGE_SOURCES.md"),
    "utf8",
  );

  assert.match(registry, /https:\/\/commons\.wikimedia\.org/);
  assert.match(registry, /CC BY-SA 4\.0/);
  assert.ok(registry.includes(beignetsImage));
  assert.ok(
    registry.includes("ChatGPT Image 23 juil. 2026, 23_53_06.png"),
  );
  assert.ok(registry.includes(suppliedAttiekeTilapiaImage));
  assert.ok(registry.includes(suppliedAllocoPoissonImage));
  assert.ok(registry.includes(suppliedDessertImage));
  assert.ok(registry.includes(suppliedPlacaliImage));
  assert.ok(
    registry.includes(
      "https://www.pexels.com/photo/refreshing-hibiscus-drink-with-lime-garnish-36630822/",
    ),
  );
  assert.ok(
    registry.includes(
      "https://www.pexels.com/photo/healthy-giinger-ade-drink-13425810/",
    ),
  );

  for (const image of Object.values(verifiedDrinkImages)) {
    assert.ok(registry.includes(image), `Source non documentée : ${image}`);
  }

  for (const image of editorialImages) {
    assert.ok(registry.includes(image), `Source non documentée : ${image}`);
  }

  for (const image of Object.values(suppliedMainDishImages)) {
    assert.ok(registry.includes(image), `Source non documentée : ${image}`);
  }
});
