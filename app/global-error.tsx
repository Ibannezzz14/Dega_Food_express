"use client";

import Link from "next/link";
import { formatPublicErrorReference } from "@/lib/observability";
import styles from "./status-page.module.css";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({
  error,
  reset,
}: GlobalErrorPageProps) {
  const reference = error.digest
    ? formatPublicErrorReference(error.digest)
    : null;

  return (
    <html lang="fr">
      <body>
        <main className={styles.page} id="contenu" tabIndex={-1}>
          <div className={styles.card}>
            <h1>Le site ne peut pas s’afficher pour le moment.</h1>
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
              </button>
              <Link className={styles.secondaryAction} href="/">
                Retour à l’accueil
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
