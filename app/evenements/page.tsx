import type { Metadata } from "next";
import Image from "next/image";
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
      "Livraison, mise en place, buffet, matériel et personnel sont étudiés selon le lieu et vos besoins.",
  },
  {
    title: "Le devis",
    description:
      "Le prix et les modalités sont communiqués avant toute confirmation.",
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
                Demander un devis
                <ArrowRightIcon />
              </a>
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
          <h2 id="catering-contacts-title">Appeler directement</h2>
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
              aria-label={`Appeler pour un devis traiteur au ${CATERING_CONTACT.displayPhone}`}
            >
              <span className={styles.finalContactCopy}>
                <span>{CATERING_CONTACT.label}</span>
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
