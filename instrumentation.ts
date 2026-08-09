import type { Instrumentation } from "next";
import {
  createRequestId,
  logServerError,
} from "@/lib/observability";

export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  const digest =
    error &&
    typeof error === "object" &&
    "digest" in error &&
    typeof error.digest === "string"
      ? error.digest
      : createRequestId();

  logServerError("next_request_failed", error, {
    requestId: digest,
    route: context.routePath,
    routeType: context.routeType,
    operation: request.method,
  });
};
