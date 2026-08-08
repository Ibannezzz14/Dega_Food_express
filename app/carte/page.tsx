import type { Metadata } from "next";
import OrderExperience from "@/components/order/order-experience";
import { SITE_CONFIG } from "@/config/site-config";
import { isDeliveryRegionId } from "@/data/delivery-zones";
import { createPageMetadata } from "@/lib/page-metadata";

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

type CartePageProps = {
  searchParams: Promise<{
    mode?: string | string[];
    zone?: string | string[];
  }>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CartePage({ searchParams }: CartePageProps) {
  const params = await searchParams;
  const zone = firstValue(params.zone);
  const initialRegion = zone && isDeliveryRegionId(zone) ? zone : null;
  const initialFulfillmentMethod =
    firstValue(params.mode) === "livraison" ? "delivery" : null;

  return (
    <main id="contenu" tabIndex={-1}>
      <OrderExperience
        initialFulfillmentMethod={initialFulfillmentMethod}
        initialRegion={initialRegion}
      />
    </main>
  );
}
