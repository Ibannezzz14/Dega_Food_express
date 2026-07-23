import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/page-metadata";
import PresentationStory from "./presentation-story";

export const metadata: Metadata = createPageMetadata({
  title: "Présentation | Dega Food Express",
  description:
    "Découvrez l’histoire de Marie-José et Geneviève, fondatrices de Dega Food Express, et leur passion pour la cuisine ivoirienne.",
  path: "/presentation",
  image: {
    url: "/images/editorial/alloco-tilapia-ivoirien.webp",
    width: 1600,
    height: 1100,
    alt: "Tilapia braisé servi avec de l’alloco et une sauce",
  },
});

export default function PresentationPage() {
  return (
    <main id="contenu">
      <PresentationStory />
    </main>
  );
}
