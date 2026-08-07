"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/shared/icons";
import styles from "./status-page.module.css";

type ErrorPageProps = {
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className={styles.page} id="contenu" tabIndex={-1}>
      <div className={styles.card}>
        <h1>La page ne peut pas s’afficher pour le moment.</h1>
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
