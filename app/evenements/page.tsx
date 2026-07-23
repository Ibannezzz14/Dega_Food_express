import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  MessageIcon,
} from "@/components/icons";
import { CONTACTS } from "@/data/contact";
import { createPageMetadata } from "@/lib/page-metadata";
import CateringFaq from "./catering-faq";
import styles from "./evenements.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Service traiteur ivoirien | Dega Food Express",
  description:
    "Présentez votre événement à Dega Food Express et demandez un devis traiteur établi selon les informations communiquées.",
  path: "/evenements",
  image: {
    url: "/images/menu/alloco-poisson-braise-proprietaire.webp",
    width: 720,
    height: 720,
    alt: "Poisson braisé servi avec de l’alloco et des crudités",
  },
});

const eventTypes = [
  {
    title: "Fêtes & cérémonies",
    description:
      "Précisez l’occasion, la date souhaitée et le format de repas.",
  },
  {
    title: "Repas de famille",
    description:
      "Indiquez le nombre de convives et les plats que vous souhaitez.",
  },
  {
    title: "Associations & communautés",
    description:
      "Présentez votre rencontre et les besoins de votre groupe.",
  },
  {
    title: "Événements professionnels",
    description:
      "Transmettez les informations utiles sur votre réception.",
  },
] as const;

const processSteps = [
  {
    title: "Présentez votre événement",
    description:
      "Précisez l’occasion, la date, la localité et le nombre estimé de convives.",
  },
  {
    title: "Partagez vos envies",
    description:
      "Mentionnez les plats envisagés, le format souhaité et les informations alimentaires utiles.",
  },
  {
    title: "Échangez avec l’équipe",
    description:
      "Marie-José et Geneviève vous indiquent les possibilités après étude de votre demande.",
  },
  {
    title: "Recevez votre devis",
    description:
      "Le montant et les modalités vous sont communiqués avant toute confirmation.",
  },
] as const;

type SectionHeadingProps = {
  title: string;
  description?: string;
  titleId: string;
};

function SectionHeading({
  title,
  description,
  titleId,
}: SectionHeadingProps) {
  return (
    <header className={styles.sectionHeading}>
      <div>
        <h2 id={titleId}>{title}</h2>
      </div>
      {description ? <p>{description}</p> : null}
    </header>
  );
}

function quoteUrl(phone: string) {
  const message = [
    "Bonjour Dega Food Express,",
    "",
    "Je souhaite demander un devis pour une prestation traiteur.",
    "",
    "Type d’événement :",
    "Date souhaitée :",
    "Nombre de convives :",
    "Localité :",
    "Plats envisagés :",
    "Format souhaité :",
    "Allergies ou contraintes à signaler :",
  ].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export default function EventsPage() {
  return (
    <main id="contenu" className={styles.page}>
      <section className={styles.hero} aria-labelledby="catering-title">
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <h1 id="catering-title">
              Une cuisine ivoirienne pour votre événement.
            </h1>
            <p className={styles.heroText}>
              Dites-nous ce que vous préparez, le nombre de convives et les
              plats souhaités. Marie-José et Geneviève vous répondent avec les
              possibilités et un devis.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="#devis-traiteur">
                Demander un devis
                <ArrowRightIcon />
              </a>
              <Link className={styles.secondaryButton} href="/carte">
                Voir les spécialités
              </Link>
            </div>
          </div>

          <figure className={styles.heroVisual}>
            <Image
              src="/images/menu/alloco-poisson-braise-proprietaire.webp"
              alt="Poisson braisé servi avec de l’alloco et des crudités"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 52vw"
            />
          </figure>
        </div>
      </section>

      <section
        className={styles.approach}
        aria-labelledby="catering-approach-title"
      >
        <div className={styles.approachInner}>
          <SectionHeading
            title="Un service adapté à votre événement."
            titleId="catering-approach-title"
          />
          <div className={styles.approachCopy}>
            <p>
              Il n’y a pas de formule imposée. Nous échangeons avec vous sur
              les plats, les quantités et l’organisation avant de confirmer la
              prestation.
            </p>
            <ul>
              <li>
                Sélection des plats et quantités à définir
              </li>
              <li>
                Informations pratiques discutées avant confirmation
              </li>
              <li>
                Prix communiqué dans un devis
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section
        className={styles.eventTypes}
        aria-labelledby="event-types-title"
      >
        <div className={styles.sectionShell}>
          <SectionHeading
            title="Parlez-nous du moment que vous préparez."
            description="Voici quelques exemples. Vous pouvez aussi nous écrire pour un autre type d’événement."
            titleId="event-types-title"
          />
          <div className={styles.eventGrid}>
            {eventTypes.map((event) => (
              <article className={styles.eventCard} key={event.title}>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.process} aria-labelledby="process-title">
        <div className={styles.sectionShell}>
          <SectionHeading
            title="Quatre étapes avant confirmation."
            description="Une prise de contact ne confirme pas encore la prestation."
            titleId="process-title"
          />
          <ol className={styles.processList}>
            {processSteps.map((step, index) => (
              <li key={step.title}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.faq} aria-labelledby="faq-title">
        <div className={styles.faqInner}>
          <div className={styles.faqIntro}>
            <SectionHeading
              title="Les réponses utiles avant de nous écrire."
              titleId="faq-title"
            />
            <aside
              className={styles.allergenNote}
              aria-labelledby="allergen-title"
            >
              <h3 id="allergen-title">Allergies et contraintes alimentaires</h3>
              <p>
                Signalez-les dès le premier échange. L’équipe vous indiquera
                les possibilités, sans pouvoir garantir une absence totale de
                contamination croisée.
              </p>
            </aside>
          </div>
          <CateringFaq />
        </div>
      </section>

      <section
        className={styles.finalCta}
        id="devis-traiteur"
        aria-labelledby="devis-traiteur-title"
      >
        <div className={styles.finalCtaInner}>
          <div className={styles.finalCtaCopy}>
            <h2 id="devis-traiteur-title">
              Présentez-nous votre événement sur WhatsApp.
            </h2>
            <p>
              Choisissez l’un des deux contacts. Un message prérempli vous aide
              à transmettre les informations nécessaires.
            </p>
          </div>

          <div
            className={styles.contactOptions}
            role="group"
            aria-label="Contacts WhatsApp du service traiteur"
          >
            {CONTACTS.map((contact) => (
              <a
                key={contact.whatsAppPhone}
                href={quoteUrl(contact.whatsAppPhone)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Préparer une demande de devis traiteur sur WhatsApp au ${contact.displayPhone} (s’ouvre dans un nouvel onglet)`}
              >
                <span className={styles.contactIcon} aria-hidden="true">
                  <MessageIcon />
                </span>
                <span>
                  <small>{contact.area}</small>
                  <strong>{contact.displayPhone}</strong>
                </span>
                <ArrowRightIcon aria-hidden="true" />
              </a>
            ))}
            <p>
              Les deux contacts reçoivent les demandes de service traiteur.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
