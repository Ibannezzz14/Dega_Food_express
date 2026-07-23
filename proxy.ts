import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getStatsCredentials } from "@/lib/stats-auth";
import { validateStatsAuthorization } from "@/lib/stats-auth-core";

export function proxy(request: NextRequest) {
  const credentials = getStatsCredentials();
  if (!credentials) {
    return new NextResponse("Statistiques privées non configurées.", {
      status: 503,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  }

  if (
    !validateStatsAuthorization(
      request.headers.get("authorization"),
      credentials,
    )
  ) {
    return new NextResponse("Authentification requise.", {
      status: 401,
      headers: {
        "Cache-Control": "private, no-store",
        "WWW-Authenticate":
          'Basic realm="Dega Food - Statistiques", charset="UTF-8"',
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = {
  matcher: ["/statistiques/:path*"],
};
