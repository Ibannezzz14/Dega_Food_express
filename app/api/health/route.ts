import { NextResponse } from "next/server";
import { createRequestId } from "@/lib/observability";

export const dynamic = "force-dynamic";

function healthHeaders(requestId: string) {
  return {
    "Cache-Control": "no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    "X-Request-Id": requestId,
  };
}

export function GET() {
  const requestId = createRequestId();

  return NextResponse.json(
    { status: "ok" },
    { headers: healthHeaders(requestId) },
  );
}

export function HEAD() {
  const requestId = createRequestId();

  return new Response(null, {
    status: 200,
    headers: healthHeaders(requestId),
  });
}
