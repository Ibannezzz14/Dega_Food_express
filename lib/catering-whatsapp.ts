export type CateringRequest = {
  contactArea: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  eventType: string;
  eventDate: string;
  location: string;
  guestCount: string;
  dishes: readonly string[];
  services: readonly string[];
  details?: string;
};

export function formatSwissDate(value: string) {
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}.${month}.${year}`;
}

export function buildCateringWhatsAppMessage(request: CateringRequest) {
  return [
    "Bonjour Dega Food Express,",
    "",
    "Je souhaite demander un devis pour une prestation traiteur.",
    "",
    `Contact souhaité : ${request.contactArea}`,
    `Prénom et nom : ${request.firstName} ${request.lastName}`,
    `Téléphone : ${request.phone}`,
    ...(request.email ? [`E-mail : ${request.email}`] : []),
    "",
    `Type d’événement : ${request.eventType}`,
    `Date souhaitée : ${formatSwissDate(request.eventDate)}`,
    `Lieu : ${request.location}`,
    `Nombre de convives : ${request.guestCount}`,
    "",
    "Plats souhaités :",
    ...request.dishes.map((dish) => `• ${dish}`),
    "",
    "Services souhaités :",
    ...request.services.map((service) => `• ${service}`),
    ...(request.details
      ? ["", "Informations complémentaires :", request.details]
      : []),
  ].join("\n");
}
