import type { Metadata } from "next";
import { Suspense } from "react";
import { createPageMetadata } from "@/lib/page-metadata";
import OrderExperience from "../order-experience";
import CarteContent from "./carte-content";

export const metadata: Metadata = createPageMetadata({
  title: "La carte | Dega Food Express",
  description:
    "Choisissez vos plats ivoiriens, votre zone et préparez votre commande WhatsApp.",
  path: "/carte",
  image: {
    url: "/images/editorial/alloco-tilapia-ivoirien.webp",
    width: 1600,
    height: 1100,
    alt: "Tilapia braisé servi avec de l’alloco et une sauce tomate",
  },
});

export default function CartePage() {
  return (
    <main id="contenu">
      <Suspense fallback={<OrderExperience />}>
        <CarteContent />
      </Suspense>
    </main>
  );
}
