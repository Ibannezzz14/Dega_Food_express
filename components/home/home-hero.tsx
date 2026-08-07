import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/shared/icons";
import { SITE_CONFIG } from "@/config/site-config";
import styles from "./home-hero.module.css";

export default function HomeHero() {
  return (
    <section className={styles.hero} id="accueil" aria-labelledby="hero-title">
      <Image
        className={styles.heroBackdrop}
        src={SITE_CONFIG.images.heroBackdrop}
        alt=""
        fill
        priority
        sizes="100vw"
      />
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <h1 id="hero-title">
            La Côte d’Ivoire,
            <span>à votre table.</span>
          </h1>
          <p className={styles.heroText}>
            Des plats ivoiriens préparés sur commande, pour un repas à la
            maison comme pour une grande tablée.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/carte">
              Découvrir notre carte
              <ArrowRightIcon />
            </Link>
            <Link className={styles.secondaryAction} href="/presentation">
              Notre histoire
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
