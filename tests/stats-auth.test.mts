import assert from "node:assert/strict";
import test from "node:test";
import {
  validateStatsAuthorization,
  type StatsCredentials,
} from "../lib/stats-auth-core.ts";

const credentials: StatsCredentials = {
  username: "dega",
  password: "un-mot-de-passe-solide",
};

function basic(username: string, password: string) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

test("autorise uniquement les identifiants statistiques exacts", () => {
  assert.equal(
    validateStatsAuthorization(
      basic(credentials.username, credentials.password),
      credentials,
    ),
    true,
  );
  assert.equal(
    validateStatsAuthorization(
      basic(credentials.username, "mauvais-mot-de-passe"),
      credentials,
    ),
    false,
  );
  assert.equal(
    validateStatsAuthorization(
      basic("autre-compte", credentials.password),
      credentials,
    ),
    false,
  );
});

test("refuse les en-têtes Basic absents ou malformés", () => {
  assert.equal(validateStatsAuthorization(null, credentials), false);
  assert.equal(
    validateStatsAuthorization("Bearer jeton", credentials),
    false,
  );
  assert.equal(validateStatsAuthorization("Basic !!!", credentials), false);
  assert.equal(
    validateStatsAuthorization("Basic ZGVnYQ==", credentials),
    false,
  );
});
