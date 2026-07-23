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
            src="/images/menu/alloco-poisson-braise-proprietaire.webp"
            alt="Poisson braisé servi avec de l’alloco et des crudités"
            fill
            sizes="(max-width: 760px) 100vw, 48vw"
          />
        </div>
      </div>
      <div className={styles.eventsCopy}>
        <h2 id="events-title">Pour une assiette ou toute la tablée.</h2>
        <p>
          Pour un repas de famille, un anniversaire ou un événement, dites-nous
          ce que vous préparez. Nous établissons le devis avec vous.
        </p>
        <ul>
          <li>Repas de famille & anniversaires</li>
          <li>Associations & événements</li>
        </ul>
        <Link href="/evenements">
          Découvrir le service traiteur
          <ArrowRightIcon />
        </Link>
      </div>
    </section>
  );
}
