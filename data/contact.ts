import { DELIVERY_ZONES } from "./delivery-zones";

export type ContactId = "lausanne" | "lucens";

export type ContactDetails = {
  id: ContactId;
  area: string;
  displayPhone: string;
  phoneHref: `tel:${string}`;
  whatsAppPhone: string;
};

export const CONTACTS = [
  {
    id: "lausanne",
    area: DELIVERY_ZONES.lausanne.contactArea,
    displayPhone: DELIVERY_ZONES.lausanne.displayPhone,
    phoneHref: DELIVERY_ZONES.lausanne.phoneHref,
    whatsAppPhone: DELIVERY_ZONES.lausanne.phone,
  },
  {
    id: "lucens",
    area: DELIVERY_ZONES.lucens.contactArea,
    displayPhone: DELIVERY_ZONES.lucens.displayPhone,
    phoneHref: DELIVERY_ZONES.lucens.phoneHref,
    whatsAppPhone: DELIVERY_ZONES.lucens.phone,
  },
] as const satisfies readonly ContactDetails[];

export type ContactDirectoryEntry =
  | (ContactDetails & {
      availability: "available";
    })
  | {
      id: "geneve";
      area: "Genève";
      availability: "coming_soon";
      availabilityLabel: "Contact bientôt disponible";
    };

export const CONTACT_DIRECTORY = [
  ...CONTACTS.map((contact) => ({
    ...contact,
    availability: "available" as const,
  })),
  {
    id: "geneve",
    area: "Genève",
    availability: "coming_soon",
    availabilityLabel: "Contact bientôt disponible",
  },
] as const satisfies readonly ContactDirectoryEntry[];

export const INSTAGRAM = {
  handle: "@dega_foodexpress",
  href: "https://www.instagram.com/dega_foodexpress/",
} as const;
