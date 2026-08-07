import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { menuById } from "../data/menu.ts";
import { DELIVERY_FEE } from "../data/order-rules.ts";
import { createTwintPrototypeOrder } from "../lib/twint-prototype-model.ts";

const projectRoot = resolve(import.meta.dirname, "..");

test("le prototype calcule son montant depuis les articles de la carte", () => {
  const order = createTwintPrototypeOrder(menuById, DELIVERY_FEE);

  assert.equal(order.reference, "DEMO-DF-1042");
  assert.deepEqual(
    order.lines.map(({ id, quantity }) => ({ id, quantity })),
    [
      { id: "attieke-tilapia", quantity: 1 },
      { id: "deguee", quantity: 1 },
      { id: "bissap-33", quantity: 2 },
    ],
  );
  assert.equal(order.itemsSubtotal, 41);
  assert.equal(order.deliveryFee, 7.9);
  assert.equal(order.total, 48.9);
});

test("le prototype ne contient aucune intégration de paiement réelle", () => {
  const componentSource = readFileSync(
    resolve(
      projectRoot,
      "app/prototype-twint/twint-payment-prototype.tsx",
    ),
    "utf8",
  );

  assert.ok(componentSource.includes("Aucun paiement réel"));
  assert.ok(componentSource.includes("Non scannable"));
  assert.ok(!componentSource.includes("go.twint.ch"));
  assert.ok(!componentSource.includes("fetch("));
  assert.ok(!componentSource.includes("dangerouslySetInnerHTML"));
});
