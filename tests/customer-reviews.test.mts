import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { validateAdminCustomerReview } from "../lib/customer-review-admin-validation.ts";

const projectRoot = resolve(import.meta.dirname, "..");

function readProjectFile(path: string) {
  return readFileSync(resolve(projectRoot, path), "utf8");
}

test("valide et normalise un témoignage administré", () => {
  assert.deepEqual(
    validateAdminCustomerReview({
      displayName: "  Awa   K. ",
      rating: "",
      message: "  Un repas délicieux et un accueil chaleureux.  ",
      source: "INSTAGRAM",
      sourceLabel: " Instagram ",
      reviewedAt: "2026-08-07",
      isVisible: "on",
      isFeatured: false,
    }),
    {
      ok: true,
      value: {
        displayName: "Awa K.",
        rating: null,
        message: "Un repas délicieux et un accueil chaleureux.",
        source: "instagram",
        sourceLabel: "Instagram",
        reviewedAt: "2026-08-07",
        isVisible: true,
        isFeatured: false,
      },
    },
  );
});

test("refuse les sources autres qu’Instagram et les données invalides", () => {
  const baseReview = {
    displayName: "Awa",
    rating: "5",
    message: "Un repas délicieux.",
    source: "instagram",
    sourceLabel: "Instagram",
    reviewedAt: "2026-08-07",
    isVisible: true,
    isFeatured: false,
  };

  assert.equal(
    validateAdminCustomerReview({ ...baseReview, source: "other" }).ok,
    false,
  );
  assert.equal(
    validateAdminCustomerReview({
      ...baseReview,
      sourceLabel: "Site web",
    }).ok,
    false,
  );
  assert.equal(
    validateAdminCustomerReview({ ...baseReview, rating: "6" }).ok,
    false,
  );
  assert.equal(
    validateAdminCustomerReview({
      ...baseReview,
      reviewedAt: "2026-02-30",
    }).ok,
    false,
  );
});

test("aucun formulaire public ne permet de déposer un avis sur le site", () => {
  const homepageSection = readProjectFile(
    "components/reviews/customer-reviews-section.tsx",
  );
  const reviewsPage = readProjectFile("app/avis/page.tsx");

  assert.ok(!homepageSection.includes("ReviewForm"));
  assert.ok(!homepageSection.includes("<form"));
  assert.ok(!reviewsPage.includes("<form"));
  assert.ok(reviewsPage.includes("Instagram"));
  assert.ok(reviewsPage.includes("getCachedPublishedCustomerReviews"));
  assert.ok(homepageSection.includes("getCachedPublishedCustomerReviews"));
  assert.ok(reviewsPage.includes("Les témoignages arriveront bientôt"));
  assert.ok(reviewsPage.includes("momentanément indisponibles"));
  assert.ok(reviewsPage.includes("result.reference"));
  assert.ok(homepageSection.includes("Les témoignages arriveront bientôt"));
  assert.ok(homepageSection.includes("result.reference"));
  assert.equal(existsSync(resolve(projectRoot, "lib/google-reviews.ts")), false);
  assert.equal(
    existsSync(
      resolve(projectRoot, "components/reviews/customer-review-form.tsx"),
    ),
    false,
  );
  assert.equal(
    existsSync(resolve(projectRoot, "app/actions/customer-reviews.ts")),
    false,
  );
});

test("les témoignages publics sont mis en cache et invalidés après administration", () => {
  const reviewsData = readProjectFile("lib/customer-reviews.ts");
  const reviewsPage = readProjectFile("app/avis/page.tsx");
  const homepage = readProjectFile("app/page.tsx");
  const adminActions = readProjectFile("app/statistiques/avis/actions.ts");

  assert.ok(reviewsData.includes("unstable_cache"));
  assert.ok(reviewsData.includes('tags: ["customer-reviews"]'));
  assert.match(reviewsData, /revalidate:\s*60/);
  assert.ok(adminActions.includes('updateTag("customer-reviews")'));
  assert.ok(adminActions.includes('revalidatePath("/avis")'));
  assert.ok(adminActions.includes('revalidatePath("/")'));
  assert.ok(!reviewsPage.includes('dynamic = "force-dynamic"'));
  assert.ok(!homepage.includes('dynamic = "force-dynamic"'));
});

