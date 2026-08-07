type NavigationItem = {
  href:
    | "/"
    | "/carte"
    | "/presentation"
    | "/evenements"
    | "/avis"
    | "/contact";
  label: string;
};

type SwissPhone = {
  displayPhone: string;
  internationalPhone: `41${string}`;
  phoneHref: `tel:+41${string}`;
};

function createSwissPhone(internationalPhone: `41${string}`): SwissPhone {
  if (!/^41\d{9}$/.test(internationalPhone)) {
    throw new Error("Le numéro suisse doit contenir 11 chiffres et commencer par 41.");
  }

  const nationalPhone = `0${internationalPhone.slice(2)}`;

  return {
    displayPhone: `${nationalPhone.slice(0, 3)} ${nationalPhone.slice(3, 6)} ${nationalPhone.slice(6, 8)} ${nationalPhone.slice(8, 10)}`,
    internationalPhone,
    phoneHref: `tel:+${internationalPhone}`,
  };
}

// Pour changer un numéro, modifiez uniquement la valeur correspondante ici.
const ORDER_PHONE = createSwissPhone("41766036011");
const CATERING_PHONE = createSwissPhone("41782654081");
// Clé technique historique conservée pour les liens et statistiques existants.
// Le libellé public couvre désormais Lausanne, Lucens et leurs alentours.
const DELIVERY_REGION_ID = "lucens";
const DELIVERY_STANDARD_RADIUS_KM = 30;

const DELIVERY_ANCHORS = [
  {
    id: "lausanne",
    label: "Lausanne",
    center: {
      latitude: 46.520046,
      longitude: 6.634719,
    },
  },
  {
    id: "lucens",
    label: "Lucens",
    center: {
      latitude: 46.708527,
      longitude: 6.836576,
    },
  },
] as const;

const CATERING_AREA = {
  label: "Toute la Suisse",
  routeLabel: "Service traiteur dans toute la Suisse",
  nationwide: true,
  locations: [
    "Suisse romande",
    "Suisse alémanique",
    "Tessin",
  ],
  availabilityMessage:
    "Service traiteur disponible dans toute la Suisse",
  summary:
    "Nous étudions les demandes dans toute la Suisse. Le devis tient compte du lieu et des besoins de votre événement.",
  detail:
    "Chaque demande fait l’objet d’un devis personnalisé selon le lieu, la distance, le nombre de convives, le transport, le matériel, le personnel et les besoins logistiques.",
} as const;

export const SITE_CONFIG = {
  brand: {
    name: "Dega Food Express",
    shortName: "Dega Food",
    logo: "/images/brand/logo-dega-food.webp",
    favicon: "/images/brand/favicon.webp",
  },
  images: {
    orderPreview: "/images/site/alloco-tilapia-ivoirien.webp",
    heroBackdrop: "/images/site/home-grunge-hero.webp",
    cateringBackdrop: "/images/site/home-grunge-paper.webp",
    hospitalityBackdrop: "/images/site/home-grunge-hero.webp",
    testimonialsBackdrop: "/images/site/home-grunge-paper.webp",
  },
  contacts: {
    orders: {
      id: "orders",
      label: "Commandes & livraison",
      ...ORDER_PHONE,
      whatsappMessage:
        "Bonjour Dega Food Express, je souhaite passer une commande.",
    },
    catering: {
      id: "catering",
      label: "Service traiteur",
      ...CATERING_PHONE,
      whatsappMessage:
        "Bonjour Dega Food Express, je souhaite demander un devis traiteur.",
    },
  },
  delivery: {
    regionId: DELIVERY_REGION_ID,
    label: "Lausanne, Lucens et alentours",
    selectionLabel: "Lausanne · Lucens · alentours",
    cityPlaceholder: "Lausanne ou Lucens",
    availabilityMessage:
      "Livraison disponible à Lausanne, Lucens et dans les régions environnantes",
    reviewMessage:
      "Hors de la zone habituelle, envoyez votre demande : la faisabilité et les frais seront confirmés.",
    standardRadiusKm: DELIVERY_STANDARD_RADIUS_KM,
    anchors: DELIVERY_ANCHORS,
  },
  cateringArea: CATERING_AREA,
  social: {
    instagram: {
      handle: "@dega_foodexpress",
      href: "https://www.instagram.com/dega_foodexpress/",
    },
  },
  navigation: [
    { href: "/", label: "Accueil" },
    { href: "/presentation", label: "Notre histoire" },
    { href: "/carte", label: "La carte" },
    { href: "/evenements", label: "Traiteur" },
    { href: "/avis", label: "Témoignages" },
    { href: "/contact", label: "Contact" },
  ] satisfies readonly NavigationItem[],
  footerNavigation: [
    { href: "/", label: "Accueil" },
    { href: "/carte", label: "La carte" },
    { href: "/presentation", label: "Notre histoire" },
    { href: "/evenements", label: "Service traiteur" },
    { href: "/avis", label: "Témoignages" },
    { href: "/contact", label: "Contact" },
  ] satisfies readonly NavigationItem[],
} as const;

export const ORDER_CONTACT = SITE_CONFIG.contacts.orders;
export const CATERING_CONTACT = SITE_CONFIG.contacts.catering;
export const INSTAGRAM = SITE_CONFIG.social.instagram;
export const DELIVERY_SETTINGS = SITE_CONFIG.delivery;
export const CATERING_AREA_SETTINGS = SITE_CONFIG.cateringArea;

export const ORDER_WHATSAPP_HREF = `https://wa.me/${ORDER_CONTACT.internationalPhone}?text=${encodeURIComponent(
  ORDER_CONTACT.whatsappMessage,
)}` as const;

export const CATERING_WHATSAPP_HREF = `https://wa.me/${CATERING_CONTACT.internationalPhone}?text=${encodeURIComponent(
  CATERING_CONTACT.whatsappMessage,
)}` as const;

export function createOrderWhatsAppHref(message: string) {
  return `https://wa.me/${ORDER_CONTACT.internationalPhone}?text=${encodeURIComponent(message)}`;
}

export function createCateringWhatsAppHref(message: string) {
  return `https://wa.me/${CATERING_CONTACT.internationalPhone}?text=${encodeURIComponent(message)}`;
}
