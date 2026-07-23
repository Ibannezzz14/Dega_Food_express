import type { Metadata } from "next";
import GallerySection from "../gallery-section";
import PresentationSection from "../presentation-section";

export const metadata: Metadata = {
  title: "Présentation | Dega Food Express",
  description:
    "Découvrez Dega Food Express, sa cuisine ivoirienne sur commande et ses services à Lausanne et Lucens.",
};

export default function PresentationPage() {
  return (
    <main id="contenu">
      <PresentationSection asPage />
      <GallerySection />
    </main>
  );
}
