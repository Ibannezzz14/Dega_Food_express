"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/shared/icons";
import { formatPublicErrorReference } from "@/lib/observability";
import styles from "./status-page.module.css";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const reference = error.digest
    ? formatPublicErrorReference(error.digest)
    : null;

  return (
    <main className={styles.page} id="contenu" tabIndex={-1}>
      <div className={styles.card}>
        <h1>La page ne peut pas s’afficher pour le moment.</h1>
        {reference ? (
          <p>
            Référence de l’erreur&nbsp;: <strong>{reference}</strong>
          </p>
        ) : null}
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
