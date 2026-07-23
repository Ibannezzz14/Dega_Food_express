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
            src="/images/menu/attieke-agneau-choukouya-proprietaire.webp"
            alt="Attiéké servi avec de l’agneau choukouya et des crudités"
            fill
            sizes="(max-width: 760px) 100vw, 48vw"
          />
        </div>
        <div className={styles.eventDetailImage}>
          <Image
            src="/images/menu/placali-sauce-kope-proprietaire.webp"
            alt="Deux portions de placali ivoirien servies avec une sauce kopé"
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
