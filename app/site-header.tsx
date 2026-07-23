"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRightIcon } from "@/components/icons";
import styles from "./site-header.module.css";

const navigation = [
  { href: "/", label: "Accueil" },
  { href: "/presentation", label: "Présentation" },
  { href: "/carte", label: "La carte" },
  { href: "/evenements", label: "Traiteur" },
  { href: "/contact", label: "Contact" },
] as const;

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1021px)");

    function closeMenuOnDesktop(event: MediaQueryListEvent) {
      if (event.matches) {
        setIsOpen(false);
      }
    }

    desktopQuery.addEventListener("change", closeMenuOnDesktop);

    return () => {
      desktopQuery.removeEventListener("change", closeMenuOnDesktop);
    };
  }, []);

  function closeMenu() {
    setIsOpen(false);
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Escape" || !isOpen) {
      return;
    }

    event.preventDefault();
    closeMenu();
    menuButtonRef.current?.focus();
  }

  return (
    <header className={styles.siteHeader} onKeyDown={handleMenuKeyDown}>
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
            ref={menuButtonRef}
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
      </nav>
    </header>
  );
}
