const PROTOTYPE_LINES = [
  { itemId: "attieke-tilapia", quantity: 1 },
  { itemId: "deguee", quantity: 1 },
  { itemId: "bissap-33", quantity: 2 },
] as const;

type PrototypeCatalogItem = {
  id: string;
  name: string;
  price: number;
  volume?: string;
};

export type TwintPrototypeOrder = {
  reference: string;
  lines: Array<{
    id: string;
    name: string;
    detail: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  itemsSubtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: {
    streetAddress: string;
    postalCode: string;
    city: string;
  };
};

export function createTwintPrototypeOrder(
  catalog: ReadonlyMap<string, PrototypeCatalogItem>,
  deliveryFee: number,
): TwintPrototypeOrder {
  const lines = PROTOTYPE_LINES.map(({ itemId, quantity }) => {
    const item = catalog.get(itemId);
    if (!item) {
      throw new Error(`Article de prototype introuvable : ${itemId}`);
    }

    return {
      id: item.id,
      name: item.name,
      detail: item.volume ?? null,
      quantity,
      unitPrice: item.price,
      lineTotal: item.price * quantity,
    };
  });
  const itemsSubtotal = lines.reduce(
    (total, line) => total + line.lineTotal,
    0,
  );

  return {
    reference: "DEMO-DF-1042",
    lines,
    itemsSubtotal,
    deliveryFee,
    total: itemsSubtotal + deliveryFee,
    deliveryAddress: {
      streetAddress: "Rue de Bourg 10",
      postalCode: "1003",
      city: "Lausanne",
    },
  };
}
