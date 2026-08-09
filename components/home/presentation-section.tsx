import Image from "next/image";
import styles from "./presentation-section.module.css";

export default function PresentationSection() {
  return (
    <section
      className={styles.presentation}
      id="presentation"
      aria-labelledby="presentation-title"
    >
      <div className={styles.presentationVisual}>
        <Image
          src="/images/menu/alloco-poulet-choukouya-retouche.webp"
          alt="Alloco servi avec du poulet choukouya et des crudités"
          fill
          sizes="(max-width: 760px) 100vw, 44vw"
        />
      </div>
      <div className={styles.presentationCopy}>
        <h2 id="presentation-title">
          Geneviève et Marie-José, derrière Dega Food Express.
        </h2>
      </div>
    </section>
  );
}
