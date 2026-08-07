import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/shared/icons";
import styles from "./presentation.module.css";

const values = [
  {
    title: "Cuisiner avec attention",
    description:
      "Préparer chaque commande avec le même soin qu’un repas destiné à leurs proches.",
  },
  {
    title: "Réunir autour du repas",
    description:
      "Proposer des plats faits pour les repas quotidiens comme pour les grandes tablées.",
  },
  {
    title: "Faire vivre les recettes ivoiriennes",
    description:
      "Partager les goûts et les préparations qui relient leur cuisine à la Côte d’Ivoire.",
  },
  {
    title: "Préparer sur commande",
    description:
      "Adapter les plats et les quantités à la commande ou aux besoins de l’événement.",
  },
] as const;

export default function PresentationStory() {
  return (
    <article className={styles.story} aria-labelledby="story-title">
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <h1 id="story-title">Notre histoire</h1>
            <p className={styles.heroIntro}>
              Marie-José et Geneviève partagent les recettes ivoiriennes
              qu’elles aiment cuisiner pour leurs proches.
            </p>
          </div>

          <figure className={styles.heroVisual}>
            <Image
              src="/images/menu/alloco-agneau-choukouya-proprietaire.webp"
              alt="Alloco servi avec de l’agneau choukouya et des crudités"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 52vw"
            />
          </figure>
        </div>
      </section>

      <section className={styles.origin} aria-labelledby="origin-title">
        <div className={styles.originHeading}>
          <h2 id="origin-title">Deux femmes réunies par la cuisine.</h2>
          <p className={styles.founderNames}>
            Marie-José
            <span aria-hidden="true">&</span>
            <span className="sr-only"> et </span>
            Geneviève
          </p>
        </div>

        <div className={styles.originCopy}>
          <p>
            Depuis toujours, Marie-José et Geneviève aiment cuisiner, partager
            leurs recettes et réunir les personnes autour de plats généreux.
          </p>
          <p>
            Elles ont créé Dega Food Express pour proposer leurs plats sur
            commande et accompagner les repas de famille comme les événements.
          </p>
        </div>
      </section>

      <section className={styles.mission} aria-labelledby="mission-title">
        <div className={styles.missionVisual}>
          <Image
            src="/images/menu/alloco-poulet-choukouya-proprietaire.webp"
            alt="Alloco servi avec du poulet choukouya et des crudités"
            fill
            sizes="(max-width: 900px) 100vw, 46vw"
          />
        </div>

        <div className={styles.missionCopy}>
          <h2 id="mission-title">Partager des saveurs qui ont une histoire.</h2>
          <p>
            Dega Food Express prépare des plats ivoiriens sur commande. Chaque
            recette transmet les goûts, les gestes et la convivialité de cette
            cuisine.
          </p>
        </div>
      </section>

      <section className={styles.values} aria-labelledby="values-title">
        <header className={styles.valuesHeading}>
          <h2 id="values-title">Ce qui guide notre cuisine.</h2>
        </header>

        <ul className={styles.valuesGrid}>
          {values.map((value) => (
            <li className={styles.value} key={value.title}>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.callToAction} aria-labelledby="cta-title">
        <div>
          <h2 id="cta-title">Choisissez votre prochain plat.</h2>
        </div>
        <Link href="/carte">
          Voir la carte
          <ArrowRightIcon />
        </Link>
      </section>
    </article>
  );
}
