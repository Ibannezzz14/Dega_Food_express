"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowRightIcon, MessageIcon } from "@/components/icons";
import { CONTACTS, type ContactId } from "@/data/contact";
import { menuItems } from "@/data/menu";
import { buildCateringWhatsAppMessage } from "@/lib/catering-whatsapp";
import styles from "./evenements.module.css";

type FieldName =
  | "contact"
  | "firstName"
  | "lastName"
  | "phone"
  | "email"
  | "eventType"
  | "eventTypeOther"
  | "eventDate"
  | "location"
  | "guestCount"
  | "dishes"
  | "services";

type FormErrors = Partial<Record<FieldName, string>>;

const errorOrder: readonly FieldName[] = [
  "firstName",
  "lastName",
  "phone",
  "email",
  "eventType",
  "eventTypeOther",
  "eventDate",
  "location",
  "guestCount",
  "dishes",
  "services",
  "contact",
];

const fieldTargets: Record<FieldName, string> = {
  contact: "catering-contact-lausanne",
  firstName: "catering-first-name",
  lastName: "catering-last-name",
  phone: "catering-phone",
  email: "catering-email",
  eventType: "catering-event-type",
  eventTypeOther: "catering-event-type-other",
  eventDate: "catering-event-date",
  location: "catering-location",
  guestCount: "catering-guest-count",
  dishes: "catering-dishes",
  services: "catering-services",
};

const eventTypes = [
  "Mariage",
  "Anniversaire",
  "Baptême ou cérémonie",
  "Repas de famille",
  "Événement associatif ou communautaire",
  "Événement professionnel",
  "Autre événement",
] as const;

const serviceOptions = [
  { id: "delivery", label: "Livraison" },
  { id: "setup", label: "Mise en place" },
  { id: "buffet", label: "Présentation en buffet" },
  { id: "onsite", label: "Service sur place" },
  { id: "tableware", label: "Vaisselle et matériel" },
  { id: "discuss", label: "À définir avec l’équipe" },
] as const;

const dishOptions = [
  ...menuItems
    .filter((item) => item.category !== "boissons")
    .map((item) => ({ id: item.id, label: item.name })),
  { id: "other-dish", label: "Autre plat ou menu à discuter" },
] as const;

function readText(formData: FormData, field: FieldName | "details") {
  return String(formData.get(field) ?? "").trim();
}

function isPastDate(value: string) {
  const selectedDate = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Number.isNaN(selectedDate.getTime()) || selectedDate < today;
}

