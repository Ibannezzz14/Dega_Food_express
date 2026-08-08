import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const projectRoot = resolve(import.meta.dirname, "..");

function read(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

const template = read("app/template.tsx");
const globals = read("app/globals.css");
const layout = read("app/layout.tsx");
const navigationFocus = read("components/layout/navigation-focus.tsx");
const header = read("components/layout/site-header.tsx");
const headerCss = read("components/layout/site-header.module.css");

test("la transition conserve une entrée fluide sans animation de sortie bloquante", () => {
  assert.match(template, /className="page-transition"/);
  assert.match(globals, /--motion-base:\s*180ms/);
  assert.match(
    globals,
    /animation:\s*page-enter var\(--motion-base\) var\(--ease-out\)/,
  );
  assert.match(globals, /opacity:\s*0\.92/);
  assert.match(globals, /translateY\(6px\)/);
  assert.match(globals, /to\s*\{[\s\S]*?opacity:\s*1;[\s\S]*?transform:\s*none;/);
  assert.doesNotMatch(globals, /@keyframes page-exit/);
  assert.doesNotMatch(globals, /page-transition--leaving/);
  assert.match(
    globals,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.page-transition\s*\{[\s\S]*?animation:\s*none;[\s\S]*?transform:\s*none;/,
  );

  const headerPosition = layout.indexOf("<SiteHeader />");
  const contentPosition = layout.indexOf("{children}");
  const footerPosition = layout.indexOf("<SiteFooter />");

  assert.ok(headerPosition >= 0 && headerPosition < contentPosition);
  assert.ok(contentPosition >= 0 && contentPosition < footerPosition);
});

test("un clic interne est observé sans retarder la navigation native", () => {
  assert.match(navigationFocus, /document\.addEventListener\("click", rememberInternalNavigation, true\)/);
  assert.match(navigationFocus, /event\.defaultPrevented/);
  assert.match(navigationFocus, /event\.metaKey/);
  assert.match(navigationFocus, /link\.hasAttribute\("download"\)/);
  assert.match(navigationFocus, /linkTarget && linkTarget !== "_self"/);
  assert.match(navigationFocus, /destination\.origin === window\.location\.origin/);
  assert.match(navigationFocus, /destination\.hash\.length === 0/);
  assert.match(navigationFocus, /shouldResetScrollRef\.current = changesPage/);
  assert.doesNotMatch(navigationFocus, /event\.preventDefault\(\)/);
  assert.doesNotMatch(navigationFocus, /useRouter\(\)/);
  assert.doesNotMatch(navigationFocus, /window\.setTimeout/);
});

test("les catégories de la carte ont une transition visible et réduisible", () => {
  const orderExperience = read("components/order/order-experience.tsx");
  const orderStyles = read("components/order/order-experience.module.css");

  assert.match(orderExperience, /key=\{`heading-\$\{activeCategory\}`\}/);
  assert.match(orderExperience, /key=\{activeCategory\}/);
  assert.match(orderStyles, /@keyframes category-heading-enter/);
  assert.match(orderStyles, /@keyframes category-list-enter/);
  assert.match(orderStyles, /animation:\s*category-heading-enter 220ms/);
  assert.match(
    orderStyles,
    /animation:\s*category-list-enter var\(--motion-content\) 35ms/,
  );
  assert.match(
    orderStyles,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.menuHeading,[\s\S]*?\.itemList,[\s\S]*?animation:\s*none;/,
  );
});

test("le focus de navigation respecte le scroll et les ancres", () => {
  assert.match(layout, /import NavigationFocus/);
  assert.match(layout, /<NavigationFocus \/>/);
  assert.match(navigationFocus, /usePathname\(\)/);
  assert.match(navigationFocus, /previousPathnameRef\.current === pathname/);
  assert.match(navigationFocus, /window\.location\.hash/);
  assert.match(navigationFocus, /rememberInternalNavigation/);
  assert.match(navigationFocus, /shouldResetScrollRef/);
  assert.match(navigationFocus, /destination\.pathname !== window\.location\.pathname/);
  assert.match(navigationFocus, /document\.getElementById\("contenu"\)/);
  assert.match(navigationFocus, /mainContent\.tabIndex = -1/);
  assert.match(navigationFocus, /focus\(\{ preventScroll: true \}\)/);
  assert.match(navigationFocus, /scrollTo\(\{ top: 0, left: 0, behavior: "instant" \}\)/);
  assert.doesNotMatch(navigationFocus, /scrollIntoView/);
  assert.match(globals, /#contenu\[tabindex="-1"\]:focus/);
});

test("le menu mobile se ferme et reste navigable sur petit écran", () => {
  assert.match(header, /previousPathnameRef/);
  assert.match(header, /onClick=\{closeMenu\}/);
  assert.match(header, /handleMobileNavigate\(item\.href\)/);
  assert.match(header, /targetPath === pathname/);
  assert.match(header, /event\.key !== "Escape"/);
  assert.match(header, /menuButtonRef\.current\?\.focus\(\)/);
  assert.match(header, /headerRef/);
  assert.match(header, /document\.addEventListener\("pointerdown"/);
  assert.match(header, /eventTarget instanceof Node/);
  assert.match(header, /headerRef\.current\?\.contains\(eventTarget\)/);
  assert.match(header, /inert=\{!isOpen\}/);
  assert.match(header, />\s*Voir la carte\s*</);

  assert.match(headerCss, /max-height:\s*calc\(100dvh - 78px\)/);
  assert.match(headerCss, /max-height:\s*calc\(100dvh - 68px\)/);
  assert.match(headerCss, /overflow-y:\s*auto/);
  assert.match(headerCss, /overscroll-behavior:\s*contain/);
  assert.match(
    headerCss,
    /\.menuToggle\[aria-expanded="true"\] \.menuGlyph i:first-child/,
  );
  assert.match(headerCss, /rotate\(45deg\)/);
  assert.match(headerCss, /rotate\(-45deg\)/);
  assert.match(headerCss, /\.mainNav a:focus-visible::after/);
  assert.match(headerCss, /a\[aria-current="page"\]/);
});

test("la couleur du navigateur correspond au fond du chrome", () => {
  assert.match(layout, /themeColor:\s*"#071f1a"/);
});
