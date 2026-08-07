import assert from "node:assert/strict";
import test from "node:test";
import { resolveSiteUrl } from "../lib/site-url.ts";

test("utilise localhost uniquement hors production", () => {
  assert.equal(
    resolveSiteUrl({ production: false }).toString(),
    "http://localhost:3000/",
  );
});

test("normalise l’URL canonique publique", () => {
  assert.equal(
    resolveSiteUrl({
      siteUrl: "dega-food.example/menu?source=test",
      production: true,
    }).toString(),
    "https://dega-food.example/",
  );
});

test("refuse une URL locale, non sécurisée ou absente en production", () => {
  assert.throws(() => resolveSiteUrl({ production: true }));
  assert.throws(() =>
    resolveSiteUrl({
      siteUrl: "http://dega-food.example",
      production: true,
    }),
  );
  assert.throws(() =>
    resolveSiteUrl({
      siteUrl: "https://localhost:3000",
      production: true,
    }),
  );
});

test("refuse les identifiants intégrés à l’URL", () => {
  assert.throws(() =>
    resolveSiteUrl({
      siteUrl: "https://user:secret@dega-food.example",
    }),
  );
});
