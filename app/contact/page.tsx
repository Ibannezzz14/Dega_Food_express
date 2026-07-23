import type { Metadata } from "next";
import {
  ArrowRightIcon,
  InstagramIcon,
  MessageIcon,
  PhoneIcon,
} from "@/components/icons";
import { CONTACTS, INSTAGRAM } from "@/data/contact";
import { createPageMetadata } from "@/lib/page-metadata";
import ContactForm from "./contact-form";
import styles from "./contact.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Contact | Dega Food Express",
  description:
    "Contactez Dega Food Express à Lausanne ou Lucens, ou préparez votre demande directement sur WhatsApp.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main id="contenu" className={styles.page}>
      <section className={styles.contactHero} aria-labelledby="contact-title">
        <div className={styles.contactLayout}>
          <div className={styles.contactIntro}>
            <p className={styles.eyebrow}>Nous contacter</p>
            <h1 id="contact-title">
              Parlons de votre <em>demande.</em>
            </h1>
            <p className={styles.heroLead}>
              Une question sur la carte, une commande ou un événement ?
              Choisissez le contact qui vous convient et préparez un message
              clair pour l’équipe.
            </p>

            <div
              className={styles.directContacts}
              aria-labelledby="direct-contact-title"
            >
              <div className={styles.directContactHeading}>
                <MessageIcon />
                <h2 id="direct-contact-title">Contacts directs</h2>
              </div>

              <address className={styles.contactList}>
                {CONTACTS.map((contact) => (
                  <a
                    className={styles.contactCard}
                    href={contact.phoneHref}
                    key={contact.id}
                    aria-label={`Appeler Dega Food Express à ${contact.area} au ${contact.displayPhone}`}
                  >
                    <span className={styles.contactIcon}>
                      <PhoneIcon />
                    </span>
                    <span className={styles.contactDetails}>
                      <span>{contact.area}</span>
                      <strong>{contact.displayPhone}</strong>
                    </span>
                    <ArrowRightIcon />
                  </a>
                ))}
              </address>
            </div>

            <a
              className={styles.instagramLink}
              href={INSTAGRAM.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Voir Dega Food Express sur Instagram, nouvel onglet"
            >
              <InstagramIcon />
              <span>
                Suivre sur Instagram
                <strong>{INSTAGRAM.handle}</strong>
              </span>
              <ArrowRightIcon />
            </a>
          </div>

          <ContactForm />
        </div>
      </section>
    </main>
  );
}
