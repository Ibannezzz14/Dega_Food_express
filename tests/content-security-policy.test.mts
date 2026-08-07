import assert from "node:assert/strict";
import test from "node:test";
import { createContentSecurityPolicy } from "../lib/content-security-policy.ts";

test("restreint les ressources des pages publiques", () => {
  const policy = createContentSecurityPolicy();

  assert.match(policy, /default-src 'self'/);
  assert.match(policy, /script-src 'self' 'unsafe-inline'/);
  assert.match(policy, /script-src-attr 'none'/);
  assert.match(policy, /connect-src 'self'/);
  assert.match(policy, /img-src 'self' data: blob:/);
  assert.doesNotMatch(policy, /'unsafe-eval'/);
});

test("utilise un nonce strict sur le tableau de bord privé", () => {
  const policy = createContentSecurityPolicy({
    nonce: "nonce-test",
  });

  assert.match(
    policy,
    /script-src 'self' 'nonce-nonce-test' 'strict-dynamic'/,
  );
  assert.doesNotMatch(policy, /script-src [^;]*'unsafe-inline'/);
});

test("n’autorise les besoins du serveur de développement qu’en local", () => {
  const policy = createContentSecurityPolicy({ development: true });

  assert.match(policy, /script-src [^;]*'unsafe-eval'/);
  assert.match(policy, /connect-src 'self' ws: wss:/);
});
