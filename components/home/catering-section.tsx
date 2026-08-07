import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/shared/icons";
import {
  CATERING_AREA_SETTINGS,
  DELIVERY_SETTINGS,
  SITE_CONFIG,
} from "@/config/site-config";
import styles from "./catering-section.module.css";

export default function CateringSection() {
  return (
    <section
      className={styles.section}
      id="evenements"
      aria-labelledby="catering-home-title"
    >
      <Image
        className={styles.backdrop}
        src={SITE_CONFIG.images.cateringBackdrop}
        alt=""
        fill
        sizes="100vw"
      />

      <div className={styles.inner}>
        <figure className={styles.visual}>
          <Image
            src="/images/menu/alloco-poisson-braise-proprietaire.webp"
            alt="Poisson braisé servi avec de l’alloco et des crudités"
            fill
            sizes="(max-width: 800px) 100vw, 46vw"
          />
          <figcaption>Menus préparés selon votre événement</figcaption>
        </figure>

        <div className={styles.copy}>
          <p className={styles.eyebrow}>Service traiteur</p>
          <h2 id="catering-home-title">
            Un menu ivoirien pour votre événement.
          </h2>
          <p className={styles.intro}>
            Repas de famille, cérémonie ou réception&nbsp;: indiquez le lieu,
            la date et le nombre de convives. Nous préparons le devis avec
            vous.
          </p>

          <div className={styles.routePanel}>
            <p>{CATERING_AREA_SETTINGS.availabilityMessage}</p>
            <ol aria-label={CATERING_AREA_SETTINGS.routeLabel}>
              {CATERING_AREA_SETTINGS.locations.map((location) => (
                <li key={location}>
                  <span aria-hidden="true" />
                  <strong>{location}</strong>
                </li>
              ))}
            </ol>
          </div>

          <p className={styles.deliveryNote}>
            <strong>Commandes & livraison</strong>
            <span>{DELIVERY_SETTINGS.selectionLabel}</span>
          </p>

          <Link className={styles.action} href="/evenements">
            Préparer ma demande
            <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}
