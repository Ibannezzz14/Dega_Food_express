import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import {
  formatPublicErrorReference,
  logServerError,
} from "../lib/observability.ts";

const projectRoot = resolve(import.meta.dirname, "..");

function readProjectFile(path: string) {
  return readFileSync(resolve(projectRoot, path), "utf8");
}

test("les références publiques sont courtes, stables et sans caractères sensibles", () => {
  assert.equal(formatPublicErrorReference("abc-123_def-456"), "ABC123DEF4");
  assert.equal(formatPublicErrorReference("échec / privé"), "CHECPRIV");
  assert.equal(formatPublicErrorReference(null), "NON-DISPONIBLE");
});

test("les journaux d’erreur structurés n’exposent ni message ni pile", () => {
  const originalConsoleError = console.error;
  const captured: string[] = [];
  console.error = (value?: unknown) => captured.push(String(value));

  try {
    logServerError(
      "database failure",
      Object.assign(new Error("mot-de-passe-secret"), { code: "DB 42" }),
      {
        requestId: "req 123",
        route: "/avis/client@example.com",
        operation: "public list",
        durationMs: 12.4,
      },
    );
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(captured.length, 1);
  const record = JSON.parse(captured[0]);
  assert.equal(record.level, "error");
  assert.equal(record.event, "database_failure");
  assert.equal(record.requestId, "req_123");
  assert.equal(record.operation, "public_list");
  assert.equal(record.durationMs, 12);
  assert.equal(record.errorType, "Error");
  assert.equal(record.errorCode, "DB_42");
  assert.equal("message" in record, false);
  assert.equal("stack" in record, false);
  assert.doesNotMatch(captured[0], /mot-de-passe-secret/);
});

test("la page d’erreur affiche seulement une référence publique", () => {
  const errorPage = readProjectFile("app/error.tsx");

  assert.ok(errorPage.includes("error.digest"));
  assert.ok(errorPage.includes("formatPublicErrorReference"));
  assert.doesNotMatch(errorPage, /error\.(message|stack|cause)/);
});

test("le point de santé reste minimal et non mis en cache", () => {
  const healthRoute = readProjectFile("app/api/health/route.ts");

  assert.match(healthRoute, /export function GET\(\)/);
  assert.match(healthRoute, /export function HEAD\(\)/);
  assert.ok(healthRoute.includes('{ status: "ok" }'));
  assert.ok(healthRoute.includes('"Cache-Control": "no-store, max-age=0"'));
  assert.ok(healthRoute.includes('"X-Request-Id": requestId'));
  assert.doesNotMatch(healthRoute, /DATABASE_URL|process\.env|SELECT|postgres/i);
});

test("les erreurs Next sont journalisées avec le modèle de route, pas les données de requête", () => {
  const instrumentation = readProjectFile("instrumentation.ts");

  assert.ok(instrumentation.includes("Instrumentation.onRequestError"));
  assert.ok(instrumentation.includes("route: context.routePath"));
  assert.ok(instrumentation.includes("routeType: context.routeType"));
  assert.ok(instrumentation.includes("operation: request.method"));
  assert.doesNotMatch(instrumentation, /request\.(headers|path|url|body)/);
  assert.doesNotMatch(instrumentation, /error\.(message|stack|cause)/);
});
