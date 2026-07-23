import Image from "next/image";
import { InstagramIcon } from "@/components/icons";
import styles from "./page.module.css";

export default function GallerySection() {
  return (
    <section className={styles.gallery} id="galerie" aria-labelledby="gallery-title">
      <header className={styles.galleryHeader}>
        <h2 id="gallery-title">Autour de la table.</h2>
        <a
          href="https://www.instagram.com/dega_foodexpress/"
          target="_blank"
          rel="noreferrer"
        >
          <InstagramIcon />
          @dega_foodexpress
        </a>
      </header>
      <div className={styles.galleryGrid}>
        <figure className={styles.galleryTall}>
          <Image
            src="/images/gallery-fish.webp"
            alt="Poisson braisé avec sauce"
            fill
            sizes="(max-width: 760px) 100vw, 38vw"
          />
        </figure>
        <figure>
          <Image
            src="/images/gallery-feast.webp"
            alt="Assortiment de plats ivoiriens"
            fill
            sizes="(max-width: 760px) 50vw, 27vw"
          />
        </figure>
        <figure>
          <Image
            src="/images/gallery-juice.webp"
            alt="Boissons maison en bouteille"
            fill
            sizes="(max-width: 760px) 50vw, 27vw"
          />
        </figure>
      </div>
    </section>
  );
}