test("les routes d’avatar partagent la même validation d’identifiant", () => {
  const reviewsData = readProjectFile("lib/customer-reviews.ts");
  const adminActions = readProjectFile("app/statistiques/avis/actions.ts");
  const publicAvatarRoute = readProjectFile(
    "app/api/review-avatars/[id]/route.ts",
  );
  const adminAvatarRoute = readProjectFile(
    "app/statistiques/avis/avatar/[id]/route.ts",
  );

  assert.match(reviewsData, /\^\\d\{1,19\}\$/);
  assert.ok(reviewsData.includes('MAX_DATABASE_ID = "9223372036854775807"'));

  for (const source of [adminActions, publicAvatarRoute, adminAvatarRoute]) {
    assert.ok(source.includes("parseCustomerReviewId"));
    assert.doesNotMatch(source, /\\d\{1,18\}/);
  }
});

test("les nouveaux avatars sont normalisés à une taille adaptée à l’affichage", () => {
  const adminActions = readProjectFile("app/statistiques/avis/actions.ts");

  assert.match(adminActions, /\.resize\(192, 192,/);
  assert.match(adminActions, /limitInputPixels:\s*16_000_000/);
  assert.match(adminActions, /\.webp\(\{ quality: 80 \}\)/);
  assert.ok(adminActions.includes("MAX_REVIEW_AVATAR_BYTES"));
});

test("l’administration privée couvre le cycle de vie des témoignages", () => {
  const adminPage = readProjectFile("app/statistiques/avis/page.tsx");
  const adminActions = readProjectFile("app/statistiques/avis/actions.ts");
  const proxy = readProjectFile("proxy.ts");

  assert.ok(proxy.includes('matcher: ["/statistiques/:path*"]'));
  assert.ok(adminActions.includes("requireAdministrator"));
  assert.ok(adminActions.includes("isStatsAuthorizationValid"));
  assert.ok(adminActions.includes("createAdminCustomerReview"));
  assert.ok(adminActions.includes("updateAdminCustomerReview"));
  assert.ok(adminActions.includes("moveAdminCustomerReview"));
  assert.ok(adminActions.includes("softDeleteAdminCustomerReview"));
  assert.ok(adminPage.includes('type="file"'));
  assert.ok(adminPage.includes('name="isVisible"'));
  assert.ok(adminPage.includes('name="isFeatured"'));
  assert.ok(adminPage.includes("ConfirmDeleteButton"));
  assert.ok(!adminPage.includes('name="source"'));
  assert.ok(!adminPage.includes('name="sourceLabel"'));
  assert.ok(adminActions.includes('source: "instagram"'));
  assert.ok(adminActions.includes('sourceLabel: "Instagram"'));
});

test("le schéma conserve la source, l’ordre, la visibilité et l’avatar", () => {
  const schema = readProjectFile("db/schema.sql");
  const migration = readProjectFile(
    "db/migrations/20260807_customer_review_admin.sql",
  );

  for (const column of [
    "source_label",
    "reviewed_at",
    "is_visible",
    "is_featured",
    "sort_order",
    "avatar_data",
    "avatar_mime_type",
    "deleted_at",
  ]) {
    assert.ok(schema.includes(column));
    assert.ok(migration.includes(column));
  }

  assert.ok(schema.includes("source IN ('instagram', 'other')"));
  assert.ok(schema.includes("octet_length(avatar_data) BETWEEN 1 AND 524288"));
});

test("la page Avis est reliée à la navigation et au sitemap", () => {
  const siteConfig = readProjectFile("config/site-config.ts");
  const sitemap = readProjectFile("app/sitemap.ts");

  assert.equal(
    (
      siteConfig.match(
        /\{ href: "\/avis", label: "Témoignages" \}/g,
      ) ?? []
    ).length,
    2,
  );
  assert.ok(sitemap.includes('{ path: "/avis"'));
  assert.ok(!siteConfig.includes('href: "/#avis"'));
});

test("les pages légales restent publiques", () => {
  const privacyPage = readProjectFile("app/confidentialite/page.tsx");
  const termsPage = readProjectFile("app/conditions/page.tsx");
  const footer = readProjectFile("components/layout/site-footer.tsx");

  assert.ok(privacyPage.includes("Politique de confidentialité"));
  assert.ok(termsPage.includes("Conditions d’utilisation"));
  assert.ok(footer.includes('href="/confidentialite"'));
  assert.ok(footer.includes('href="/conditions"'));
});
