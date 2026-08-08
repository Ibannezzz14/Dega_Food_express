import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createContentSecurityPolicy } from "@/lib/content-security-policy";
import {
  createRequestId,
  logServerEvent,
} from "@/lib/observability";
import { getStatsCredentials } from "@/lib/stats-auth";
import { validateStatsAuthorization } from "@/lib/stats-auth-core";

function getPrivateResponseHeaders(
  contentSecurityPolicy: string,
  requestId: string,
) {
  return {
    "Cache-Control": "private, no-store",
    "Content-Security-Policy": contentSecurityPolicy,
    "X-Request-Id": requestId,
    "X-Robots-Tag": "noindex, nofollow, noarchive",
  };
}

export function proxy(request: NextRequest) {
  const requestId = createRequestId();
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const contentSecurityPolicy = createContentSecurityPolicy({
    nonce,
    development: process.env.NODE_ENV === "development",
  });
  const privateHeaders = getPrivateResponseHeaders(
    contentSecurityPolicy,
    requestId,
  );
  const credentials = getStatsCredentials();

  if (!credentials) {
    logServerEvent("warn", "admin_auth_unconfigured", {
      requestId,
      route: "/statistiques/:path*",
    });
    return new NextResponse("Espace d’administration non configuré.", {
      status: 503,
      headers: privateHeaders,
    });
  }

  if (
    !validateStatsAuthorization(
      request.headers.get("authorization"),
      credentials,
    )
  ) {
    logServerEvent("warn", "admin_auth_denied", {
      requestId,
      route: "/statistiques/:path*",
    });
    return new NextResponse("Authentification requise.", {
      status: 401,
      headers: {
        ...privateHeaders,
        "WWW-Authenticate":
          'Basic realm="Dega Food - Administration", charset="UTF-8"',
      },
    });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  Object.entries(privateHeaders).forEach(([name, value]) => {
    response.headers.set(name, value);
  });

  return response;
}

export const config = {
  matcher: ["/statistiques/:path*"],
};
