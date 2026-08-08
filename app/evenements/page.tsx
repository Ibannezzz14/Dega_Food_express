import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/shared/icons";
import {
  CATERING_AREA_SETTINGS,
  CATERING_CONTACT,
  ORDER_CONTACT,
} from "@/config/site-config";
import { createPageMetadata } from "@/lib/page-metadata";
import CateringFaq from "./catering-faq";
import CateringForm from "./catering-form";
import styles from "./evenements.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Traiteur ivoirien en Suisse | Dega Food Express",
  description:
    "Demandez un devis personnalisé pour un service traiteur ivoirien disponible dans toute la Suisse.",
  path: "/evenements",
  image: {
    url: "/images/menu/alloco-poisson-braise-retouche.webp",
    width: 720,
    height: 720,
    alt: "Poisson braisé servi avec de l’alloco et des crudités",
  },
});

const serviceDetails = [
  {
    title: "Le menu",
    description:
      "Les plats et les quantités sont définis selon votre événement et le nombre de convives.",
  },
  {
    title: "L’organisation",
    description:
      "Livraison, mise en place, buffet ou service sont étudiés selon vos besoins.",
  },
  {
    title: "Le devis",
    description:
      "Le prix et les modalités sont communiqués avant toute confirmation.",
  },
  {
    title: "La zone",
    description: `${CATERING_AREA_SETTINGS.availabilityMessage}. Le lieu et les besoins logistiques sont intégrés au devis.`,
  },
] as const;

const processSteps = [
  {
    title: "Vous présentez votre événement",
  },
  {
    title: "Nous étudions la demande",
  },
  {
    title: "Vous recevez le devis",
  },
] as const;

export default function EventsPage() {
  return (
    <main id="contenu" className={styles.page} tabIndex={-1}>
      <section className={styles.hero} aria-labelledby="catering-title">
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <h1 id="catering-title">
              Un service traiteur pour votre événement.
            </h1>
            <p className={styles.heroText}>
              Repas de famille, cérémonie, association ou réception
              professionnelle&nbsp;: indiquez le lieu, la date et le nombre de
              convives. Nous préparons le devis.
            </p>
            <p className={styles.heroArea}>
              {CATERING_AREA_SETTINGS.availabilityMessage}.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="#devis-traiteur">
                Préparer ma demande
                <ArrowRightIcon />
              </a>
              <Link className={styles.secondaryButton} href="/carte">
                Voir la carte
              </Link>
            </div>
          </div>

          <figure className={styles.heroVisual}>
            <Image
              src="/images/menu/alloco-poisson-braise-retouche.webp"
              alt="Poisson braisé et alloco présentés dans des barquettes"
              fill
              priority
              sizes="(max-width: 896px) calc(100vw - 2rem), (max-width: 1280px) 54vw, 640px"
            />
          </figure>
        </div>
      </section>

      <section className={styles.overview} aria-labelledby="overview-title">
        <div className={styles.overviewInner}>
          <div className={styles.overviewCopy}>
            <h2 id="overview-title">
              Ce que le devis précise.
            </h2>
          </div>

          <dl className={styles.serviceList}>
            {serviceDetails.map((detail) => (
              <div key={detail.title}>
                <dt>{detail.title}</dt>
                <dd>{detail.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={styles.process} aria-labelledby="process-title">
        <div className={styles.sectionShell}>
          <header className={styles.processHeading}>
            <h2 id="process-title">Comment se prépare votre devis.</h2>
          </header>

          <ol className={styles.processList}>
            {processSteps.map((step, index) => (
              <li key={step.title}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {index + 1}
                </span>
                <div>
                  <h3>{step.title}</h3>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div
        className={styles.quoteSection}
        id="devis-traiteur"
      >
        <div className={styles.quoteInner}>
          <CateringForm />
        </div>
      </div>

      <section className={styles.faq} aria-labelledby="faq-title">
        <div className={styles.faqInner}>
          <header className={styles.faqHeading}>
            <h2 id="faq-title">Questions fréquentes</h2>
          </header>
          <CateringFaq />
        </div>
      </section>

      <section
        className={styles.finalContacts}
        aria-labelledby="catering-contacts-title"
      >
        <div className={`${styles.sectionShell} ${styles.finalContactsInner}`}>
          <h2 id="catering-contacts-title">Contacts directs</h2>
          <address className={styles.finalContactList}>
            <a
              className={styles.finalContactCard}
              href={ORDER_CONTACT.phoneHref}
              aria-label={`Appeler pour les commandes, la livraison ou le service traiteur au ${ORDER_CONTACT.displayPhone}`}
            >
              <span className={styles.finalContactCopy}>
                <span>{ORDER_CONTACT.label}</span>
                <strong>{ORDER_CONTACT.displayPhone}</strong>
              </span>
              <ArrowRightIcon />
            </a>

            <a
              className={styles.finalContactCard}
              href={CATERING_CONTACT.phoneHref}
              aria-label={`Appeler le service traiteur au ${CATERING_CONTACT.displayPhone}`}
            >
              <span className={styles.finalContactCopy}>
                <span>Service traiteur</span>
                <strong>{CATERING_CONTACT.displayPhone}</strong>
              </span>
              <ArrowRightIcon />
            </a>
          </address>
        </div>
      </section>
    </main>
  );
}
