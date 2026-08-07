import Link from "next/link";
import { ArrowRightIcon } from "@/components/shared/icons";
import styles from "./status-page.module.css";

export default function NotFound() {
  return (
    <main className={styles.page} id="contenu" tabIndex={-1}>
      <div className={styles.card}>
        <p className={styles.code}>404</p>
        <h1>Cette page n’est pas au menu.</h1>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} href="/carte">
            Voir la carte
            <ArrowRightIcon />
          </Link>
          <Link className={styles.secondaryAction} href="/">
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
