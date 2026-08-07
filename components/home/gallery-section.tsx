import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/shared/icons";
import styles from "./gallery-section.module.css";

export default function GallerySection() {
  return (
    <section className={styles.gallery} id="galerie" aria-labelledby="gallery-title">
      <header className={styles.galleryHeader}>
        <div>
          <p>À la carte</p>
          <h2 id="gallery-title">Les saveurs de la maison.</h2>
        </div>
        <Link href="/carte">
          Voir toute la carte
          <ArrowRightIcon />
        </Link>
      </header>
      <div className={styles.galleryGrid}>
        <figure className={styles.galleryTall}>
          <Image
            src="/images/menu/attieke-tilapia-proprietaire.webp"
            alt="Tilapia braisé entier servi avec de l’attiéké et des condiments"
            fill
            sizes="(max-width: 760px) 100vw, 38vw"
          />
          <figcaption>
            <strong>Attiéké tilapia</strong>
          </figcaption>
        </figure>
        <figure>
          <Image
            src="/images/menu/foutou-sauce-graine.webp"
            alt="Foutou banane servi avec une sauce graine et de la viande"
            fill
            sizes="(max-width: 760px) 50vw, 27vw"
          />
          <figcaption>
            <strong>Foutou sauce graine</strong>
          </figcaption>
        </figure>
        <figure>
          <Image
            src="/images/menu/pastel.webp"
            alt="Pastels frits dorés disposés dans un panier"
            fill
            sizes="(max-width: 760px) 50vw, 27vw"
          />
          <figcaption>
            <strong>Pastel</strong>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