function isValidPhone(value: string) {
  return /^[+()\d\s.-]{7,}$/.test(value);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function CateringForm() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [eventType, setEventType] = useState("");
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const visibleErrors = errorOrder.filter((field) => errors[field]);

  function clearError(field: FieldName) {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function handleEventTypeChange(value: string) {
    setEventType(value);
    clearError("eventType");

    if (value !== "Autre événement") {
      clearError("eventTypeOther");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const contactId = readText(formData, "contact") as ContactId;
    const firstName = readText(formData, "firstName");
    const lastName = readText(formData, "lastName");
    const phone = readText(formData, "phone");
    const email = readText(formData, "email");
    const selectedEventType = readText(formData, "eventType");
    const eventTypeOther = readText(formData, "eventTypeOther");
    const eventDate = readText(formData, "eventDate");
    const location = readText(formData, "location");
    const guestCount = readText(formData, "guestCount");
    const details = readText(formData, "details");
    const dishes = formData
      .getAll("dishes")
      .map((value) => String(value));
    const services = formData
      .getAll("services")
      .map((value) => String(value));
    const selectedContact = CONTACTS.find(
      (contact) => contact.id === contactId,
    );
    const nextErrors: FormErrors = {};

    if (!firstName) {
      nextErrors.firstName = "Indiquez votre prénom.";
    }

    if (!lastName) {
      nextErrors.lastName = "Indiquez votre nom.";
    }

    if (!phone) {
      nextErrors.phone = "Indiquez votre numéro de téléphone.";
    } else if (!isValidPhone(phone)) {
      nextErrors.phone = "Vérifiez le format du numéro de téléphone.";
    }

    if (email && !isValidEmail(email)) {
      nextErrors.email = "Vérifiez le format de l’adresse e-mail.";
    }

    if (!selectedEventType) {
      nextErrors.eventType = "Choisissez le type d’événement.";
    }

    if (selectedEventType === "Autre événement" && !eventTypeOther) {
      nextErrors.eventTypeOther = "Précisez le type d’événement.";
    }

    if (!eventDate) {
      nextErrors.eventDate = "Indiquez la date souhaitée.";
    } else if (isPastDate(eventDate)) {
      nextErrors.eventDate = "Choisissez une date à partir d’aujourd’hui.";
    }

    if (!location) {
      nextErrors.location = "Indiquez le lieu de l’événement.";
    }

    if (!guestCount) {
      nextErrors.guestCount = "Indiquez le nombre de convives.";
    } else if (!/^\d+$/.test(guestCount) || Number(guestCount) < 1) {
      nextErrors.guestCount =
        "Indiquez un nombre entier de convives supérieur à zéro.";
    }

    if (dishes.length === 0) {
      nextErrors.dishes = "Choisissez au moins un plat ou l’option à discuter.";
    }

    if (services.length === 0) {
      nextErrors.services =
        "Choisissez au moins un service ou l’option à définir.";
    }

    if (!selectedContact) {
      nextErrors.contact = "Choisissez le contact qui recevra votre demande.";
    }

    if (Object.keys(nextErrors).length > 0 || !selectedContact) {
      setErrors(nextErrors);
      window.requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    setErrors({});

    const whatsappMessage = buildCateringWhatsAppMessage({
      contactArea: selectedContact.area,
      firstName,
      lastName,
      phone,
      email: email || undefined,
      eventType:
        selectedEventType === "Autre événement"
          ? eventTypeOther
          : selectedEventType,
      eventDate,
      location,
      guestCount,
      dishes,
      services,
      details: details || undefined,
    });
    const whatsappUrl = `https://wa.me/${selectedContact.whatsAppPhone}?text=${encodeURIComponent(whatsappMessage)}`;

    window.location.assign(whatsappUrl);
  }

  return (
    <section className={styles.formPanel} aria-labelledby="catering-form-title">
      <div className={styles.formHeading}>
        <h2 id="catering-form-title">Préparez votre demande de devis.</h2>
        <p>
          Ces informations nous permettent d’étudier votre événement. Les
          champs sont requis, sauf mention facultatif.
        </p>
      </div>

      <form className={styles.cateringForm} noValidate onSubmit={handleSubmit}>
        {visibleErrors.length > 0 ? (
          <div
            className={styles.errorSummary}
            ref={errorSummaryRef}
            role="alert"
            tabIndex={-1}
          >
            <strong>Vérifiez les informations suivantes :</strong>
            <ul>
              {visibleErrors.map((field) => (
                <li key={field}>
                  <a href={`#${fieldTargets[field]}`}>{errors[field]}</a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <fieldset className={styles.formSection}>
          <legend>Vos coordonnées</legend>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label htmlFor="catering-first-name">Prénom</label>
              <input
                id="catering-first-name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                maxLength={80}
                required
                aria-invalid={Boolean(errors.firstName)}
                aria-describedby={
                  errors.firstName ? "catering-first-name-error" : undefined
                }
                onChange={() => clearError("firstName")}
              />
              {errors.firstName ? (
                <p
                  className={styles.fieldError}
                  id="catering-first-name-error"
                >
                  {errors.firstName}
                </p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="catering-last-name">Nom</label>
              <input
                id="catering-last-name"
                name="lastName"
                type="text"
                autoComplete="family-name"
                maxLength={80}
                required
                aria-invalid={Boolean(errors.lastName)}
                aria-describedby={
                  errors.lastName ? "catering-last-name-error" : undefined
                }
                onChange={() => clearError("lastName")}
              />
              {errors.lastName ? (
                <p
                  className={styles.fieldError}
                  id="catering-last-name-error"
                >
                  {errors.lastName}
                </p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="catering-phone">Téléphone</label>
              <input
                id="catering-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={40}
                required
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={
                  errors.phone ? "catering-phone-error" : undefined
                }
                onChange={() => clearError("phone")}
              />
              {errors.phone ? (
                <p className={styles.fieldError} id="catering-phone-error">
                  {errors.phone}
                </p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="catering-email">
                E-mail <span className={styles.optionalText}>facultatif</span>
              </label>
              <input
                id="catering-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                maxLength={160}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "catering-email-error" : undefined
                }
                onChange={() => clearError("email")}
              />
              {errors.email ? (
                <p className={styles.fieldError} id="catering-email-error">
                  {errors.email}
                </p>
              ) : null}
            </div>
          </div>
        </fieldset>

        <fieldset className={styles.formSection}>
          <legend>Votre événement</legend>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label htmlFor="catering-event-type">Type d’événement</label>
              <select
                id="catering-event-type"
                name="eventType"
                value={eventType}
                required
                aria-invalid={Boolean(errors.eventType)}
                aria-describedby={
                  errors.eventType ? "catering-event-type-error" : undefined
                }
                onChange={(event) =>
                  handleEventTypeChange(event.currentTarget.value)
                }
              >
                <option value="">Sélectionnez un événement</option>
                {eventTypes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.eventType ? (
                <p
                  className={styles.fieldError}
                  id="catering-event-type-error"
                >
                  {errors.eventType}
                </p>
              ) : null}
            </div>

            {eventType === "Autre événement" ? (
              <div className={styles.field}>
                <label htmlFor="catering-event-type-other">
                  Précisez l’événement
                </label>
                <input
                  id="catering-event-type-other"
                  name="eventTypeOther"
                  type="text"
                  maxLength={100}
                  required
                  aria-invalid={Boolean(errors.eventTypeOther)}
                  aria-describedby={
                    errors.eventTypeOther
                      ? "catering-event-type-other-error"
                      : undefined
                  }
                  onChange={() => clearError("eventTypeOther")}
                />
                {errors.eventTypeOther ? (
                  <p
                    className={styles.fieldError}
                    id="catering-event-type-other-error"
                  >
                    {errors.eventTypeOther}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className={styles.field}>
              <label htmlFor="catering-event-date">Date souhaitée</label>
              <input
                id="catering-event-date"
                name="eventDate"
                type="date"
                required
                aria-invalid={Boolean(errors.eventDate)}
                aria-describedby={
                  errors.eventDate ? "catering-event-date-error" : undefined
                }
                onChange={() => clearError("eventDate")}
              />
              {errors.eventDate ? (
                <p className={styles.fieldError} id="catering-event-date-error">
                  {errors.eventDate}
                </p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="catering-location">Lieu</label>
              <input
                id="catering-location"
                name="location"
                type="text"
                autoComplete="address-level2"
                maxLength={180}
                placeholder="Ville et adresse si elle est connue"
                required
                aria-invalid={Boolean(errors.location)}
                aria-describedby={
                  errors.location ? "catering-location-error" : undefined
                }
                onChange={() => clearError("location")}
              />
              {errors.location ? (
                <p className={styles.fieldError} id="catering-location-error">
                  {errors.location}
                </p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="catering-guest-count">
                Nombre de convives
              </label>
              <input
                id="catering-guest-count"
                name="guestCount"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                required
                aria-invalid={Boolean(errors.guestCount)}
                aria-describedby={
                  errors.guestCount
                    ? "catering-guest-count-error"
                    : undefined
                }
                onChange={() => clearError("guestCount")}
              />
              {errors.guestCount ? (
                <p
                  className={styles.fieldError}
                  id="catering-guest-count-error"
                >
                  {errors.guestCount}
                </p>
              ) : null}
            </div>
          </div>
        </fieldset>

        <fieldset
          className={`${styles.formSection} ${
            errors.dishes || errors.services ? styles.fieldsetError : ""
          }`}
        >
          <legend>Votre prestation</legend>

          <div
            className={styles.choiceGroup}
            id="catering-dishes"
            role="group"
            aria-labelledby="catering-dishes-title"
            aria-describedby={
              errors.dishes ? "catering-dishes-error" : "catering-dishes-help"
            }
          >
            <div className={styles.choiceHeading}>
              <h3 id="catering-dishes-title">Plats souhaités</h3>
              <p id="catering-dishes-help">
                Les quantités seront précisées avec l’équipe.
              </p>
            </div>
            <div className={styles.checkGrid}>
              {dishOptions.map((dish) => (
                <label className={styles.checkOption} key={dish.id}>
                  <input
                    name="dishes"
                    type="checkbox"
                    value={dish.label}
                    onChange={() => clearError("dishes")}
                  />
                  <span aria-hidden="true" />
                  {dish.label}
                </label>
              ))}
            </div>
            {errors.dishes ? (
              <p className={styles.fieldError} id="catering-dishes-error">
                {errors.dishes}
              </p>
            ) : null}
          </div>

          <div
            className={styles.choiceGroup}
            id="catering-services"
            role="group"
            aria-labelledby="catering-services-title"
            aria-describedby={
              errors.services
                ? "catering-services-error"
                : "catering-services-help"
            }
          >
            <div className={styles.choiceHeading}>
              <h3 id="catering-services-title">Services souhaités</h3>
              <p id="catering-services-help">
                Leur disponibilité sera confirmée dans le devis.
              </p>
            </div>
            <div className={styles.checkGrid}>
              {serviceOptions.map((service) => (
                <label className={styles.checkOption} key={service.id}>
                  <input
                    name="services"
                    type="checkbox"
                    value={service.label}
                    onChange={() => clearError("services")}
                  />
                  <span aria-hidden="true" />
                  {service.label}
                </label>
              ))}
            </div>
            {errors.services ? (
              <p className={styles.fieldError} id="catering-services-error">
                {errors.services}
              </p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="catering-details">
              Informations complémentaires{" "}
              <span className={styles.optionalText}>facultatif</span>
            </label>
            <textarea
              id="catering-details"
              name="details"
              rows={5}
              maxLength={2000}
              aria-describedby="catering-details-help"
            />
            <p className={styles.fieldHelp} id="catering-details-help">
              Allergies, contraintes alimentaires, horaires ou autre besoin
              utile à la préparation du devis.
            </p>
          </div>
        </fieldset>

        <fieldset
          className={`${styles.formSection} ${
            errors.contact ? styles.fieldsetError : ""
          }`}
          aria-describedby={
            errors.contact ? "catering-contact-error" : undefined
          }
        >
          <legend>Contact WhatsApp</legend>
          <div className={styles.formContactOptions}>
            {CONTACTS.map((contact) => (
              <label className={styles.contactOption} key={contact.id}>
                <input
                  id={`catering-contact-${contact.id}`}
                  name="contact"
                  type="radio"
                  value={contact.id}
                  required
                  onChange={() => clearError("contact")}
                />
                <span className={styles.contactOptionCopy}>
                  <strong>{contact.area}</strong>
                  <span>{contact.displayPhone}</span>
                </span>
                <span className={styles.radioMark} aria-hidden="true" />
              </label>
            ))}
          </div>
          {errors.contact ? (
            <p className={styles.fieldError} id="catering-contact-error">
              {errors.contact}
            </p>
          ) : null}
        </fieldset>

        <div className={styles.submitArea}>
          <p>
            Aucun paiement n’est demandé. Vous pourrez relire le message avant
            de l’envoyer.
          </p>
          <button className={styles.submitButton} type="submit">
            <MessageIcon />
            Continuer sur WhatsApp
            <ArrowRightIcon />
          </button>
        </div>
      </form>
    </section>
  );
}
