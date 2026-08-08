"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function NavigationFocus() {
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);
  const shouldResetScrollRef = useRef(false);

  useEffect(() => {
    function rememberInternalNavigation(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const eventTarget = event.target;

      if (!(eventTarget instanceof Element)) {
        return;
      }

      const link = eventTarget.closest<HTMLAnchorElement>("a[href]");

      if (!link || link.hasAttribute("download")) {
        return;
      }

      const linkTarget = link.getAttribute("target");

      if (linkTarget && linkTarget !== "_self") {
        return;
      }

      const destination = new URL(link.href, window.location.href);
      const changesPage =
        destination.origin === window.location.origin &&
        destination.pathname !== window.location.pathname &&
        destination.hash.length === 0;

      shouldResetScrollRef.current = changesPage;

    }

    document.addEventListener("click", rememberInternalNavigation, true);

    return () => {
      document.removeEventListener("click", rememberInternalNavigation, true);
    };
  }, []);

  useEffect(() => {
    if (previousPathnameRef.current === pathname) {
      return;
    }

    previousPathnameRef.current = pathname;
    const shouldResetScroll = shouldResetScrollRef.current;
    shouldResetScrollRef.current = false;

    if (window.location.hash) {
      return;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      const mainContent = document.getElementById("contenu");

      if (!(mainContent instanceof HTMLElement)) {
        return;
      }

      if (shouldResetScroll) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }

      mainContent.tabIndex = -1;
      mainContent.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [pathname]);

  return null;
}
