import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/shared/icons";
import styles from "./presentation.module.css";

const values = [
  {
    title: "Cuisiner avec attention",
    description:
      "Chaque commande est préparée avec soin, selon les plats et les quantités choisis.",
  },
  {
    title: "Réunir autour du repas",
    description:
      "Des préparations pensées pour les repas partagés comme pour les grandes tablées.",
  },
  {
    title: "S’adapter à chaque demande",
    description:
      "Les quantités et les prestations sont ajustées au repas ou à l’événement.",
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
              Dega Food Express est porté par Geneviève et Marie-José, deux
              fondatrices réunies autour de la cuisine ivoirienne.
            </p>
          </div>

          <figure className={styles.heroVisual}>
            <Image
              src="/images/menu/alloco-agneau-choukouya-retouche.webp"
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
          <h2 id="origin-title">De la passion au projet.</h2>
        </div>

        <div className={styles.originCopy}>
          <p>
            Leur goût commun pour la cuisine les a conduites à créer Dega Food
            Express.
          </p>
          <p>
            Elles proposent aujourd’hui des plats sur commande et des
            prestations pour les événements.
          </p>
        </div>
      </section>

      <section className={styles.mission} aria-labelledby="mission-title">
        <div className={styles.missionVisual}>
          <Image
            src="/images/menu/alloco-poulet-choukouya-retouche.webp"
            alt="Alloco servi avec du poulet choukouya et des crudités"
            fill
            sizes="(max-width: 900px) 100vw, 46vw"
          />
        </div>

        <div className={styles.missionCopy}>
          <h2 id="mission-title">
            Un lien entre la Côte d’Ivoire et la Suisse.
          </h2>
          <p>
            Leur cuisine fait découvrir en Suisse des saveurs et des gestes
            culinaires liés à leur histoire ivoirienne.
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
