import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import test from "node:test";

const projectRoot = resolve(import.meta.dirname, "..");
const layoutSource = readFileSync(resolve(projectRoot, "app/layout.tsx"), "utf8");
const globalStyles = readFileSync(resolve(projectRoot, "app/globals.css"), "utf8");
const packageSource = readFileSync(resolve(projectRoot, "package.json"), "utf8");

function listCssFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      return listCssFiles(entryPath);
    }

    return entry.isFile() && entry.name.endsWith(".css") ? [entryPath] : [];
  });
}

function toProjectPath(filePath: string) {
  return relative(projectRoot, filePath).replaceAll("\\", "/");
}

const publicCssFiles = [
  ...listCssFiles(resolve(projectRoot, "app")),
  ...listCssFiles(resolve(projectRoot, "components")),
].filter(
  (filePath) => !toProjectPath(filePath).startsWith("app/statistiques/"),
);

test("Fraunces et Manrope utilisent l’intégration optimisée de Next.js", () => {
  assert.ok(layoutSource.includes('from "next/font/google"'));
  assert.ok(layoutSource.includes("Fraunces"));
  assert.ok(layoutSource.includes("Manrope"));
  assert.ok(layoutSource.includes('variable: "--font-fraunces"'));
  assert.ok(layoutSource.includes('variable: "--font-manrope"'));
  assert.ok(layoutSource.includes('weight: ["600", "700"]'));
  assert.ok(layoutSource.includes('weight: ["400", "500", "600", "700"]'));
  assert.equal(layoutSource.includes("@fontsource"), false);
});

test("Manrope reste globale et Fraunces limitée aux titres", () => {
  assert.ok(globalStyles.includes("var(--font-manrope)"));
  assert.ok(globalStyles.includes("var(--font-fraunces)"));
  assert.ok(globalStyles.includes("font-family: var(--font-body)"));
  assert.match(globalStyles, /h1,\s*\n+h2\s*\{\s*\n+\s*font-family: var\(--font-editorial\)/);
});

test("les anciens paquets de polices ne sont plus déclarés", () => {
  assert.equal(packageSource.includes("@fontsource-variable"), false);
});

test("les styles publics utilisent uniquement les graisses chargées", () => {
  const loadedWeights = new Set(["400", "500", "600", "700"]);
  const unsupportedWeights: string[] = [];

  for (const filePath of publicCssFiles) {
    const source = readFileSync(filePath, "utf8");

    for (const match of source.matchAll(/font-weight:\s*(\d+)\s*;/g)) {
      const weight = match[1];

      if (!loadedWeights.has(weight)) {
        const line = source.slice(0, match.index).split("\n").length;
        unsupportedWeights.push(
          `${toProjectPath(filePath)}:${line} (${weight})`,
        );
      }
    }
  }

  assert.deepEqual(
    unsupportedWeights,
    [],
    `Graisses non chargées détectées :\n${unsupportedWeights.join("\n")}`,
  );
});
