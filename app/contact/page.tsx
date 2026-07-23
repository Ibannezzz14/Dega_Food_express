import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRightIcon,
  InstagramIcon,
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
        <div className={styles.contactHeroInner}>
          <div className={styles.contactHeroCopy}>
            <h1 id="contact-title">
              Parlons de votre <em>demande.</em>
            </h1>
            <p className={styles.heroLead}>
              Une question, une commande ou un événement&nbsp;? Appelez-nous
              ou préparez votre message pour WhatsApp.
            </p>
          </div>

          <figure className={styles.contactVisual}>
            <Image
              src="/images/menu/alloco-poulet-choukouya-proprietaire.webp"
              alt="Alloco servi avec du poulet choukouya et des crudités"
              fill
              priority
              sizes="(max-width: 860px) 100vw, 52vw"
            />
          </figure>
        </div>
      </section>

      <section className={styles.contactBody} aria-label="Moyens de contact">
        <div className={styles.contactLayout}>
          <aside className={styles.contactIntro}>
            <div
              className={styles.directContacts}
              aria-labelledby="direct-contact-title"
            >
              <div className={styles.directContactHeading}>
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
          </aside>

          <ContactForm />
        </div>
      </section>
    </main>
  );
}
