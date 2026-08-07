"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function NavigationFocus() {
  const pathname = usePathname();
  const router = useRouter();
  const previousPathnameRef = useRef(pathname);
  const shouldResetScrollRef = useRef(false);
  const isNavigatingRef = useRef(false);
  const cancelPendingNavigationRef = useRef<(() => void) | null>(null);

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

      if (
        !changesPage ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      event.preventDefault();

      if (isNavigatingRef.current) {
        return;
      }

      const currentPage = document.querySelector<HTMLElement>(".page-transition");

      if (!currentPage) {
        router.push(`${destination.pathname}${destination.search}`);
        return;
      }

      isNavigatingRef.current = true;
      currentPage.classList.add("page-transition--leaving");

      let hasNavigated = false;
      const targetHref = `${destination.pathname}${destination.search}`;

      function navigate() {
        if (hasNavigated) {
          return;
        }

        hasNavigated = true;
        cancelPendingNavigationRef.current?.();
        cancelPendingNavigationRef.current = null;
        router.push(targetHref);
      }

      function handleExitEnd(animationEvent: AnimationEvent) {
        if (
          animationEvent.target === currentPage &&
          animationEvent.animationName === "page-exit"
        ) {
          navigate();
        }
      }

      const fallbackTimer = window.setTimeout(navigate, 180);

      currentPage.addEventListener("animationend", handleExitEnd);
      cancelPendingNavigationRef.current = () => {
        window.clearTimeout(fallbackTimer);
        currentPage.removeEventListener("animationend", handleExitEnd);
      };
    }

    document.addEventListener("click", rememberInternalNavigation, true);

    return () => {
      document.removeEventListener("click", rememberInternalNavigation, true);
      cancelPendingNavigationRef.current?.();
      cancelPendingNavigationRef.current = null;
    };
  }, [router]);

  useEffect(() => {
    if (previousPathnameRef.current === pathname) {
      return;
    }

    previousPathnameRef.current = pathname;
    isNavigatingRef.current = false;
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
