"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon } from "@/components/icons";
import styles from "./page.module.css";

const navigation = [
  { href: "/", label: "Accueil" },
  { href: "/presentation", label: "Présentation" },
  { href: "/carte", label: "La carte" },
  { href: "/evenements", label: "Traiteur" },
] as const;

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <header className={styles.siteHeader}>
      <div className={styles.headerInner}>
        <Link
          className={styles.brand}
          href="/"
          aria-label="Dega Food Express, accueil"
          onClick={closeMenu}
        >
          <Image
            src="/images/logo-dega-food.webp"
            width={52}
            height={52}
            alt=""
            priority
          />
          <span>Dega Food</span>
        </Link>

        <nav className={styles.mainNav} aria-label="Navigation principale">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.headerActions}>
          <Link className={styles.orderNavLink} href="/carte" onClick={closeMenu}>
            Commander
            <ArrowRightIcon />
          </Link>
          <button
            type="button"
            className={styles.menuToggle}
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsOpen((current) => !current)}
          >
            <span>{isOpen ? "Fermer" : "Menu"}</span>
            <span className={styles.menuGlyph} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>

      <nav
        className={`${styles.mobileNav} ${isOpen ? styles.mobileNavOpen : ""}`}
        id="mobile-navigation"
        aria-label="Navigation mobile"
        aria-hidden={!isOpen}
      >
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            onClick={closeMenu}
          >
            {item.label}
            <ArrowRightIcon />
          </Link>
        ))}
        <Link className={styles.mobileContact} href="/#contact" onClick={closeMenu}>
          Contact
          <ArrowRightIcon />
        </Link>
      </nav>
    </header>
  );
}
