import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/page-metadata";
import EventsSection from "./events-section";
import GallerySection from "./gallery-section";
import HomeHero from "./home-hero";
import PresentationSection from "./presentation-section";

export const metadata: Metadata = createPageMetadata({
  title: "Dega Food Express | Cuisine ivoirienne à Lausanne & Lucens",
  description:
    "Composez votre commande de plats ivoiriens et contactez Dega Food Express sur WhatsApp à Lausanne ou Lucens.",
  path: "/",
});

export default function Home() {
  return (
    <main id="contenu">
      <HomeHero />
      <PresentationSection />
      <EventsSection />
      <GallerySection />
    </main>
  );
}
