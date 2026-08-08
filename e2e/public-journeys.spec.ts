import { expect, test } from "@playwright/test";

test("l’accueil expose son contenu principal sans débordement horizontal", async ({
  page,
}) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /La Côte d’Ivoire, à votre table\./,
    }),
  ).toBeVisible();
  await expect(page.locator("main#contenu")).toHaveCount(1);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");

  const layout = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    contentWidth: document.documentElement.scrollWidth,
  }));

  expect(layout.contentWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
});

test("le point de santé reste minimal et non mis en cache", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: "ok" });
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["content-type"]).toContain("application/json");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-request-id"]).toBeTruthy();
});

test("une URL inconnue renvoie une vraie page 404 avec des issues de secours", async ({
  page,
}) => {
  const response = await page.goto("/page-qui-n-existe-pas-e2e");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Cette page n’est pas au menu.",
    }),
  ).toBeVisible();
  const main = page.locator("main#contenu");
  await expect(main.getByRole("link", { name: "Voir la carte" })).toHaveAttribute(
    "href",
    "/carte",
  );
  await expect(
    main.getByRole("link", { name: "Retour à l’accueil" }),
  ).toHaveAttribute("href", "/");
});

test("le menu mobile se ferme avec Échap et rend le focus au déclencheur", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Ce parcours concerne uniquement la navigation mobile.");
  await page.goto("/");

  const openButton = page.getByRole("button", { name: "Ouvrir le menu" });
  await openButton.click();

  const mobileNavigation = page.getByRole("navigation", {
    name: "Navigation mobile",
  });
  await expect(mobileNavigation).toBeVisible();
  await expect(page.getByRole("button", { name: "Fermer le menu" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );

  await page.keyboard.press("Escape");

  await expect(mobileNavigation).toBeHidden();
  await expect(openButton).toHaveAttribute("aria-expanded", "false");
  await expect(openButton).toBeFocused();
});

test("le panier s’ouvre comme une boîte de dialogue et restitue le focus", async ({
  page,
}) => {
  await page.goto("/carte");

  await page.getByRole("radio", { name: /^Retrait/ }).check({ force: true });
  await page
    .getByRole("button", { name: "Ajouter Attiéké tilapia" })
    .click();

  const cartTrigger = page.getByRole("button", {
    name: /^(Voir le panier|Panier)$/,
  });
  await expect(cartTrigger).toBeVisible();
  await cartTrigger.click();

  const dialog = page.getByRole("dialog", { name: "Votre panier" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("heading", { name: "Attiéké tilapia" }),
  ).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Fermer le panier" })).toBeFocused();

  await page.keyboard.press("Escape");

  await expect(dialog).toBeHidden();
  await expect(cartTrigger).toBeFocused();
});

test("le formulaire traiteur vide affiche un résumé d’erreurs et lui donne le focus", async ({
  page,
}) => {
  await page.goto("/evenements#devis-traiteur");

  await page.getByRole("button", { name: "Continuer sur WhatsApp" }).click();

  const errorSummary = page.locator("form").getByRole("alert");
  await expect(errorSummary).toContainText("Vérifiez les informations suivantes");
  await expect(errorSummary).toBeFocused();
  await expect(
    errorSummary.getByRole("link", { name: "Indiquez votre prénom." }),
  ).toHaveAttribute("href", "#catering-first-name");
  await expect(page.getByRole("textbox", { name: "Prénom" })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
});

test("l’administration refuse une requête sans authentification", async ({
  request,
}) => {
  const response = await request.get("/statistiques", {
    maxRedirects: 0,
  });

  expect([401, 503]).toContain(response.status());
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["x-robots-tag"]).toContain("noindex");
  expect(response.headers()["x-request-id"]).toBeTruthy();

  if (response.status() === 401) {
    expect(response.headers()["www-authenticate"]).toContain("Basic");
  }
});
