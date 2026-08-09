import type { NextRequest } from "next/server";
import {
  parseCustomerReviewId,
  REVIEW_AVATAR_MIME_TYPES,
} from "@/lib/customer-reviews";
import { getAnalyticsDatabase } from "@/lib/postgres";
import { isStatsAuthorizationValid } from "@/lib/stats-auth";
import { createRequestId, logServerError } from "@/lib/observability";

export const dynamic = "force-dynamic";

const ALLOWED_AVATAR_TYPES = new Set<string>(REVIEW_AVATAR_MIME_TYPES);

type AvatarRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: AvatarRouteContext,
) {
  const { id } = await params;
  const databaseId = parseCustomerReviewId(id);

  if (!databaseId) {
    return new Response(null, { status: 404 });
  }

  const database = getAnalyticsDatabase();
  if (!database) {
    return new Response(null, { status: 404 });
  }

  const isAdministrator = isStatsAuthorizationValid(
    request.headers.get("authorization"),
  );

  try {
    const rows = await database<
      Array<{
        avatar_data: Uint8Array;
        avatar_mime_type: string;
      }>
    >`
      SELECT avatar_data, avatar_mime_type
      FROM customer_reviews
      WHERE id = ${databaseId}::bigint
        AND deleted_at IS NULL
        AND avatar_data IS NOT NULL
        AND avatar_mime_type IS NOT NULL
        AND (
          ${isAdministrator}
          OR (status = 'approved' AND is_visible = TRUE)
        )
      LIMIT 1
    `;
    const avatar = rows[0];

    if (!avatar || !ALLOWED_AVATAR_TYPES.has(avatar.avatar_mime_type)) {
      return new Response(null, { status: 404 });
    }

    const bytes = new Uint8Array(avatar.avatar_data);
    return new Response(new Blob([bytes], { type: avatar.avatar_mime_type }), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Type": avatar.avatar_mime_type,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    logServerError("review_avatar_database_failed", error, {
      requestId: createRequestId(),
      route: "/api/review-avatars/[id]",
      operation: "read_public_avatar",
    });
    return new Response(null, { status: 404 });
  }
}
