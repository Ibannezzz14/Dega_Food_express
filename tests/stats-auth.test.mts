import assert from "node:assert/strict";
import test from "node:test";
import {
  isStatsAuthorizationValid,
  type StatsCredentials,
} from "../lib/stats-auth.ts";

const credentials: StatsCredentials = {
  username: "dega",
  password: "un-mot-de-passe-solide",
};

function basic(username: string, password: string) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

test("autorise uniquement les identifiants statistiques exacts", () => {
  assert.equal(
    isStatsAuthorizationValid(
      basic(credentials.username, credentials.password),
      credentials,
    ),
    true,
  );
  assert.equal(
    isStatsAuthorizationValid(
      basic(credentials.username, "mauvais-mot-de-passe"),
      credentials,
    ),
    false,
  );
  assert.equal(
    isStatsAuthorizationValid(
      basic("autre-compte", credentials.password),
      credentials,
    ),
    false,
  );
});

test("refuse les en-têtes Basic absents ou malformés", () => {
  assert.equal(isStatsAuthorizationValid(null, credentials), false);
  assert.equal(isStatsAuthorizationValid("Bearer jeton", credentials), false);
  assert.equal(isStatsAuthorizationValid("Basic !!!", credentials), false);
  assert.equal(isStatsAuthorizationValid("Basic ZGVnYQ==", credentials), false);
});
