import type { Metadata } from "next";
import { ORDER_CONTACT } from "@/config/site-config";
import { createPageMetadata } from "@/lib/page-metadata";
import CustomerActions from "@/components/home/customer-actions";
import CateringSection from "@/components/home/catering-section";
import GallerySection from "@/components/home/gallery-section";
import HomeHero from "@/components/home/home-hero";
import OrderStepsSection from "@/components/home/order-steps-section";
import PresentationSection from "@/components/home/presentation-section";
import ReviewsSection from "@/components/reviews/customer-reviews-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Dega Food Express | Cuisine ivoirienne à Lausanne et Lucens",
  description: `Commandes et livraison à Lausanne, Lucens et dans les régions environnantes au ${ORDER_CONTACT.displayPhone}. Service traiteur dans toute la Suisse.`,
  path: "/",
});

export default function Home() {
  return (
    <main id="contenu" tabIndex={-1}>
      <HomeHero />
      <PresentationSection />
      <GallerySection />
      <OrderStepsSection />
      <ReviewsSection />
      <CateringSection />
      <CustomerActions />
    </main>
  );
}
