import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/page-metadata";
import PresentationStory from "./presentation-story";

export const metadata: Metadata = createPageMetadata({
  title: "Présentation | Dega Food Express",
  description:
    "Découvrez l’histoire de Marie-José et Geneviève, fondatrices de Dega Food Express, et leur passion pour la cuisine ivoirienne.",
  path: "/presentation",
  image: {
    url: "/images/menu/attieke-tilapia-proprietaire.webp",
    width: 720,
    height: 720,
    alt: "Tilapia braisé entier servi avec de l’attiéké et des condiments",
  },
});

export default function PresentationPage() {
  return (
    <main id="contenu">
      <PresentationStory />
    </main>
  );
}
