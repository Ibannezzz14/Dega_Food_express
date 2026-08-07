"use client";

import Link from "next/link";
import { ArrowRightIcon, CheckIcon, MapPinIcon } from "@/components/icons";
import { PUBLIC_REGIONS } from "@/data/delivery-zones";
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
              {PUBLIC_REGIONS.map((regionOption) => {
                if (regionOption.availability === "coming_soon") {
                  return (
                    <button
                      type="button"
                      className={styles.regionUnavailable}
                      key={regionOption.id}
                      disabled
                    >
                      <MapPinIcon />
                      <span>
                        <strong>{regionOption.selectionLabel}</strong>
                        <small>{regionOption.availabilityLabel}</small>
                      </span>
                    </button>
                  );
                }

                const isActive = region === regionOption.id;

                return (
                  <button
                    type="button"
                    className={isActive ? styles.regionActive : ""}
                    key={regionOption.id}
                    aria-pressed={isActive}
                    onClick={() => setRegion(regionOption.id)}
                  >
                    <MapPinIcon />
                    <span>{regionOption.selectionLabel}</span>
                    {isActive && <CheckIcon />}
                  </button>
                );
              })}
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
