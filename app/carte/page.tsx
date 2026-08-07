import type { Metadata } from "next";
import { Suspense } from "react";
import OrderExperience from "@/components/order/order-experience";
import { SITE_CONFIG } from "@/config/site-config";
import { createPageMetadata } from "@/lib/page-metadata";
import CarteContent from "./carte-content";

export const metadata: Metadata = createPageMetadata({
  title: "La carte | Dega Food Express",
  description:
    "Choisissez vos plats ivoiriens et préparez votre commande WhatsApp pour Lausanne, Lucens ou leurs environs.",
  path: "/carte",
  image: {
    url: SITE_CONFIG.images.orderPreview,
    width: 1600,
    height: 1100,
    alt: "Tilapia braisé servi avec de l’alloco et une sauce tomate",
  },
});

export default function CartePage() {
  return (
    <main id="contenu" tabIndex={-1}>
      <Suspense fallback={<OrderExperience />}>
        <CarteContent />
      </Suspense>
    </main>
  );
}
