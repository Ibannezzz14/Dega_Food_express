import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CheckIcon,
  HeartIcon,
  HomeIcon,
  MessageIcon,
  PeopleIcon,
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
      "Présentez l’occasion, la date souhaitée et le format de repas que vous imaginez.",
    icon: HeartIcon,
  },
  {
    title: "Repas de famille",
    description:
      "Indiquez le nombre de convives et les plats que vous souhaitez partager.",
    icon: HomeIcon,
  },
  {
    title: "Associations & communautés",
    description:
      "Expliquez le contexte de votre rencontre afin que la demande puisse être étudiée.",
    icon: PeopleIcon,
  },
  {
    title: "Événements professionnels",
    description:
      "Communiquez les informations utiles sur votre réception et son organisation.",
    icon: BriefcaseIcon,
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
  label: string;
  title: string;
  description?: string;
  titleId: string;
};

function SectionHeading({
  label,
  title,
  description,
  titleId,
}: SectionHeadingProps) {
  return (
    <header className={styles.sectionHeading}>
      <div>
        <p className={styles.sectionLabel}>{label}</p>
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
            <p className={styles.eyebrow}>Service traiteur</p>
            <h1 id="catering-title">
              Vos événements autour d’une cuisine ivoirienne généreuse.
            </h1>
            <p className={styles.heroText}>
              Marie-José et Geneviève étudient chaque demande à partir de votre
              occasion, du nombre de convives et des plats souhaités.
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
            <p className={styles.heroNote}>
              <CheckIcon />
              Devis établi sur demande après échange avec l’équipe.
            </p>
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
            label="Notre approche"
            title="Une demande étudiée avec vous."
            titleId="catering-approach-title"
          />
          <div className={styles.approachCopy}>
            <p>
              Le service traiteur ne repose pas sur une formule unique. Vous
              présentez votre événement et l’équipe échange avec vous pour
              préciser ce qui peut être proposé.
            </p>
            <ul>
              <li>
                <CheckIcon />
                Sélection des plats et quantités à définir
              </li>
              <li>
                <CheckIcon />
                Informations pratiques discutées avant confirmation
              </li>
              <li>
                <CheckIcon />
                Devis communiqué après étude de la demande
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
            label="Vos occasions"
            title="Parlez-nous du moment que vous préparez."
            description="Ces exemples vous aident à présenter votre demande. Les possibilités restent à confirmer avec l’équipe."
            titleId="event-types-title"
          />
          <div className={styles.eventGrid}>
            {eventTypes.map((event) => {
              const Icon = event.icon;

              return (
                <article className={styles.eventCard} key={event.title}>
                  <span className={styles.cardIcon} aria-hidden="true">
                    <Icon />
                  </span>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.process} aria-labelledby="process-title">
        <div className={styles.sectionShell}>
          <SectionHeading
            label="Comment ça se passe ?"
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
              label="À savoir"
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
            <p className={styles.sectionLabel}>Devis sur demande</p>
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
            {CONTACTS.map((contact, index) => (
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
                  <small>WhatsApp · contact {index + 1}</small>
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
