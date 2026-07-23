import Image from "next/image";
import styles from "./order-experience.module.css";

type PresentationSectionProps = {
  asPage?: boolean;
};

export default function PresentationSection({
  asPage = false,
}: PresentationSectionProps) {
  return (
    <section
      className={styles.presentation}
      id="presentation"
      aria-labelledby="presentation-title"
    >
      <div className={styles.presentationVisual}>
        <Image
          src="/images/gallery-feast.webp"
          alt="Table garnie de plats ivoiriens à partager"
          fill
          priority={asPage}
          sizes="(max-width: 760px) 100vw, 44vw"
        />
      </div>
      <div className={styles.presentationCopy}>
        <p className={styles.presentationLabel}>
          {asPage ? "Présentation" : "La maison Dega"}
        </p>
        {asPage ? (
          <h1 id="presentation-title">
            Une cuisine de partage, préparée sur commande.
          </h1>
        ) : (
          <h2 id="presentation-title">
            Une cuisine de partage, préparée sur commande.
          </h2>
        )}
        <p className={styles.presentationIntro}>
          Dega Food Express propose des spécialités ivoiriennes à Lausanne,
          Lucens et alentours, pour les commandes individuelles comme pour les
          grandes tablées.
        </p>
        <dl className={styles.presentationFacts}>
          <div>
            <dt>Sur commande</dt>
            <dd>Vous choisissez les plats et les quantités.</dd>
          </div>
          <div>
            <dt>Deux zones</dt>
            <dd>Lausanne ou Lucens et alentours.</dd>
          </div>
          <div>
            <dt>Tous les formats</dt>
            <dd>Repas individuel, famille ou événement.</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
