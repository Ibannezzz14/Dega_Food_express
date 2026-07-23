"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, MapPinIcon } from "@/components/icons";
import { DELIVERY_ZONES } from "@/data/delivery-zones";
import { useOrderSession } from "./order-session";
import styles from "./order-experience.module.css";

export default function HomeHero() {
  const { region, setRegion } = useOrderSession();

  return (
    <section className={styles.hero} id="accueil" aria-labelledby="hero-title">
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <p className={styles.brandLine}>Dega Food Express</p>
          <h1 id="hero-title">
            La cuisine ivoirienne,
            <span>à votre table.</span>
          </h1>
          <p className={styles.heroText}>
            Des plats préparés sur commande pour une assiette, un repas de
            famille ou un événement.
          </p>
          <Link className={styles.heroLink} href="/carte">
            Composer ma commande
            <ArrowRightIcon />
          </Link>
        </div>

        <div className={styles.plateFrame}>
          <Image
            className={styles.plateImage}
            src="/images/editorial/alloco-tilapia-ivoirien.webp"
            alt="Tilapia braisé servi avec de l’alloco et une sauce tomate"
            fill
            priority
            sizes="(max-width: 760px) 90vw, (max-width: 1100px) 55vw, 620px"
          />
          <div className={styles.plateCaption}>
            <span>Tilapia braisé · alloco</span>
          </div>
        </div>

        <div className={styles.routePanel}>
          <ol className={styles.steps} aria-label="Étapes de la commande">
            <li className={styles.currentStep} aria-current="step">
              <span>1</span>
              Votre zone
            </li>
            <li>
              <span>2</span>
              Vos plats
            </li>
            <li>
              <span>3</span>
              WhatsApp
            </li>
          </ol>

          <fieldset className={styles.regionFieldset}>
            <legend>
              Votre zone <span className="sr-only">(obligatoire)</span>
            </legend>
            <button
              type="button"
              className={region === "lausanne" ? styles.regionActive : ""}
              aria-pressed={region === "lausanne"}
              onClick={() => setRegion("lausanne")}
            >
              <MapPinIcon />
              <span>{DELIVERY_ZONES.lausanne.selectionLabel}</span>
              {region === "lausanne" && <CheckIcon />}
            </button>
            <button
              type="button"
              className={region === "lucens" ? styles.regionActive : ""}
              aria-pressed={region === "lucens"}
              onClick={() => setRegion("lucens")}
            >
              <MapPinIcon />
              <span>{DELIVERY_ZONES.lucens.selectionLabel}</span>
              {region === "lucens" && <CheckIcon />}
            </button>
          </fieldset>

          <Link
            className={styles.routeAction}
            href={region ? `/carte?zone=${region}` : "/carte"}
          >
            Continuer vers les plats
            <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}
