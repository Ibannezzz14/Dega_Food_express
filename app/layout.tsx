import type { Metadata, Viewport } from "next";
import "@fontsource-variable/cormorant-garamond/wght.css";
import "@fontsource-variable/instrument-sans/wght.css";
import SiteFooter from "./site-footer";
import SiteHeader from "./site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dega Food Express | Cuisine ivoirienne à Lausanne & Lucens",
  description:
    "Composez votre commande de plats ivoiriens et contactez Dega Food Express sur WhatsApp à Lausanne ou Lucens.",
  icons: {
    icon: "/images/favicon.webp",
  },
  openGraph: {
    title: "Dega Food Express",
    description: "La Côte d’Ivoire à votre table.",
    locale: "fr_CH",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#063f33",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body id="top">
        <a className="skip-link" href="#contenu">
          Aller au contenu
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
