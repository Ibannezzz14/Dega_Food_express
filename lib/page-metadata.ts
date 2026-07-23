import type { Metadata } from "next";

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
  url: "/images/editorial/alloco-tilapia-ivoirien.webp",
  width: 1600,
  height: 1100,
  alt: "Tilapia braisé servi avec de l’alloco et une sauce tomate",
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
      siteName: "Dega Food Express",
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
