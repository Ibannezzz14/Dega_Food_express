"use client";

import Link from "next/link";
import { ArrowRightIcon, CheckIcon, MapPinIcon } from "@/components/icons";
import { DELIVERY_ZONES } from "@/data/delivery-zones";
import styles from "./home-hero.module.css";
import { useOrderSession } from "./order-session";

export default function HomeHero() {
  const { region, setRegion } = useOrderSession();

  return (
    <>
      <section className={styles.hero} id="accueil" aria-labelledby="hero-title">
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

      <section
        className={styles.quickOrder}
        aria-labelledby="quick-order-title"
      >
        <div className={styles.quickOrderInner}>
          <div className={styles.quickOrderCopy}>
            <h2 id="quick-order-title">Choisissez votre zone.</h2>
            <span>
              Vous verrez ensuite la carte et le contact WhatsApp correspondant.
            </span>
          </div>

          <fieldset className={styles.regionFieldset}>
            <legend>
              Zone de commande <span className="sr-only">(obligatoire)</span>
            </legend>
            <div className={styles.regionOptions}>
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
            </div>
          </fieldset>

          <Link
            className={styles.continueAction}
            href={region ? `/carte?zone=${region}` : "/carte"}
          >
            Voir les plats
            <ArrowRightIcon />
          </Link>
        </div>
      </section>
    </>
  );
}
