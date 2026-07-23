export const categories = [
  { id: "entrees", label: "Entrées", shortLabel: "Entrées" },
  { id: "plats", label: "Plats", shortLabel: "Plats" },
  { id: "desserts", label: "Desserts", shortLabel: "Desserts" },
  { id: "boissons", label: "Boissons", shortLabel: "Boissons" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];

type MenuItemDetails = {
  id: string;
  name: string;
  price: number;
  category: CategoryId;
  section?: "sans-alcool" | "bieres" | "vins";
  volume?: string;
  packaging?: string;
};

type VerifiedMenuItem = MenuItemDetails & {
  imageStatus?: "verified";
  image: string;
  imageAlt: string;
  imageFit?: "cover" | "contain";
};

type PendingMenuItem = MenuItemDetails & {
  imageStatus: "pending";
  image?: never;
  imageAlt?: never;
  imageFit?: never;
};

export type MenuItem = VerifiedMenuItem | PendingMenuItem;

export const menuItems: readonly MenuItem[] = [
  {
    id: "beignets",
    name: "Beignets",
    price: 5,
    category: "entrees",
    image: "/images/menu/beignets-puff-puff-pexels.webp",
    imageAlt: "Beignets africains puff-puff dorés dans un bol blanc",
  },
  {
    id: "attieke-tilapia",
    name: "Attiéké tilapia",
    price: 25,
    category: "plats",
    image: "/images/menu/attieke-tilapia.webp",
    imageAlt: "Tilapia servi avec de l’attiéké et une sauce légère",
  },
  {
    id: "attieke-poulet-choukouya",
    name: "Attiéké poulet choukouya",
    price: 25,
    category: "plats",
    image: "/images/menu/attieke-poulet-choukouya-proprietaire.webp",
    imageAlt:
      "Attiéké servi avec du poulet choukouya, de l’alloco et des crudités",
  },
  {
    id: "attieke-agneau-choukouya",
    name: "Attiéké agneau choukouya",
    price: 25,
    category: "plats",
    image: "/images/menu/attieke-agneau-choukouya-proprietaire.webp",
    imageAlt:
      "Attiéké servi avec de l’agneau choukouya, une sauce et des crudités",
  },
  {
    id: "alloco-tilapia",
    name: "Alloco poisson braisé",
    price: 5,
    category: "plats",
    image: "/images/menu/alloco-poisson-braise-proprietaire.webp",
    imageAlt: "Poisson braisé servi avec de l’alloco et des crudités",
  },
  {
    id: "alloco-poulet-choukouya",
    name: "Alloco poulet choukouya",
    price: 25,
    category: "plats",
    image: "/images/menu/alloco-poulet-choukouya-proprietaire.webp",
    imageAlt:
      "Alloco servi avec du poulet choukouya aux oignons et des crudités",
  },
  {
    id: "alloco-agneau-choukouya",
    name: "Alloco agneau choukouya",
    price: 25,
    category: "plats",
    image: "/images/menu/alloco-agneau-choukouya-proprietaire.webp",
    imageAlt:
      "Alloco servi avec de l’agneau choukouya, de l’attiéké et des crudités",
  },
  {
    id: "placali-sauce-kope",
    name: "Placali sauce kopé",
    price: 30,
    category: "plats",
    image: "/images/menu/placali-sauce-kope-proprietaire.webp",
    imageAlt:
      "Deux portions de placali ivoirien accompagnées d’une sauce kopé",
  },
  {
    id: "deguee",
    name: "Déguée",
    price: 6,
    category: "desserts",
    image: "/images/menu/deguee-proprietaire.webp",
    imageAlt: "Coupe de déguée au lait fermenté et aux grains de mil",
  },
  {
    id: "eau-plate",
    name: "Eau Evian",
    price: 2.5,
    category: "boissons",
    image: "/images/menu/drinks/eau-evian-33cl-officiel.webp",
    imageAlt: "Bouteille en verre d’eau minérale Evian, format 33 cl",
    imageFit: "contain",
    section: "sans-alcool",
    volume: "33 cl",
  },
  {
    id: "bissap-33",
    name: "Bissap",
    price: 5,
    category: "boissons",
    image: "/images/menu/drinks/bissap-33cl-proprietaire.webp",
    imageAlt: "Bouteille de bissap rouge, format 33 cl",
    imageFit: "contain",
    section: "sans-alcool",
    volume: "33 cl",
  },
  {
    id: "bissap-1l",
    name: "Bissap",
    price: 14,
    category: "boissons",
    image: "/images/menu/drinks/bissap-1l-proprietaire.webp",
    imageAlt: "Bouteille de bissap rouge, format 1 litre",
    imageFit: "contain",
    section: "sans-alcool",
    volume: "1 L",
  },
  {
    id: "gingembre-33",
    name: "Gingembre",
    price: 5,
    category: "boissons",
    image: "/images/menu/drinks/gingembre-33cl-proprietaire.webp",
    imageAlt: "Bouteille de jus de gingembre, format 33 cl",
    imageFit: "contain",
    section: "sans-alcool",
    volume: "33 cl",
  },
  {
    id: "gingembre-1l",
    name: "Gingembre",
    price: 14,
    category: "boissons",
    image: "/images/menu/drinks/gingembre-1l-proprietaire.webp",
    imageAlt: "Bouteille de jus de gingembre, format 1 litre",
    imageFit: "contain",
    section: "sans-alcool",
    volume: "1 L",
  },
  {
    id: "guinness",
    name: "Guinness",
    price: 6,
    category: "boissons",
    image: "/images/menu/drinks/guinness-33cl-proprietaire.webp",
    imageAlt: "Canette de Guinness Draught, format 33 cl",
    imageFit: "contain",
    section: "bieres",
    volume: "33 cl",
    packaging: "canette",
  },
  {
    id: "super-bock",
    name: "Super Bock",
    price: 5,
    category: "boissons",
    image: "/images/menu/drinks/super-bock-33cl-proprietaire.webp",
    imageAlt: "Bouteille de bière Super Bock, format 33 cl",
    imageFit: "contain",
    section: "bieres",
    volume: "33 cl",
    packaging: "bouteille",
  },
  {
    id: "vin-rouge-primitivo-merlot",
    name: "Primitivo Merlot",
    price: 25,
    category: "boissons",
    image: "/images/menu/drinks/primitivo-merlot-proprietaire.webp",
    imageAlt: "Bouteille de vin rouge Primitivo Merlot",
    imageFit: "contain",
    section: "vins",
    packaging: "bouteille",
  },
  {
    id: "vin-rose-oeil-perdrix",
    name: "Œil-de-Perdrix",
    price: 25,
    category: "boissons",
    image: "/images/menu/drinks/oeil-de-perdrix-proprietaire.webp",
    imageAlt: "Bouteille de vin rosé Œil-de-Perdrix",
    imageFit: "contain",
    section: "vins",
    packaging: "bouteille",
  },
];

export const menuById = new Map(menuItems.map((item) => [item.id, item]));
