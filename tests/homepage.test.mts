import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const projectRoot = resolve(import.meta.dirname, "..");
const homePageSource = readFileSync(resolve(projectRoot, "app/page.tsx"), "utf8");
const heroSource = readFileSync(
  resolve(projectRoot, "components/home/home-hero.tsx"),
  "utf8",
);
const gallerySource = readFileSync(
  resolve(projectRoot, "components/home/gallery-section.tsx"),
  "utf8",
);
const cateringSource = readFileSync(
  resolve(projectRoot, "components/home/catering-section.tsx"),
  "utf8",
);
const presentationSource = readFileSync(
  resolve(projectRoot, "components/home/presentation-section.tsx"),
  "utf8",
);
const customerActionsSource = readFileSync(
  resolve(projectRoot, "components/home/customer-actions.tsx"),
  "utf8",
);
const orderStepsSource = readFileSync(
  resolve(projectRoot, "components/home/order-steps-section.tsx"),
  "utf8",
);
const reviewsSource = readFileSync(
  resolve(projectRoot, "components/reviews/customer-reviews-section.tsx"),
  "utf8",
);
const siteConfigSource = readFileSync(
  resolve(projectRoot, "config/site-config.ts"),
  "utf8",
);
const heroStyleSource = readFileSync(
  resolve(projectRoot, "components/home/home-hero.module.css"),
  "utf8",
);
const homepageSources = [
  heroSource,
  gallerySource,
  cateringSource,
  presentationSource,
].join("\n");

test("le Hero affiche la texture grunge éditoriale en arrière-plan décoratif", () => {
  assert.ok(heroSource.includes('import Image from "next/image"'));
  assert.ok(heroSource.includes("<Image"));
  assert.ok(
    heroSource.includes("SITE_CONFIG.images.heroBackdrop"),
  );
  assert.ok(
    siteConfigSource.includes(
      'heroBackdrop: "/images/site/home-grunge-hero.webp"',
    ),
  );
  assert.ok(
    existsSync(resolve(projectRoot, "public/images/site/home-grunge-hero.webp")),
  );
  assert.ok(heroSource.includes('alt=""'));
  assert.ok(heroStyleSource.includes(".heroBackdrop"));
  assert.ok(heroStyleSource.includes(".hero::after"));
  assert.ok(
    !heroSource.includes("/images/editorial/tilapia-frais-glace-pexels.webp"),
  );
  assert.equal((heroSource.match(/<h1\b/g) ?? []).length, 1);
});

test("les actions du Hero mènent vers des pages existantes", () => {
  assert.match(
    heroSource,
    /className=\{styles\.primaryAction\} href="\/carte"/,
  );
  assert.match(
    heroSource,
    /className=\{styles\.secondaryAction\} href="\/presentation"/,
  );
  assert.ok(heroSource.includes("Découvrir notre carte"));
  assert.ok(heroSource.includes("Notre histoire"));
});

test("le Hero validé reste inchangé pendant la refonte des sections", () => {
  assert.ok(heroSource.includes("La Côte d’Ivoire,"));
  assert.ok(heroSource.includes("à votre table."));
  assert.match(
    heroSource,
    /Des plats ivoiriens préparés sur commande,[\s\S]*maison comme pour une grande tablée\./,
  );
  assert.match(
    heroStyleSource,
    /min-height:\s*clamp\(680px, calc\(100svh - 78px\), 900px\)/,
  );
});

test("le Hero ne contient plus de bandeau de commande redondant", () => {
  assert.ok(!heroSource.includes("DELIVERY_SETTINGS"));
  assert.ok(!heroSource.includes("quickOrder"));
  assert.ok(!heroSource.includes("Commander"));
  assert.ok(!heroStyleSource.includes(".quickOrder"));
  assert.ok(!heroStyleSource.includes(".deliveryArea"));
  assert.ok(!heroStyleSource.includes(".continueAction"));
});

test("les sections de l’accueil suivent le parcours éditorial prévu", () => {
  const orderedSections = [
    "<HomeHero />",
    "<PresentationSection />",
    "<GallerySection />",
    "<OrderStepsSection />",
    "<ReviewsSection />",
    "<CateringSection />",
    "<CustomerActions />",
  ];
  const positions = orderedSections.map((section) => homePageSource.indexOf(section));

  assert.ok(positions.every((position) => position >= 0));
  for (let index = 1; index < positions.length; index += 1) {
    assert.ok(positions[index] > positions[index - 1]);
  }
  assert.ok(homePageSource.includes('<main id="contenu" tabIndex={-1}>'));
  assert.ok(!homePageSource.includes("FinalOrderCta"));
  assert.ok(
    !existsSync(resolve(projectRoot, "components/home/final-order-cta.tsx")),
  );
});

