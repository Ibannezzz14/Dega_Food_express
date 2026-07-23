import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  HeartIcon,
  LeafIcon,
  PeopleIcon,
  SunIcon,
} from "@/components/icons";
import styles from "./presentation.module.css";

const values = [
  {
    title: "La passion",
    description:
      "Le plaisir de cuisiner avec attention et de transmettre des saveurs qui leur tiennent à cœur.",
    icon: HeartIcon,
  },
  {
    title: "La convivialité",
    description:
      "Des plats généreux, pensés pour rapprocher les personnes et accompagner les moments partagés.",
    icon: PeopleIcon,
  },
  {
    title: "L’authenticité",
    description:
      "Des recettes qui mettent à l’honneur les goûts et les traditions de la cuisine ivoirienne.",
    icon: SunIcon,
  },
  {
    title: "La qualité",
    description:
      "Des ingrédients choisis avec soin et des préparations réalisées avec exigence.",
    icon: LeafIcon,
  },
] as const;

export default function PresentationStory() {
  return (
    <article className={styles.story} aria-labelledby="story-title">
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Dega Food Express</p>
            <h1 id="story-title">Notre histoire</h1>
            <p className={styles.heroIntro}>
              Une passion commune pour une cuisine généreuse, vivante et
              profondément ivoirienne.
            </p>
          </div>

          <figure className={styles.heroVisual}>
            <Image
              src="/images/editorial/alloco-tilapia-ivoirien.webp"
              alt="Tilapia braisé servi avec de l’alloco doré et une sauce"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 52vw"
            />
            <figcaption>Cuisine ivoirienne · partage · générosité</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.origin} aria-labelledby="origin-title">
        <div className={styles.originHeading}>
          <p className={styles.sectionLabel}>À l’origine</p>
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
            Elles ont choisi de transformer cette passion commune en un
            service de traiteur, avec une envie simple&nbsp;: faire découvrir
            une cuisine africaine chaleureuse et mettre en valeur toute la
            richesse de la cuisine ivoirienne.
          </p>
        </div>
      </section>

      <section className={styles.mission} aria-labelledby="mission-title">
        <div className={styles.missionVisual}>
          <Image
            src="/images/menu/placali-sauce-kope.webp"
            alt="Placali ivoirien servi avec une sauce kopé"
            fill
            sizes="(max-width: 900px) 100vw, 46vw"
          />
        </div>

        <div className={styles.missionCopy}>
          <p className={styles.missionLabel}>Notre mission</p>
          <h2 id="mission-title">Partager des saveurs qui ont une histoire.</h2>
          <p>
            Dega Food Express propose des plats authentiques, savoureux et
            préparés avec soin. Chaque recette est une façon de faire découvrir
            les traditions, les parfums et la convivialité de la cuisine
            ivoirienne.
          </p>
          <p>
            Cette cuisine se veut généreuse et accessible à toutes celles et
            ceux qui souhaitent retrouver ces saveurs ou simplement les
            découvrir.
          </p>
        </div>
      </section>

      <section className={styles.values} aria-labelledby="values-title">
        <header className={styles.valuesHeading}>
          <p className={styles.sectionLabel}>Ce qui nous guide</p>
          <h2 id="values-title">Des valeurs présentes dans chaque plat.</h2>
        </header>

        <ul className={styles.valuesGrid}>
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <li className={styles.value} key={value.title}>
                <span className={styles.valueIcon} aria-hidden="true">
                  <Icon />
                </span>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.callToAction} aria-labelledby="cta-title">
        <div>
          <p>À découvrir à votre table</p>
          <h2 id="cta-title">Goûtez nos spécialités ivoiriennes.</h2>
        </div>
        <Link href="/carte">
          Découvrir notre menu
          <ArrowRightIcon />
        </Link>
      </section>
    </article>
  );
}
