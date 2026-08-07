import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  InstagramIcon,
  MessageIcon,
} from "@/components/shared/icons";
import {
  CATERING_AREA_SETTINGS,
  CATERING_CONTACT,
  CATERING_WHATSAPP_HREF,
  INSTAGRAM,
  ORDER_CONTACT,
  ORDER_WHATSAPP_HREF,
  SITE_CONFIG,
} from "@/config/site-config";
import styles from "./site-footer.module.css";

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          <section
            className={styles.brandColumn}
            aria-labelledby="footer-brand-title"
          >
            <div className={styles.brandIdentity}>
              <Image
                className={styles.brandLogo}
                src={SITE_CONFIG.brand.logo}
                width={82}
                height={82}
                alt={`Logo ${SITE_CONFIG.brand.name}`}
              />
              <div>
                <h2 id="footer-brand-title">{SITE_CONFIG.brand.name}</h2>
              </div>
            </div>
            <Link className={styles.primaryAction} href="/carte">
              Voir la carte
              <ArrowRightIcon />
            </Link>
          </section>

          <nav
            className={styles.footerNavigation}
            aria-label="Navigation du pied de page"
          >
            <h2>Explorer</h2>
            <ul>
              {SITE_CONFIG.footerNavigation.map((item) => (
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
              <h2 id="footer-contact-title">Contacts utiles</h2>
            </div>
            <address className={styles.contactCards}>
              <a
                className={`${styles.contactCard} ${styles.contactCardPrimary}`}
                href={ORDER_WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${ORDER_CONTACT.label} : ${ORDER_CONTACT.displayPhone}`}
              >
                <span className={styles.phoneIcon}>
                  <MessageIcon />
                </span>
                <span className={styles.contactDetails}>
                  <span className={styles.contactArea}>
                    {ORDER_CONTACT.label}
                  </span>
                  <span className={styles.contactNumber}>
                    {ORDER_CONTACT.displayPhone}
                  </span>
                </span>
                <ArrowRightIcon className={styles.contactArrow} />
              </a>
              <a
                className={styles.contactCard}
                href={CATERING_WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${CATERING_CONTACT.label} : ${CATERING_CONTACT.displayPhone}`}
              >
                <span className={styles.phoneIcon}>
                  <MessageIcon />
                </span>
                <span className={styles.contactDetails}>
                  <span className={styles.contactArea}>
                    Traiteur · {CATERING_AREA_SETTINGS.label}
                  </span>
                  <span className={styles.contactNumber}>
                    {CATERING_CONTACT.displayPhone}
                  </span>
                </span>
                <ArrowRightIcon className={styles.contactArrow} />
              </a>
            </address>
          </section>
        </div>

        <div className={styles.footerBottom}>
          <p>© {currentYear} Dega Food Express</p>
          <div className={styles.footerLegal}>
            <Link className={styles.legalLink} href="/confidentialite">
              Confidentialité
            </Link>
            <Link className={styles.legalLink} href="/conditions">
              Conditions
            </Link>
            <a
              className={styles.instagramLink}
              href={INSTAGRAM.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramIcon />
              {INSTAGRAM.handle}
              <span className="sr-only">
                {" "}
                (s’ouvre dans un nouvel onglet)
              </span>
            </a>
            <a className={styles.backToTop} href="#top">
              Retour en haut
              <ArrowRightIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
