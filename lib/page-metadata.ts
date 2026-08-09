import type { Metadata } from "next";
import { SITE_CONFIG } from "@/config/site-config";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}` | "/";
  image?: {
    url: `/${string}`;
    width: number;
    height: number;
    alt: string;
  };
};

const defaultImage = {
  url: "/images/menu/attieke-tilapia-proprietaire.webp",
  width: 720,
  height: 720,
  alt: "Tilapia braisé entier servi avec de l’attiéké et des condiments",
} as const;

export function createPageMetadata({
  title,
  description,
  path,
  image = defaultImage,
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_CONFIG.brand.name,
      locale: "fr_CH",
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}
