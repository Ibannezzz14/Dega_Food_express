export type JsonObjectReadResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; error: "invalid_json" | "too_large" };

const DEFAULT_MAX_BYTES = 8 * 1024;

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function readJsonObject(
  request: Request,
  maxBytes = DEFAULT_MAX_BYTES,
): Promise<JsonObjectReadResult> {
  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);
    if (
      Number.isFinite(contentLength) &&
      contentLength >= 0 &&
      contentLength > maxBytes
    ) {
      return { ok: false, error: "too_large" };
    }
  }

  if (!request.body) {
    return { ok: false, error: "invalid_json" };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      byteLength += value.byteLength;
      if (byteLength > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, error: "too_large" };
      }

      chunks.push(value);
    }
  } catch {
    return { ok: false, error: "invalid_json" };
  }

  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const value: unknown = JSON.parse(text);
    return isJsonObject(value)
      ? { ok: true, value }
      : { ok: false, error: "invalid_json" };
  } catch {
    return { ok: false, error: "invalid_json" };
  }
}