test("l’ancienne photographie de poisson n’est plus affichée sur l’accueil", () => {
  assert.ok(
    !homepageSources.includes(
      "/images/editorial/alloco-tilapia-ivoirien.webp",
    ),
  );
});

test("le plat signature reprend le nouvel attiéké tilapia fourni", () => {
  assert.ok(
    gallerySource.includes(
      "/images/menu/attieke-tilapia-proprietaire.webp",
    ),
  );
  assert.ok(!gallerySource.includes("/images/menu/attieke-tilapia.webp"));
});

test("les visuels de l’accueil sont réels et correctement associés", () => {
  assert.ok(
    homepageSources.includes(
      "/images/menu/alloco-poisson-braise-proprietaire.webp",
    ),
  );
  assert.ok(homepageSources.includes("/images/menu/foutou-sauce-graine.webp"));
  assert.ok(homepageSources.includes("/images/menu/pastel.webp"));
});

test("la présentation reprend les faits réels sur les fondatrices", () => {
  assert.ok(presentationSource.includes("Une cuisine née du partage"));
  assert.ok(presentationSource.includes("Marie-José et Geneviève"));
});

test("le parcours de commande décrit les trois actions réelles", () => {
  assert.ok(orderStepsSource.includes("Comment commander"));
  assert.ok(orderStepsSource.includes("Choisissez le mode de remise"));
  assert.ok(orderStepsSource.includes("Composez votre commande"));
  assert.ok(orderStepsSource.includes("Envoyez la demande sur WhatsApp"));
  assert.ok(orderStepsSource.includes("La commande est confirmée"));
  assert.equal((orderStepsSource.match(/title:/g) ?? []).length, 3);
});

test("l’aperçu des témoignages emploie un vocabulaire sans dépôt public", () => {
  assert.ok(reviewsSource.includes("Témoignages de nos clients"));
  assert.ok(reviewsSource.includes("Les témoignages arriveront bientôt"));
  assert.ok(reviewsSource.includes("Tous les témoignages"));
  assert.ok(!reviewsSource.includes("return null"));
  assert.ok(!reviewsSource.includes("Vos mots comptent"));
  assert.ok(!reviewsSource.includes("Tous les avis"));
});

test("les actions finales restent directes et sans sous-texte visible", () => {
  assert.ok(customerActionsSource.includes("Composer ma commande"));
  assert.ok(customerActionsSource.includes("Voir Instagram"));
  assert.ok(customerActionsSource.includes('href="/carte"'));
  assert.ok(customerActionsSource.includes("INSTAGRAM.href"));
  assert.ok(!customerActionsSource.includes("<small"));
});

test("un seul bloc traiteur distingue la couverture nationale de la livraison régionale", () => {
  assert.ok(
    cateringSource.includes("Un menu ivoirien pour votre événement"),
  );
  assert.ok(cateringSource.includes("CATERING_AREA_SETTINGS"));
  assert.ok(cateringSource.includes("CATERING_AREA_SETTINGS.locations"));
  assert.ok(cateringSource.includes("DELIVERY_SETTINGS.selectionLabel"));
  assert.ok(cateringSource.includes("Commandes & livraison"));
  assert.ok(cateringSource.includes('href="/evenements"'));
  assert.equal(
    existsSync(resolve(projectRoot, "components/home/events-section.tsx")),
    false,
  );
  assert.equal(
    existsSync(
      resolve(projectRoot, "components/home/activity-area-section.tsx"),
    ),
    false,
  );
  assert.equal(
    existsSync(resolve(projectRoot, "components/home/home-sections.module.css")),
    false,
  );
  assert.ok(gallerySource.includes("gallery-section.module.css"));
  assert.ok(siteConfigSource.includes('label: "Toute la Suisse"'));
  assert.ok(siteConfigSource.includes("nationwide: true"));
  assert.ok(
    siteConfigSource.includes(
      'cateringBackdrop: "/images/site/home-grunge-paper.webp"',
    ),
  );
});
