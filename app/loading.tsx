import styles from "./status-page.module.css";

export default function Loading() {
  return (
    <main
      className={styles.page}
      id="contenu"
      tabIndex={-1}
      aria-busy="true"
    >
      <div className={styles.card} role="status" aria-live="polite">
        <p className={styles.code}>Chargement</p>
        <h1>La page se prépare.</h1>
      </div>
    </main>
  );
}
