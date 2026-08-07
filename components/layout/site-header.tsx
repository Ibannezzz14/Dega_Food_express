"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRightIcon } from "@/components/shared/icons";
import { SITE_CONFIG } from "@/config/site-config";
import styles from "./site-header.module.css";

const navigation = SITE_CONFIG.navigation;

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    if (previousPathnameRef.current === pathname) {
      return;
    }

    previousPathnameRef.current = pathname;
    const closeFrame = window.requestAnimationFrame(() => setIsOpen(false));

    return () => window.cancelAnimationFrame(closeFrame);
  }, [pathname]);

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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeMenuOnOutsideClick(event: PointerEvent) {
      const eventTarget = event.target;

      if (
        eventTarget instanceof Node &&
        !headerRef.current?.contains(eventTarget)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeMenuOnOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", closeMenuOnOutsideClick);
    };
  }, [isOpen]);

  function closeMenu() {
    setIsOpen(false);
  }

  function handleMobileNavigate(targetPath: string) {
    closeMenu();

    if (targetPath === pathname) {
      menuButtonRef.current?.focus({ preventScroll: true });
    }
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
    <header
      ref={headerRef}
      className={styles.siteHeader}
      onKeyDown={handleMenuKeyDown}
    >
      <div className={styles.headerInner}>
        <Link
          className={styles.brand}
          href="/"
          aria-label={`${SITE_CONFIG.brand.name}, accueil`}
          onClick={closeMenu}
        >
          <Image
            src={SITE_CONFIG.brand.logo}
            width={52}
            height={52}
            alt=""
            priority
          />
          <span>{SITE_CONFIG.brand.shortName}</span>
        </Link>

        <nav className={styles.mainNav} aria-label="Navigation principale">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.headerActions}>
          <Link
            className={styles.orderNavLink}
            href="/carte"
            onClick={closeMenu}
          >
            Voir la carte
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
        inert={!isOpen}
      >
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            onClick={() => handleMobileNavigate(item.href)}
          >
            {item.label}
            <ArrowRightIcon />
          </Link>
        ))}
      </nav>
    </header>
  );
}
