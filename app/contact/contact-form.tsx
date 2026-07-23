"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowRightIcon, MessageIcon } from "@/components/icons";
import { CONTACTS, type ContactId } from "@/data/contact";
import styles from "./contact.module.css";

type FieldName =
  | "contact"
  | "firstName"
  | "lastName"
  | "phone"
  | "subject"
  | "eventType"
  | "eventDate"
  | "guestCount"
  | "message";

type FormErrors = Partial<Record<FieldName, string>>;

const errorOrder: readonly FieldName[] = [
  "contact",
  "firstName",
  "lastName",
  "phone",
  "subject",
  "eventType",
  "eventDate",
  "guestCount",
  "message",
];

const fieldTargets: Record<FieldName, string> = {
  contact: "contact-lausanne",
  firstName: "firstName",
  lastName: "lastName",
  phone: "phone",
  subject: "subject",
  eventType: "eventType",
  eventDate: "eventDate",
  guestCount: "guestCount",
  message: "message",
};

function readText(formData: FormData, field: FieldName) {
  return String(formData.get(field) ?? "").trim();
}

function formatSwissDate(value: string) {
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}.${month}.${year}`;
}

function fieldDescription(error: string | undefined, helperId?: string) {
  return [helperId, error ? `${helperId ?? "field"}-error` : null]
    .filter(Boolean)
    .join(" ");
}

export default function ContactForm() {
  const [errors, setErrors] = useState<FormErrors>({});
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const contactId = readText(formData, "contact") as ContactId;
    const firstName = readText(formData, "firstName");
    const lastName = readText(formData, "lastName");
    const phone = readText(formData, "phone");
    const subject = readText(formData, "subject");
    const eventType = readText(formData, "eventType");
    const eventDate = readText(formData, "eventDate");
    const guestCount = readText(formData, "guestCount");
    const message = readText(formData, "message");
    const selectedContact = CONTACTS.find(
      (contact) => contact.id === contactId,
    );
    const nextErrors: FormErrors = {};

    if (!selectedContact) {
      nextErrors.contact = "Choisissez le contact qui recevra votre demande.";
    }

    if (!firstName) {
      nextErrors.firstName = "Indiquez votre prénom.";
    }

    if (!lastName) {
      nextErrors.lastName = "Indiquez votre nom.";
    }

    if (!subject) {
      nextErrors.subject = "Indiquez l’objet de votre demande.";
    }

    if (
      guestCount &&
      (!/^\d+$/.test(guestCount) || Number(guestCount) < 1)
    ) {
      nextErrors.guestCount =
        "Indiquez un nombre entier de convives supérieur à zéro.";
    }

    if (!message) {
      nextErrors.message = "Décrivez votre demande.";
    }

    if (Object.keys(nextErrors).length > 0 || !selectedContact) {
      setErrors(nextErrors);
      window.requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    setErrors({});

    const whatsappMessage = [
      "Bonjour Dega Food Express,",
      "",
      "Je vous contacte depuis le formulaire du site.",
      "",
      `Contact choisi : ${selectedContact.area}`,
      `Prénom et nom : ${firstName} ${lastName}`,
      ...(phone ? [`Téléphone : ${phone}`] : []),
      `Objet : ${subject}`,
      ...(eventType ? [`Type d’événement : ${eventType}`] : []),
      ...(eventDate
        ? [`Date souhaitée : ${formatSwissDate(eventDate)}`]
        : []),
      ...(guestCount ? [`Nombre de convives : ${guestCount}`] : []),
      "",
      "Message :",
      message,
    ].join("\n");

    const whatsappUrl = `https://wa.me/${selectedContact.whatsAppPhone}?text=${encodeURIComponent(whatsappMessage)}`;
    window.location.assign(whatsappUrl);
  }

  return (
    <section className={styles.formPanel} aria-labelledby="contact-form-title">
      <div className={styles.formHeading}>
        <h2 id="contact-form-title">Préparez votre message.</h2>
        <p>
          Complétez les champs obligatoires. Vous pourrez relire le texte avant
          de l’envoyer sur WhatsApp.
        </p>
      </div>

      <form className={styles.form} noValidate onSubmit={handleSubmit}>
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

        <fieldset
          className={`${styles.contactChoice} ${
            errors.contact ? styles.fieldsetError : ""
          }`}
          aria-describedby={errors.contact ? "contact-error" : undefined}
        >
          <legend>
            Qui souhaitez-vous contacter ?{" "}
            <span className={styles.requiredText}>obligatoire</span>
          </legend>
          <div className={styles.contactOptions}>
            {CONTACTS.map((contact) => (
              <label className={styles.contactOption} key={contact.id}>
                <input
                  id={`contact-${contact.id}`}
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
            <p className={styles.fieldError} id="contact-error">
              {errors.contact}
            </p>
          ) : null}
        </fieldset>

        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label htmlFor="firstName">
              Prénom{" "}
              <span className={styles.requiredText}>obligatoire</span>
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              maxLength={80}
              required
              aria-invalid={Boolean(errors.firstName)}
              aria-describedby={
                errors.firstName ? "firstName-error" : undefined
              }
              onChange={() => clearError("firstName")}
            />
            {errors.firstName ? (
              <p className={styles.fieldError} id="firstName-error">
                {errors.firstName}
              </p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="lastName">
              Nom <span className={styles.requiredText}>obligatoire</span>
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              maxLength={80}
              required
              aria-invalid={Boolean(errors.lastName)}
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
              onChange={() => clearError("lastName")}
            />
            {errors.lastName ? (
              <p className={styles.fieldError} id="lastName-error">
                {errors.lastName}
              </p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="phone">
              Téléphone <span className={styles.optionalText}>facultatif</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={40}
              aria-describedby="phone-help"
              onChange={() => clearError("phone")}
            />
            <p className={styles.fieldHelp} id="phone-help">
              Pour pouvoir vous rappeler si nécessaire.
            </p>
          </div>

          <div className={styles.field}>
            <label htmlFor="subject">
              Objet <span className={styles.requiredText}>obligatoire</span>
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              maxLength={120}
              required
              aria-invalid={Boolean(errors.subject)}
              aria-describedby={errors.subject ? "subject-error" : undefined}
              onChange={() => clearError("subject")}
            />
            {errors.subject ? (
              <p className={styles.fieldError} id="subject-error">
                {errors.subject}
              </p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="eventType">
              Type d’événement{" "}
              <span className={styles.optionalText}>facultatif</span>
            </label>
            <input
              id="eventType"
              name="eventType"
              type="text"
              maxLength={100}
              onChange={() => clearError("eventType")}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="eventDate">
              Date souhaitée{" "}
              <span className={styles.optionalText}>facultatif</span>
            </label>
            <input
              id="eventDate"
              name="eventDate"
              type="date"
              onChange={() => clearError("eventDate")}
            />
          </div>

          <div className={`${styles.field} ${styles.compactField}`}>
            <label htmlFor="guestCount">
              Nombre de convives{" "}
              <span className={styles.optionalText}>facultatif</span>
            </label>
            <input
              id="guestCount"
              name="guestCount"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              aria-invalid={Boolean(errors.guestCount)}
              aria-describedby={
                errors.guestCount ? "guestCount-error" : undefined
              }
              onChange={() => clearError("guestCount")}
            />
            {errors.guestCount ? (
              <p className={styles.fieldError} id="guestCount-error">
                {errors.guestCount}
              </p>
            ) : null}
          </div>

          <div className={`${styles.field} ${styles.messageField}`}>
            <label htmlFor="message">
              Votre message{" "}
              <span className={styles.requiredText}>obligatoire</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={7}
              maxLength={2000}
              required
              aria-invalid={Boolean(errors.message)}
              aria-describedby={fieldDescription(
                errors.message,
                "message-help",
              )}
              onChange={() => clearError("message")}
            />
            <p className={styles.fieldHelp} id="message-help">
              Précisez les plats, quantités ou informations utiles à votre
              demande.
            </p>
            {errors.message ? (
              <p className={styles.fieldError} id="message-help-error">
                {errors.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className={styles.submitArea}>
          <button className={styles.submitButton} type="submit">
            <MessageIcon />
            Préparer le message sur WhatsApp
            <ArrowRightIcon />
          </button>
        </div>
      </form>
    </section>
  );
}
