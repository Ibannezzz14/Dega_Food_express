import Image from "next/image";
import styles from "./order-experience.module.css";

export default function PresentationSection() {
  return (
    <section
      className={styles.presentation}
      id="presentation"
      aria-labelledby="presentation-title"
    >
      <div className={styles.presentationVisual}>
        <Image
          src="/images/menu/alloco-poulet-choukouya-proprietaire.webp"
          alt="Alloco servi avec du poulet choukouya et des crudités"
          fill
          sizes="(max-width: 760px) 100vw, 44vw"
        />
      </div>
      <div className={styles.presentationCopy}>
        <h2 id="presentation-title">
          Une cuisine de partage, préparée sur commande.
        </h2>
        <p className={styles.presentationIntro}>
          Dega Food Express propose des spécialités ivoiriennes à Lausanne,
          Lucens et alentours, pour un repas individuel, en famille ou lors
          d’un événement.
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
