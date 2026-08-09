import type { Metadata, Viewport } from "next";
import { Bitter, Fraunces, Manrope } from "next/font/google";
import {
  ORDER_CONTACT,
  SITE_CONFIG,
} from "@/config/site-config";
import { createPageMetadata } from "@/lib/page-metadata";
import { siteUrl } from "@/lib/site-url";
import SiteFooter from "@/components/layout/site-footer";
import SiteHeader from "@/components/layout/site-header";
import NavigationFocus from "@/components/layout/navigation-focus";
import { OrderSessionProvider } from "@/components/order/order-session-provider";
import "./globals.css";

const bitter = Bitter({
  variable: "--font-bitter",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const frauncesAmpersand = Fraunces({
  variable: "--font-ampersand",
  subsets: ["latin"],
  weight: "600",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  ...createPageMetadata({
    title: "Dega Food Express | Cuisine ivoirienne à Lausanne et Lucens",
    description: `Commandes et livraison à Lausanne, Lucens et dans les régions environnantes au ${ORDER_CONTACT.displayPhone}. Service traiteur dans toute la Suisse.`,
    path: "/",
  }),
  icons: {
    icon: SITE_CONFIG.brand.favicon,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#071f1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${bitter.variable} ${manrope.variable} ${frauncesAmpersand.variable}`}
    >
      <body id="top">
        <a className="skip-link" href="#contenu">
          Aller au contenu
        </a>
        <OrderSessionProvider>
          <NavigationFocus />
          <SiteHeader />
          {children}
          <SiteFooter />
        </OrderSessionProvider>
      </body>
    </html>
  );
}
