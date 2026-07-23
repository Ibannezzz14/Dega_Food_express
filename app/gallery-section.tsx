import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import styles from "./page.module.css";

export default function GallerySection() {
  return (
    <section className={styles.gallery} id="galerie" aria-labelledby="gallery-title">
      <header className={styles.galleryHeader}>
        <div>
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
            src="/images/menu/alloco-poisson-braise-proprietaire.webp"
            alt="Poisson braisé servi avec de l’alloco et des crudités"
            fill
            sizes="(max-width: 760px) 50vw, 27vw"
          />
          <figcaption>
            <strong>Alloco poisson braisé</strong>
          </figcaption>
        </figure>
        <figure>
          <Image
            src="/images/menu/drinks/bissap-33cl-proprietaire.webp"
            alt="Bouteille de bissap frais au format 33 centilitres"
            fill
            sizes="(max-width: 760px) 50vw, 27vw"
          />
          <figcaption>
            <strong>Bissap 33 cl</strong>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
