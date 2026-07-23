import type { Metadata } from "next";
import OrderExperience from "../order-experience";

export const metadata: Metadata = {
  title: "La carte | Dega Food Express",
  description:
    "Choisissez vos plats ivoiriens, votre zone et préparez votre commande WhatsApp.",
};

type CartePageProps = {
  searchParams: Promise<{
    zone?: string | string[];
  }>;
};

export default async function CartePage({ searchParams }: CartePageProps) {
  const params = await searchParams;
  const zone = Array.isArray(params.zone) ? params.zone[0] : params.zone;
  const initialRegion =
    zone === "lausanne" || zone === "lucens" ? zone : null;

  return (
    <main id="contenu">
      <OrderExperience view="menu" initialRegion={initialRegion} />
    </main>
  );
}
