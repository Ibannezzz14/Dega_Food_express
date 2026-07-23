import Image from "next/image";
import styles from "./page.module.css";

export default function GallerySection() {
  return (
    <section className={styles.gallery} id="galerie" aria-labelledby="gallery-title">
      <header className={styles.galleryHeader}>
        <div>
          <p>Quelques spécialités</p>
          <h2 id="gallery-title">Autour de la table.</h2>
        </div>
      </header>
      <div className={styles.galleryGrid}>
        <figure className={styles.galleryTall}>
          <Image
            src="/images/editorial/alloco-tilapia-ivoirien.webp"
            alt="Tilapia braisé servi avec de l’alloco et une sauce tomate"
            fill
            sizes="(max-width: 760px) 100vw, 38vw"
          />
        </figure>
        <figure>
          <Image
            src="/images/menu/beignets-africains.webp"
            alt="Beignets africains dorés présentés sans accompagnement"
            fill
            sizes="(max-width: 760px) 50vw, 27vw"
          />
        </figure>
        <figure>
          <Image
            src="/images/menu/drinks/bissap.webp"
            alt="Bissap rouge servi frais avec des glaçons"
            fill
            sizes="(max-width: 760px) 50vw, 27vw"
          />
        </figure>
      </div>
    </section>
  );
}
