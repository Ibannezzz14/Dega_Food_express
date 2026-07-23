import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import styles from "./page.module.css";

export default function EventsSection() {
  return (
    <section
      className={styles.events}
      id="evenements"
      aria-labelledby="events-title"
    >
      <div className={styles.eventsImages}>
        <div className={styles.eventMainImage}>
          <Image
            src="/images/editorial/alloco-tilapia-ivoirien.webp"
            alt="Tilapia braisé et alloco dressés dans une grande assiette"
            fill
            sizes="(max-width: 760px) 100vw, 48vw"
          />
        </div>
        <div className={styles.eventDetailImage}>
          <Image
            src="/images/menu/placali-sauce-kope.webp"
            alt="Placali ivoirien servi avec une sauce kopé"
            fill
            sizes="(max-width: 760px) 42vw, 220px"
          />
        </div>
      </div>
      <div className={styles.eventsCopy}>
        <p className={styles.eventsEyebrow}>Service traiteur</p>
        <h2 id="events-title">Pour une assiette ou toute la tablée.</h2>
        <p>
          Repas de famille, anniversaires, associations et événements : votre
          demande est étudiée selon le format de votre réception.
        </p>
        <ul>
          <li>Repas de famille & anniversaires</li>
          <li>Associations & événements</li>
          <li>Devis établi sur demande</li>
        </ul>
        <Link href="/evenements">
          Découvrir le service traiteur
          <ArrowRightIcon />
        </Link>
      </div>
    </section>
  );
}
