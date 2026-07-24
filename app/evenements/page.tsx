import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { createPageMetadata } from "@/lib/page-metadata";
import CateringFaq from "./catering-faq";
import CateringForm from "./catering-form";
import styles from "./evenements.module.css";

/*
 * THESIS: Présenter le traiteur comme un devis clair, pas comme un catalogue de promesses.
 * OWN-WORLD: Vert minéral, ivoire, laiton discret, cadres fins et photographie culinaire réelle.
 * STORY: Comprendre l’offre, connaître le déroulement, transmettre les informations utiles.
 * FIRST VIEWPORT: Promesse et action à gauche, plat servi à droite, sans badge ni décor superflu.
 * FORM: Dossier de réception, structure 7 attribuée par la graine cc7fa073, lecture linéaire.
 */

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
] as const;

const processSteps = [
  {
    title: "Vous présentez votre événement",
    description:
      "Date, lieu, nombre de convives, plats envisagés et services souhaités.",
  },
  {
    title: "Nous étudions la demande",
    description:
      "Marie-José et Geneviève échangent avec vous sur les possibilités.",
  },
  {
    title: "Vous recevez le devis",
    description:
      "La prestation est confirmée après validation du devis et des modalités.",
  },
] as const;

export default function EventsPage() {
  return (
    <main id="contenu" className={styles.page}>
      <section className={styles.hero} aria-labelledby="catering-title">
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <h1 id="catering-title">
              Un service traiteur pensé pour votre événement.
            </h1>
            <p className={styles.heroText}>
              Repas de famille, cérémonie, association ou réception
              professionnelle&nbsp;: nous préparons une proposition selon vos
              besoins. Le devis est établi sur demande.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="#devis-traiteur">
                Préparer ma demande
                <ArrowRightIcon />
              </a>
              <Link className={styles.secondaryButton} href="/carte">
                Consulter la carte
              </Link>
            </div>
          </div>

          <figure className={styles.heroVisual}>
            <Image
              src="/images/menu/alloco-poisson-braise-proprietaire.webp"
              alt="Poisson braisé et alloco présentés dans des barquettes"
              fill
              priority
              sizes="(max-width: 800px) 100vw, 54vw"
            />
          </figure>
        </div>
      </section>

      <section className={styles.overview} aria-labelledby="overview-title">
        <div className={styles.overviewInner}>
          <div className={styles.overviewCopy}>
            <h2 id="overview-title">
              Une proposition adaptée à votre réception.
            </h2>
            <p>
              Chaque demande est étudiée séparément. Indiquez-nous l’occasion,
              la date, le lieu et le nombre de convives&nbsp;: nous échangeons
              ensuite avec vous sur le menu et l’organisation.
            </p>
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
            <p>
              Trois étapes simples, de votre première demande à la
              confirmation.
            </p>
          </header>

          <ol className={styles.processList}>
            {processSteps.map((step, index) => (
              <li key={step.title}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {index + 1}
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

      <section
        className={styles.quoteSection}
        id="devis-traiteur"
        aria-labelledby="catering-form-title"
      >
        <div className={styles.quoteInner}>
          <CateringForm />
        </div>
      </section>

      <section className={styles.faq} aria-labelledby="faq-title">
        <div className={styles.faqInner}>
          <header className={styles.faqHeading}>
            <h2 id="faq-title">Avant votre demande.</h2>
            <p>
              Les informations essentielles sur le devis, la confirmation et
              les contraintes alimentaires.
            </p>
          </header>
          <CateringFaq />
        </div>
      </section>
    </main>
  );
}
