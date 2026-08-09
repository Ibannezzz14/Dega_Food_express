type LogLevel = "info" | "warn" | "error";

export type SafeLogContext = {
  requestId?: string;
  route?: string;
  routeType?: string;
  operation?: string;
  statusCode?: number;
  durationMs?: number;
};

const SAFE_TEXT = /[^a-zA-Z0-9_./:-]/g;

function safeText(value: string, maximumLength = 120) {
  return value.replace(SAFE_TEXT, "_").slice(0, maximumLength);
}

function safeNumber(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : undefined;
}

function safeErrorDescriptor(error: unknown) {
  if (!error || typeof error !== "object") {
    return { errorType: "unknown", errorCode: "unknown" };
  }

  const errorType =
    "name" in error && typeof error.name === "string"
      ? safeText(error.name, 48)
      : "unknown";
  const errorCode =
    "code" in error &&
    (typeof error.code === "string" || typeof error.code === "number")
      ? safeText(String(error.code), 48)
      : "unknown";

  return { errorType, errorCode };
}

export function createRequestId() {
  return crypto.randomUUID();
}

export function formatPublicErrorReference(value: unknown) {
  const compact = String(value ?? "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 10)
    .toUpperCase();

  return compact || "NON-DISPONIBLE";
}

function createLogRecord(
  level: LogLevel,
  event: string,
  context: SafeLogContext,
  error?: unknown,
) {
  return {
    timestamp: new Date().toISOString(),
    level,
    event: safeText(event, 80),
    ...(context.requestId
      ? { requestId: safeText(context.requestId, 80) }
      : {}),
    ...(context.route ? { route: safeText(context.route) } : {}),
    ...(context.routeType
      ? { routeType: safeText(context.routeType, 32) }
      : {}),
    ...(context.operation
      ? { operation: safeText(context.operation, 80) }
      : {}),
    ...(safeNumber(context.statusCode) !== undefined
      ? { statusCode: safeNumber(context.statusCode) }
      : {}),
    ...(safeNumber(context.durationMs) !== undefined
      ? { durationMs: safeNumber(context.durationMs) }
      : {}),
    ...(error === undefined ? {} : safeErrorDescriptor(error)),
  };
}

export function logServerEvent(
  level: Exclude<LogLevel, "error">,
  event: string,
  context: SafeLogContext = {},
) {
  const serialized = JSON.stringify(createLogRecord(level, event, context));

  if (level === "warn") {
    console.warn(serialized);
    return;
  }

  console.info(serialized);
}

export function logServerError(
  event: string,
  error: unknown,
  context: SafeLogContext = {},
) {
  console.error(
    JSON.stringify(createLogRecord("error", event, context, error)),
  );
}
