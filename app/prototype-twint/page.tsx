import type { Metadata } from "next";
import { menuById } from "@/data/menu";
import { DELIVERY_FEE } from "@/data/order-rules";
import { createPageMetadata } from "@/lib/page-metadata";
import { createTwintPrototypeOrder } from "@/lib/twint-prototype-model";
import TwintPaymentPrototype from "./twint-payment-prototype";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Prototype paiement TWINT | Dega Food Express",
    description:
      "Démonstration non transactionnelle du futur paiement TWINT pour une livraison Dega Food Express.",
    path: "/prototype-twint",
  }),
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default function TwintPrototypePage() {
  return (
    <main id="contenu">
      <TwintPaymentPrototype
        order={createTwintPrototypeOrder(menuById, DELIVERY_FEE)}
      />
    </main>
  );
}
