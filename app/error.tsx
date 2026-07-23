"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import styles from "./status-page.module.css";

type ErrorPageProps = {
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className={styles.page} id="contenu">
      <div className={styles.card}>
        <p className={styles.eyebrow}>Un imprévu est survenu</p>
        <h1>La page ne peut pas s’afficher pour le moment.</h1>
        <p>
          Réessayez maintenant. Si le problème persiste, revenez à l’accueil
          pour poursuivre votre visite.
        </p>
        <div className={styles.actions}>
          <button
            className={styles.primaryAction}
            type="button"
            onClick={reset}
          >
            Réessayer
            <ArrowRightIcon />
          </button>
          <Link className={styles.secondaryAction} href="/">
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
