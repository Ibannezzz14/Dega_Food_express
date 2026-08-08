import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function expectNoCriticalOrSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags([
      "wcag2a",
      "wcag2aa",
      "wcag21a",
      "wcag21aa",
      "wcag22aa",
    ])
    .analyze();
  const blockingViolations = results.violations.filter(
    ({ impact }) => impact === "critical" || impact === "serious",
  );

  expect(
    blockingViolations,
    blockingViolations
      .map(
        (violation) =>
          `${violation.id}: ${violation.help}\n${violation.nodes
            .map((node) => `  - ${node.target.join(" ")}: ${node.failureSummary}`)
            .join("\n")}`,
      )
      .join("\n\n"),
  ).toEqual([]);
}

for (const publicPage of [
  {
    path: "/",
    heading: /La Côte d’Ivoire, à votre table\./,
  },
  {
    path: "/carte",
    heading: "Composez votre commande.",
  },
  {
    path: "/evenements",
    heading: "Un service traiteur pour votre événement.",
  },
] as const) {
  test(`${publicPage.path} n’a aucune violation axe critique ou sérieuse`, async ({
    page,
  }) => {
    await page.goto(publicPage.path);
    await expect(
      page.getByRole("heading", { level: 1, name: publicPage.heading }),
    ).toBeVisible();

    await expectNoCriticalOrSeriousViolations(page);
  });
}
