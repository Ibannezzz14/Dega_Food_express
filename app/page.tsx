import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { createPageMetadata } from "@/lib/page-metadata";
import EventsSection from "./events-section";
import GallerySection from "./gallery-section";
import HomeHero from "./home-hero";
import PresentationSection from "./presentation-section";
import styles from "./page.module.css";

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
      <GallerySection />
      <EventsSection />
      <section className={styles.finalCta} aria-labelledby="final-cta-title">
        <div>
          <h2 id="final-cta-title">
            Composez votre menu, nous préparons le reste.
          </h2>
        </div>
        <Link href="/carte">
          Commander nos spécialités
          <ArrowRightIcon />
        </Link>
      </section>
    </main>
  );
}
