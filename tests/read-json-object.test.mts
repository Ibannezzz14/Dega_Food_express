import assert from "node:assert/strict";
import test from "node:test";
import { readJsonObject } from "../lib/read-json-object.ts";

function jsonRequest(body: string) {
  return new Request("https://example.test/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
}

test("accepte uniquement un objet JSON", async () => {
  assert.deepEqual(
    await readJsonObject(jsonRequest('{"query":"attieké"}')),
    {
      ok: true,
      value: { query: "attieké" },
    },
  );

  for (const invalidBody of ["null", "[]", '"texte"', "42", "true", "{"]) {
    assert.deepEqual(await readJsonObject(jsonRequest(invalidBody)), {
      ok: false,
      error: "invalid_json",
    });
  }
});

test("refuse un corps dépassant la limite annoncée", async () => {
  const request = jsonRequest(JSON.stringify({ query: "x".repeat(200) }));

  assert.deepEqual(await readJsonObject(request, 64), {
    ok: false,
    error: "too_large",
  });
});

test("interrompt aussi un flux trop gros sans Content-Length", async () => {
  const encoder = new TextEncoder();
  const request = new Request("https://example.test/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('{"query":"'));
        controller.enqueue(encoder.encode("x".repeat(200)));
        controller.enqueue(encoder.encode('"}'));
        controller.close();
      },
    }),
    duplex: "half",
  } as RequestInit & { duplex: "half" });

  assert.deepEqual(await readJsonObject(request, 64), {
    ok: false,
    error: "too_large",
  });
});
