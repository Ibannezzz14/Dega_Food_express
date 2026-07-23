export const categories = [
  { id: "entrees", label: "Entrées", shortLabel: "Entrées" },
  { id: "plats", label: "Plats", shortLabel: "Plats" },
  { id: "desserts", label: "Desserts", shortLabel: "Desserts" },
  { id: "boissons", label: "Boissons", shortLabel: "Boissons" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];

export type MenuItem = {
  id: string;
  name: string;
  price: number | null;
  category: CategoryId;
  section?: "sans-alcool" | "bieres" | "vins";
  volume?: string;
  packaging?: string;
};

export const menuItems: readonly MenuItem[] = [
  { id: "beignets", name: "Beignets", price: 5, category: "entrees" },
  { id: "attieke-tilapia", name: "Attiéké tilapia", price: 25, category: "plats" },
  { id: "attieke-poulet-choukouya", name: "Attiéké poulet choukouya", price: 25, category: "plats" },
  { id: "attieke-agneau-choukouya", name: "Attiéké agneau choukouya", price: 25, category: "plats" },
  { id: "alloco-tilapia", name: "Alloco tilapia", price: 5, category: "plats" },
  { id: "alloco-poulet-choukouya", name: "Alloco poulet choukouya", price: 25, category: "plats" },
  { id: "alloco-agneau-choukouya", name: "Alloco agneau choukouya", price: 25, category: "plats" },
  { id: "placali-sauce-kope", name: "Placali sauce kopé", price: 30, category: "plats" },
  { id: "deguee", name: "Déguée", price: 6, category: "desserts" },
  { id: "eau-plate", name: "Eau plate", price: 2.5, category: "boissons", section: "sans-alcool", volume: "Contenance à confirmer" },
  { id: "bissap-33", name: "Bissap", price: 5, category: "boissons", section: "sans-alcool", volume: "33 cl" },
  { id: "bissap-1l", name: "Bissap", price: 14, category: "boissons", section: "sans-alcool", volume: "1 L" },
  { id: "gingembre-33", name: "Gingembre", price: 5, category: "boissons", section: "sans-alcool", volume: "33 cl" },
  { id: "gingembre-1l", name: "Gingembre", price: 14, category: "boissons", section: "sans-alcool", volume: "1 L" },
  { id: "coca-cola", name: "Coca-Cola", price: null, category: "boissons", section: "sans-alcool", volume: "Contenance à confirmer" },
  { id: "coca-cola-zero", name: "Coca-Cola Zero", price: null, category: "boissons", section: "sans-alcool", volume: "Contenance à confirmer" },
  { id: "ice-tea", name: "Ice Tea", price: null, category: "boissons", section: "sans-alcool", volume: "Contenance à confirmer" },
  { id: "fanta", name: "Fanta", price: null, category: "boissons", section: "sans-alcool", volume: "Contenance à confirmer" },
  { id: "sprite", name: "Sprite", price: null, category: "boissons", section: "sans-alcool", volume: "Contenance à confirmer" },
  { id: "eau-gazeuse", name: "Eau gazeuse", price: null, category: "boissons", section: "sans-alcool", volume: "Contenance à confirmer" },
  { id: "jus-fruits", name: "Jus de fruits", price: null, category: "boissons", section: "sans-alcool", volume: "Contenance à confirmer" },
  { id: "guinness", name: "Guinness", price: 6, category: "boissons", section: "bieres", packaging: "Conditionnement à confirmer", volume: "Contenance à confirmer" },
  { id: "super-bock", name: "Super Bock", price: 5, category: "boissons", section: "bieres", packaging: "Conditionnement à confirmer", volume: "Contenance à confirmer" },
  { id: "vin-rouge-primitivo-merlot", name: "Vin rouge · Primitivo Merlot", price: 25, category: "boissons", section: "vins", packaging: "Conditionnement à confirmer", volume: "Contenance à confirmer" },
  { id: "vin-rose-oeil-perdrix", name: "Vin rosé · Œil de Perdrix", price: 25, category: "boissons", section: "vins", packaging: "Conditionnement à confirmer", volume: "Contenance à confirmer" },
  { id: "vin-blanc", name: "Vin blanc", price: null, category: "boissons", section: "vins", packaging: "Conditionnement à confirmer", volume: "Contenance à confirmer" },
];

export const menuById = new Map(menuItems.map((item) => [item.id, item]));
