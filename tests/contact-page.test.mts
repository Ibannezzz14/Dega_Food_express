import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const projectRoot = resolve(import.meta.dirname, "..");
const pageSource = readFileSync(
  resolve(projectRoot, "app/contact/page.tsx"),
  "utf8",
);
const styleSource = readFileSync(
  resolve(projectRoot, "app/contact/contact.module.css"),
  "utf8",
);

test("la page Contact reste centrée sur l’appel direct", () => {
  assert.ok(pageSource.includes("CONTACTS.map"));
  assert.ok(pageSource.includes("href={contact.phoneHref}"));
  assert.ok(pageSource.includes("Appeler"));
  assert.ok(!pageSource.includes("next/image"));
  assert.ok(!pageSource.includes("INSTAGRAM"));
});

test("la demande traiteur reste dirigée vers son formulaire dédié", () => {
  assert.match(
    pageSource,
    /className=\{styles\.cateringLink\} href="\/evenements"/,
  );
});

test("la feuille Contact ne conserve plus les styles de l’ancien formulaire", () => {
  assert.ok(!styleSource.includes(".formPanel"));
  assert.ok(!styleSource.includes(".submitButton"));
  assert.ok(!styleSource.includes(".fieldGrid"));
});
