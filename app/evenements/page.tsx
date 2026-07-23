/**
 * THESIS: La page transforme l’intérêt pour un événement en brief de devis,
 * sans reprendre le parcours de commande individuelle.
 * OWN-WORLD: Vert minéral, ivoire et laiton structurent de grands champs,
 * des photographies réelles et des lignes éditoriales sobres.
 * STORY: Comprendre le service traiteur, préparer les informations utiles,
 * puis contacter directement l’un des deux numéros traiteur.
 * FIRST VIEWPORT: Offre et mention « devis sur demande » à gauche, réception
 * réelle en grand format à droite, action visible sans faire défiler.
 * FORM: « Le devis comme parcours », structure 4, seed c286d901.
 */
import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRightIcon } from "@/components/icons";
import GallerySection from "../gallery-section";
import styles from "./evenements.module.css";

export const metadata: Metadata = {
  title: "Service traiteur | Dega Food Express",
  description:
    "Service traiteur ivoirien pour repas de famille, associations et événements. Devis sur demande.",
};

const cateringContacts = [
  {
    phone: "41782654081",
    displayPhone: "078 265 40 81",
  },
  {
    phone: "41766036011",
    displayPhone: "076 603 60 11",
  },
] as const;

const quoteDetails = [
  {
    label: "Votre événement",
    text: "Le type de réception et la date souhaitée.",
  },
  {
    label: "Le nombre de personnes",
    text: "Une estimation du nombre de convives.",
  },
  {
    label: "Le lieu",
    text: "La localité et les informations utiles pour la prestation.",
  },
  {
    label: "Vos préférences",
    text: "Les plats envisagés et les précisions importantes.",
  },
] as const;

function quoteUrl(phone: string) {
  const message = [
    "Bonjour Dega Food Express,",
    "",
    "Je souhaite demander un devis pour le service traiteur.",
    "",
    "Type d’événement :",
    "Date :",
    "Nombre de personnes :",
    "Lieu :",
    "Plats souhaités :",
  ].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export default function EventsPage() {
  return (
    <main id="contenu">
      <section
        className={styles.cateringHero}
        aria-labelledby="catering-title"
      >
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Service traiteur</p>
            <h1 id="catering-title">
              Une table ivoirienne pensée pour votre événement.
            </h1>
            <p className={styles.heroText}>
              Repas de famille, anniversaires, associations ou événements :
              présentez-nous votre projet pour recevoir une proposition adaptée
              à votre demande.
            </p>
            <div className={styles.quoteNotice}>
              <span>Tarification</span>
              <strong>Devis sur demande</strong>
            </div>
            <a className={styles.heroAction} href="#devis">
              Demander un devis
              <ArrowRightIcon />
            </a>
          </div>

          <div className={styles.heroVisual} aria-label="Service traiteur Dega Food">
            <div className={styles.heroMainImage}>
              <Image
                src="/images/gallery-event.webp"
                alt="Réception avec un repas organisé par Dega Food Express"
                fill
                priority
                sizes="(max-width: 760px) 92vw, 48vw"
              />
            </div>
            <div className={styles.heroDetailImage}>
              <Image
                src="/images/gallery-sharing.webp"
                alt="Plat ivoirien préparé pour être partagé"
                fill
                sizes="(max-width: 760px) 42vw, 240px"
              />
            </div>
            <p className={styles.imageCaption}>
              Repas privés · associations · événements
            </p>
          </div>
        </div>
      </section>

      <section className={styles.briefSection} aria-labelledby="brief-title">
        <div className={styles.briefHeading}>
          <div>
            <p className={styles.sectionLabel}>Préparer votre demande</p>
            <h2 id="brief-title">
              Les informations utiles pour établir le devis.
            </h2>
          </div>
          <p>
            Aucun tarif standard n’est appliqué à cette prestation. Le devis
            est préparé après réception des informations concernant votre
            événement.
          </p>
        </div>

        <dl className={styles.briefList}>
          {quoteDetails.map((detail) => (
            <div key={detail.label}>
              <dt>{detail.label}</dt>
              <dd>{detail.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        className={styles.quoteSection}
        id="devis"
        aria-labelledby="quote-title"
      >
        <div className={styles.quoteIntro}>
          <p className={styles.sectionLabel}>Demande de devis</p>
          <h2 id="quote-title">Parlons de votre événement.</h2>
          <p>
            Envoyez votre demande à l’un des deux contacts. Un message prérempli
            vous aidera à transmettre les premières informations.
          </p>
        </div>

        <div className={styles.quoteContacts}>
          {cateringContacts.map((contact) => (
            <a
              key={contact.phone}
              href={quoteUrl(contact.phone)}
              target="_blank"
              rel="noreferrer"
            >
              <span>
                <small>WhatsApp</small>
                <strong>{contact.displayPhone}</strong>
              </span>
              <ArrowRightIcon />
            </a>
          ))}
          <p>
            Le montant du devis est communiqué après étude de votre demande.
          </p>
        </div>
      </section>

      <GallerySection />
    </main>
  );
}
