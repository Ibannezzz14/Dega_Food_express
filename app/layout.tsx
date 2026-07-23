import type { Metadata, Viewport } from "next";
import "@fontsource-variable/cormorant-garamond/wght.css";
import "@fontsource-variable/instrument-sans/wght.css";
import { createPageMetadata } from "@/lib/page-metadata";
import { siteUrl } from "@/lib/site-url";
import SiteFooter from "./site-footer";
import SiteHeader from "./site-header";
import { OrderSessionProvider } from "./order-session";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  ...createPageMetadata({
    title: "Dega Food Express | Cuisine ivoirienne à Lausanne & Lucens",
    description:
      "Composez votre commande de plats ivoiriens et contactez Dega Food Express sur WhatsApp à Lausanne ou Lucens.",
    path: "/",
  }),
  icons: {
    icon: "/images/favicon.webp",
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
        <OrderSessionProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </OrderSessionProvider>
      </body>
    </html>
  );
}
