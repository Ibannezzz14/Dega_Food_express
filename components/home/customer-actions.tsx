import Link from "next/link";
import {
  ArrowRightIcon,
  CartIcon,
  InstagramIcon,
} from "@/components/shared/icons";
import { INSTAGRAM } from "@/config/site-config";
import styles from "./customer-actions.module.css";

export default function CustomerActions() {
  return (
    <section
      className={styles.section}
      aria-labelledby="customer-actions-title"
    >
      <div className={styles.inner}>
        <div className={styles.heading}>
          <h2 id="customer-actions-title">Choisissez vos plats ivoiriens.</h2>
        </div>

        <div className={styles.actions}>
          <Link className={`${styles.action} ${styles.primary}`} href="/carte">
            <CartIcon />
            <span>
              <strong>Composer ma commande</strong>
            </span>
            <ArrowRightIcon />
          </Link>

          <a
            className={styles.action}
            href={INSTAGRAM.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Voir Instagram (s’ouvre dans un nouvel onglet)"
          >
            <InstagramIcon />
            <span>
              <strong>Voir Instagram</strong>
            </span>
            <ArrowRightIcon />
          </a>
        </div>
      </div>
    </section>
  );
}
