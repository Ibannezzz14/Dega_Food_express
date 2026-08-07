import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, PhoneIcon } from "@/components/icons";
import { CONTACT_DIRECTORY } from "@/data/contact";
import { createPageMetadata } from "@/lib/page-metadata";
import styles from "./contact.module.css";

/*
 * THESIS: Faire du contact un annuaire immédiat, sans décor ni discours commercial.
 * OWN-WORLD: Deux bandes vert nuit et ivoire, filets fins, numéros typographiques et actions nettes.
 * STORY: Comprendre qui appeler, choisir sa région, lancer l’appel ou rejoindre le devis traiteur.
 * FIRST VIEWPORT: Une introduction courte précède deux lignes de contact qui portent toute la page.
 * FORM: Table d’appel, troisième structure retenue, composition linéaire — seed 80878522.
 */

export const metadata: Metadata = createPageMetadata({
  title: "Contact | Dega Food Express",
  description:
    "Contactez Dega Food Express à Lausanne ou Lucens. Le contact de Genève sera bientôt disponible.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main id="contenu" className={styles.page} data-page="contact">
      <section className={styles.introBand} aria-labelledby="contact-title">
        <div className={`${styles.contactShell} ${styles.introInner}`}>
          <h1 id="contact-title">Nous contacter</h1>
          <p>
            Pour une question ou une commande, choisissez le contact de votre
            région. Le contact de Genève sera bientôt disponible.
          </p>
        </div>
      </section>

      <section
        className={styles.directory}
        aria-labelledby="contact-directory-title"
      >
        <div className={`${styles.contactShell} ${styles.directoryInner}`}>
          <h2 className="sr-only" id="contact-directory-title">
            Contacts par région
          </h2>

          <address className={styles.contactList}>
            {CONTACT_DIRECTORY.map((contact) => {
              if (contact.availability === "coming_soon") {
                return (
                  <div
                    className={`${styles.contactRow} ${styles.contactRowUnavailable}`}
                    key={contact.id}
                  >
                    <span className={styles.contactArea}>{contact.area}</span>
                    <strong className={styles.contactAvailability}>
                      {contact.availabilityLabel}
                    </strong>
                    <span className={styles.soonAction}>Bientôt</span>
                  </div>
                );
              }

              return (
                <a
                  className={styles.contactRow}
                  href={contact.phoneHref}
                  key={contact.id}
                  aria-label={`Appeler Dega Food Express à ${contact.area} au ${contact.displayPhone}`}
                >
                  <span className={styles.contactArea}>{contact.area}</span>
                  <strong className={styles.contactNumber}>
                    {contact.displayPhone}
                  </strong>
                  <span className={styles.callAction}>
                    <PhoneIcon />
                    Appeler
                  </span>
                </a>
              );
            })}
          </address>

          <div className={styles.cateringPrompt}>
            <p>Vous organisez un événement&nbsp;?</p>
            <Link className={styles.cateringLink} href="/evenements">
              Demander un devis traiteur
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
