import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, PhoneIcon } from "@/components/icons";
import styles from "./site-footer.module.css";

type FooterNavigationItem = {
  href: "/" | "/carte" | "/presentation" | "/evenements";
  label: string;
};

type PhoneContact = {
  area: string;
  displayPhone: string;
  href: `tel:${string}`;
};

const footerNavigation = [
  { href: "/", label: "Accueil" },
  { href: "/carte", label: "La carte" },
  { href: "/presentation", label: "Notre histoire" },
  { href: "/evenements", label: "Service traiteur" },
] as const satisfies readonly FooterNavigationItem[];

const phoneContacts = [
  {
    area: "Lausanne",
    displayPhone: "078 265 40 81",
    href: "tel:+41782654081",
  },
  {
    area: "Lucens et alentours",
    displayPhone: "076 603 60 11",
    href: "tel:+41766036011",
  },
] as const satisfies readonly PhoneContact[];

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.footerAccent} aria-hidden="true" />
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          <section
            className={styles.brandColumn}
            aria-labelledby="footer-brand-title"
          >
            <div className={styles.brandIdentity}>
              <Image
                className={styles.brandLogo}
                src="/images/logo-dega-food.webp"
                width={82}
                height={82}
                alt="Logo Dega Food Express"
              />
              <div>
                <p className={styles.sectionLabel}>Cuisine ivoirienne</p>
                <h2 id="footer-brand-title">Dega Food Express</h2>
              </div>
            </div>
            <p className={styles.brandDescription}>
              Cuisine ivoirienne à Lausanne & Lucens.
            </p>
            <Link className={styles.primaryAction} href="/carte">
              Voir le menu
              <ArrowRightIcon />
            </Link>
          </section>

          <nav
            className={styles.footerNavigation}
            aria-label="Navigation du pied de page"
          >
            <h2>Explorer</h2>
            <ul>
              {footerNavigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <section
            className={styles.contactColumn}
            aria-labelledby="footer-contact-title"
          >
            <div className={styles.contactHeading}>
              <p className={styles.sectionLabel}>Commande directe</p>
              <h2 id="footer-contact-title">Par téléphone</h2>
            </div>
            <address className={styles.contactCards}>
              {phoneContacts.map((contact) => (
                <a
                  className={styles.contactCard}
                  href={contact.href}
                  key={contact.href}
                  aria-label={`Appeler Dega Food Express à ${contact.area} au ${contact.displayPhone}`}
                >
                  <span className={styles.phoneIcon}>
                    <PhoneIcon />
                  </span>
                  <span className={styles.contactDetails}>
                    <span className={styles.contactArea}>{contact.area}</span>
                    <span className={styles.contactNumber}>
                      {contact.displayPhone}
                    </span>
                  </span>
                  <ArrowRightIcon className={styles.contactArrow} />
                </a>
              ))}
            </address>
          </section>
        </div>

        <div className={styles.footerBottom}>
          <p>© {currentYear} Dega Food Express</p>
          <a className={styles.backToTop} href="#top">
            Retour en haut
            <ArrowRightIcon />
          </a>
        </div>
      </div>
    </footer>
  );
}
