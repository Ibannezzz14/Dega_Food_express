import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRightIcon,
  InstagramIcon,
  MessageIcon,
} from "@/components/shared/icons";
import {
  CATERING_CONTACT,
  CATERING_AREA_SETTINGS,
  CATERING_WHATSAPP_HREF,
  DELIVERY_SETTINGS,
  INSTAGRAM,
  ORDER_CONTACT,
  ORDER_WHATSAPP_HREF,
  SITE_CONFIG,
} from "@/config/site-config";
import { createPageMetadata } from "@/lib/page-metadata";
import styles from "./contact.module.css";

/*
 * THESIS: Faire du contact un annuaire immédiat, sans décor ni discours commercial.
 * OWN-WORLD: Deux bandes vert nuit et ivoire, filets fins, numéros typographiques et actions nettes.
 * STORY: Comprendre qui appeler, lancer une commande ou préparer un devis traiteur.
 * FIRST VIEWPORT: Une introduction courte précède deux lignes de contact qui portent toute la page.
 * FORM: Table d’appel, troisième structure retenue, composition linéaire — seed 80878522.
 */

export const metadata: Metadata = createPageMetadata({
  title: "Contact | Dega Food Express",
  description: `Commandes, livraison et service traiteur au ${ORDER_CONTACT.displayPhone}. ${DELIVERY_SETTINGS.availabilityMessage}. Le service traiteur est également joignable au ${CATERING_CONTACT.displayPhone}.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main
      id="contenu"
      className={styles.page}
      data-page="contact"
      tabIndex={-1}
    >
      <section className={styles.introBand} aria-labelledby="contact-title">
        <Image
          className={styles.introBackdrop}
          src={SITE_CONFIG.images.hospitalityBackdrop}
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <div className={`${styles.contactShell} ${styles.introInner}`}>
          <h1 id="contact-title">Nous contacter</h1>
          <p className={styles.introText}>
            Pour une commande, une livraison ou un événement, choisissez le
            contact correspondant.
          </p>
        </div>
      </section>

      <section
        className={styles.directory}
        aria-labelledby="contact-directory-title"
      >
        <div className={`${styles.contactShell} ${styles.directoryInner}`}>
          <h2 className="sr-only" id="contact-directory-title">
            Numéros utiles
          </h2>

          <address className={styles.contactList}>
            <a
              className={`${styles.contactRow} ${styles.contactRowPrimary}`}
              href={ORDER_WHATSAPP_HREF}
              id={ORDER_CONTACT.id}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Commander, demander une livraison ou contacter le service traiteur sur WhatsApp au ${ORDER_CONTACT.displayPhone} (s’ouvre dans un nouvel onglet)`}
            >
              <span className={styles.contactArea}>
                {ORDER_CONTACT.label}
              </span>
              <span className={styles.contactCopy}>
                <strong className={styles.contactNumber}>
                  {ORDER_CONTACT.displayPhone}
                </strong>
                <small className={styles.contactDescription}>
                  {DELIVERY_SETTINGS.availabilityMessage}.
                </small>
              </span>
              <span className={styles.callAction}>
                <MessageIcon />
                Écrire sur WhatsApp
              </span>
            </a>

            <a
              className={styles.contactRow}
              href={CATERING_WHATSAPP_HREF}
              id={CATERING_CONTACT.id}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Demander un devis traiteur sur WhatsApp au ${CATERING_CONTACT.displayPhone} (s’ouvre dans un nouvel onglet)`}
            >
              <span className={styles.contactArea}>
                {CATERING_CONTACT.label}
              </span>
              <span className={styles.contactCopy}>
                <strong className={styles.contactNumber}>
                  {CATERING_CONTACT.displayPhone}
                </strong>
                <small className={styles.contactDescription}>
                  {CATERING_AREA_SETTINGS.label}
                </small>
              </span>
              <span className={styles.callAction}>
                <MessageIcon />
                Écrire sur WhatsApp
              </span>
            </a>
          </address>

          <a
            className={styles.instagramCard}
            href={INSTAGRAM.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <InstagramIcon />
            <span>
              <strong>Instagram</strong>
              <small>{INSTAGRAM.handle}</small>
              <span className="sr-only">
                {" "}(s’ouvre dans un nouvel onglet)
              </span>
            </span>
            <ArrowRightIcon />
          </a>
        </div>
      </section>
    </main>
  );
}
