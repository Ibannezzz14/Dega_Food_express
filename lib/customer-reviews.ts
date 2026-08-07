import "server-only";

import type {
  AdminCustomerReviewInput,
  CustomerReviewRating,
} from "@/lib/customer-review-admin-validation";
import { getAnalyticsDatabase } from "@/lib/postgres";

export type PublicCustomerReview = {
  id: string;
  displayName: string;
  rating: CustomerReviewRating | null;
  message: string;
  reviewedAt: string;
  source: "instagram";
  sourceLabel: "Instagram";
  isFeatured: boolean;
  avatarUrl?: string;
};

export type AdminCustomerReview = {
  id: string;
  displayName: string;
  rating: CustomerReviewRating | null;
  message: string;
  source: "instagram";
  sourceLabel: "Instagram";
  reviewedAt: string;
  isVisible: boolean;
  isFeatured: boolean;
  avatarUrl?: string;
  status: "pending" | "approved" | "rejected";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminReviewsResult =
  | { status: "ready"; reviews: AdminCustomerReview[] }
  | { status: "unconfigured"; reviews: []; message: string }
  | { status: "error"; reviews: []; message: string };

export type PublishedReviewsResult =
  | { status: "ready"; reviews: PublicCustomerReview[] }
  | { status: "unconfigured"; reviews: [] }
  | { status: "error"; reviews: [] };

export const REVIEW_AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_REVIEW_AVATAR_BYTES = 512 * 1024;

export type ReviewAvatarMimeType =
  (typeof REVIEW_AVATAR_MIME_TYPES)[number];

export type ReviewAvatar = {
  data: Uint8Array;
  mimeType: ReviewAvatarMimeType;
};

export type ReviewAvatarUpdate =
  | { mode: "keep" }
  | { mode: "remove" }
  | { mode: "replace"; avatar: ReviewAvatar };

export type AdminReviewMutationResult =
  | { ok: true }
  | { ok: false; message: string };

export type ReviewMoveDirection = "up" | "down";

type PublicReviewRow = {
  id: string;
  display_name: string;
  rating: number | null;
  message: string;
  reviewed_at: string;
  is_featured: boolean;
  has_avatar: boolean;
  updated_at: Date;
};

type AdminReviewRow = PublicReviewRow & {
  is_visible: boolean;
  status: string;
  sort_order: number;
  created_at: Date;
};

const MAX_DATABASE_ID = "9223372036854775807";

function databaseErrorCode(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code.slice(0, 24);
  }

  return "unknown";
}

function reportDatabaseError(operation: string, error: unknown) {
  console.error(
    `[customer-reviews] ${operation} failed (${databaseErrorCode(error)})`,
  );
}

function normalizeDatabaseId(value: string) {
  if (!/^\d{1,19}$/.test(value)) {
    return null;
  }

  const id = value.replace(/^0+/, "");
  if (!id) {
    return null;
  }

  if (
    id.length > MAX_DATABASE_ID.length ||
    (id.length === MAX_DATABASE_ID.length && id > MAX_DATABASE_ID)
  ) {
    return null;
  }

  return id;
}

function toRating(value: number | null): CustomerReviewRating | null {
  return value === 1 ||
    value === 2 ||
    value === 3 ||
    value === 4 ||
    value === 5
    ? value
    : null;
}

function toReviewStatus(
  value: string,
): AdminCustomerReview["status"] {
  if (value === "approved" || value === "rejected") {
    return value;
  }

  return "pending";
}

function createAvatarUrl(
  id: string,
  updatedAt: Date,
  scope: "public" | "admin",
) {
  const version = encodeURIComponent(updatedAt.toISOString());
  const basePath =
    scope === "admin"
      ? `/statistiques/avis/avatar/${id}`
      : `/api/review-avatars/${id}`;
  return `${basePath}?v=${version}`;
}

function mapPublicReview(row: PublicReviewRow): PublicCustomerReview {
  return {
    id: `manual-${row.id}`,
    displayName: row.display_name,
    rating: toRating(row.rating),
    message: row.message,
    reviewedAt: row.reviewed_at,
    source: "instagram",
    sourceLabel: "Instagram",
    isFeatured: row.is_featured,
    ...(row.has_avatar
      ? { avatarUrl: createAvatarUrl(row.id, row.updated_at, "public") }
      : {}),
  };
}

function mapAdminReview(row: AdminReviewRow): AdminCustomerReview {
  return {
    id: row.id,
    displayName: row.display_name,
    rating: toRating(row.rating),
    message: row.message,
    source: "instagram",
    sourceLabel: "Instagram",
    reviewedAt: row.reviewed_at,
    isVisible: row.is_visible,
    isFeatured: row.is_featured,
    ...(row.has_avatar
      ? { avatarUrl: createAvatarUrl(row.id, row.updated_at, "admin") }
      : {}),
    status: toReviewStatus(row.status),
    sortOrder: row.sort_order,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function isReviewAvatarValid(avatar: ReviewAvatar) {
  return (
    avatar.data instanceof Uint8Array &&
    avatar.data.byteLength > 0 &&
    avatar.data.byteLength <= MAX_REVIEW_AVATAR_BYTES &&
    REVIEW_AVATAR_MIME_TYPES.some(
      (mimeType) => mimeType === avatar.mimeType,
    )
  );
}

function unconfiguredMutation(): AdminReviewMutationResult {
  return {
    ok: false,
    message: "La base de données des témoignages n’est pas configurée.",
  };
}

export async function getPublishedCustomerReviews(
  limit = 12,
): Promise<PublishedReviewsResult> {
  const database = getAnalyticsDatabase();
  if (!database) {
    return { status: "unconfigured", reviews: [] };
  }

  const safeLimit = Math.min(100, Math.max(1, Math.trunc(limit)));

  try {
    const rows = await database<PublicReviewRow[]>`
      SELECT
        id::text,
        display_name,
        rating,
        message,
        reviewed_at::text,
        is_featured,
        avatar_data IS NOT NULL AS has_avatar,
        updated_at
      FROM customer_reviews
      WHERE
        status = 'approved'
        AND is_visible = true
        AND source = 'instagram'
        AND deleted_at IS NULL
      ORDER BY
        is_featured DESC,
        sort_order ASC,
        reviewed_at DESC,
        id DESC
      LIMIT ${safeLimit}
    `;

    return { status: "ready", reviews: rows.map(mapPublicReview) };
  } catch (error) {
    reportDatabaseError("public list", error);
    return { status: "error", reviews: [] };
  }
}

export async function listAdminCustomerReviews(): Promise<AdminReviewsResult> {
  const database = getAnalyticsDatabase();
  if (!database) {
    return {
      status: "unconfigured",
      reviews: [],
      message: "Ajoutez DATABASE_URL pour gérer les témoignages.",
    };
  }

  try {
    const rows = await database<AdminReviewRow[]>`
      SELECT
        id::text,
        display_name,
        rating,
        message,
        reviewed_at::text,
        is_visible,
        is_featured,
        status,
        sort_order,
        avatar_data IS NOT NULL AS has_avatar,
        created_at,
        updated_at
      FROM customer_reviews
      WHERE deleted_at IS NULL
      ORDER BY sort_order ASC, reviewed_at DESC, id DESC
    `;

    return { status: "ready", reviews: rows.map(mapAdminReview) };
  } catch (error) {
    reportDatabaseError("admin list", error);
    return {
      status: "error",
      reviews: [],
      message: "Les témoignages ne peuvent pas être chargés actuellement.",
    };
  }
}

export async function createAdminCustomerReview(
  input: AdminCustomerReviewInput,
  avatar?: ReviewAvatar,
): Promise<AdminReviewMutationResult> {
  const database = getAnalyticsDatabase();
  if (!database) {
    return unconfiguredMutation();
  }

  if (avatar && !isReviewAvatarValid(avatar)) {
    return {
      ok: false,
      message: "L’avatar doit être une image JPEG, PNG ou WebP de 512 Kio maximum.",
    };
  }

  try {
    await database.begin(async (transaction) => {
      await transaction`
        SELECT pg_advisory_xact_lock(823516071)
      `;
      const [order] = await transaction<Array<{ next_order: number }>>`
        SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order
        FROM customer_reviews
        WHERE deleted_at IS NULL
      `;

      await transaction`
        INSERT INTO customer_reviews (
          display_name,
          rating,
          message,
          source,
          source_label,
          reviewed_at,
          is_visible,
          is_featured,
          sort_order,
          avatar_data,
          avatar_mime_type,
          status,
          published_at,
          updated_at
        )
        VALUES (
          ${input.displayName},
          ${input.rating},
          ${input.message},
          ${input.source},
          ${input.sourceLabel},
          ${input.reviewedAt}::date,
          ${input.isVisible},
          ${input.isFeatured},
          ${order?.next_order ?? 0},
          ${avatar?.data ?? null},
          ${avatar?.mimeType ?? null},
          'approved',
          now(),
          now()
        )
      `;
    });

    return { ok: true };
  } catch (error) {
    reportDatabaseError("create", error);
    return {
      ok: false,
      message: "Le témoignage n’a pas pu être ajouté.",
    };
  }
}

export async function updateAdminCustomerReview(
  id: string,
  input: AdminCustomerReviewInput,
  avatarUpdate: ReviewAvatarUpdate = { mode: "keep" },
): Promise<AdminReviewMutationResult> {
  const databaseId = normalizeDatabaseId(id);
  if (!databaseId) {
    return { ok: false, message: "Le témoignage demandé est invalide." };
  }

  const database = getAnalyticsDatabase();
  if (!database) {
    return unconfiguredMutation();
  }

  if (
    avatarUpdate.mode === "replace" &&
    !isReviewAvatarValid(avatarUpdate.avatar)
  ) {
    return {
      ok: false,
      message: "L’avatar doit être une image JPEG, PNG ou WebP de 512 Kio maximum.",
    };
  }

  try {
    const commonValues = {
      displayName: input.displayName,
      rating: input.rating,
      message: input.message,
      source: input.source,
      sourceLabel: input.sourceLabel,
      reviewedAt: input.reviewedAt,
      isVisible: input.isVisible,
      isFeatured: input.isFeatured,
    };

    let rows: Array<{ id: string }>;

    if (avatarUpdate.mode === "keep") {
      rows = await database<Array<{ id: string }>>`
        UPDATE customer_reviews
        SET
          display_name = ${commonValues.displayName},
          rating = ${commonValues.rating},
          message = ${commonValues.message},
          source = ${commonValues.source},
          source_label = ${commonValues.sourceLabel},
          reviewed_at = ${commonValues.reviewedAt}::date,
          is_visible = ${commonValues.isVisible},
          is_featured = ${commonValues.isFeatured},
          status = 'approved',
          published_at = COALESCE(published_at, now()),
          updated_at = now()
        WHERE id = ${databaseId}::bigint AND deleted_at IS NULL
        RETURNING id::text
      `;
    } else {
      const avatar =
        avatarUpdate.mode === "replace" ? avatarUpdate.avatar : null;
      rows = await database<Array<{ id: string }>>`
        UPDATE customer_reviews
        SET
          display_name = ${commonValues.displayName},
          rating = ${commonValues.rating},
          message = ${commonValues.message},
          source = ${commonValues.source},
          source_label = ${commonValues.sourceLabel},
          reviewed_at = ${commonValues.reviewedAt}::date,
          is_visible = ${commonValues.isVisible},
          is_featured = ${commonValues.isFeatured},
          avatar_data = ${avatar?.data ?? null},
          avatar_mime_type = ${avatar?.mimeType ?? null},
          status = 'approved',
          published_at = COALESCE(published_at, now()),
          updated_at = now()
        WHERE id = ${databaseId}::bigint AND deleted_at IS NULL
        RETURNING id::text
      `;
    }

    if (rows.length === 0) {
      return { ok: false, message: "Le témoignage demandé est introuvable." };
    }

    return { ok: true };
  } catch (error) {
    reportDatabaseError("update", error);
    return {
      ok: false,
      message: "Le témoignage n’a pas pu être modifié.",
    };
  }
}

export async function moveAdminCustomerReview(
  id: string,
  direction: ReviewMoveDirection,
): Promise<AdminReviewMutationResult> {
  const databaseId = normalizeDatabaseId(id);
  if (!databaseId || (direction !== "up" && direction !== "down")) {
    return { ok: false, message: "Le déplacement demandé est invalide." };
  }

  const database = getAnalyticsDatabase();
  if (!database) {
    return unconfiguredMutation();
  }

  try {
    const outcome = await database.begin(async (transaction) => {
      const rows = await transaction<Array<{ id: string }>>`
        SELECT id::text
        FROM customer_reviews
        WHERE deleted_at IS NULL
        ORDER BY sort_order ASC, reviewed_at DESC, id DESC
        FOR UPDATE
      `;

      const currentIndex = rows.findIndex((row) => row.id === databaseId);
      if (currentIndex < 0) {
        return "not_found" as const;
      }

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= rows.length) {
        return "boundary" as const;
      }

      [rows[currentIndex], rows[targetIndex]] = [
        rows[targetIndex],
        rows[currentIndex],
      ];

      for (const [sortOrder, row] of rows.entries()) {
        await transaction`
          UPDATE customer_reviews
          SET sort_order = ${sortOrder}, updated_at = now()
          WHERE id = ${row.id}::bigint
        `;
      }

      return "moved" as const;
    });

    if (outcome === "not_found") {
      return { ok: false, message: "Le témoignage demandé est introuvable." };
    }

    if (outcome === "boundary") {
      return {
        ok: false,
        message:
          direction === "up"
            ? "Ce témoignage est déjà en première position."
            : "Ce témoignage est déjà en dernière position.",
      };
    }

    return { ok: true };
  } catch (error) {
    reportDatabaseError("reorder", error);
    return {
      ok: false,
      message: "L’ordre des témoignages n’a pas pu être modifié.",
    };
  }
}

export async function softDeleteAdminCustomerReview(
  id: string,
): Promise<AdminReviewMutationResult> {
  const databaseId = normalizeDatabaseId(id);
  if (!databaseId) {
    return { ok: false, message: "Le témoignage demandé est invalide." };
  }

  const database = getAnalyticsDatabase();
  if (!database) {
    return unconfiguredMutation();
  }

  try {
    const rows = await database<Array<{ id: string }>>`
      UPDATE customer_reviews
      SET
        is_visible = false,
        is_featured = false,
        deleted_at = now(),
        updated_at = now()
      WHERE id = ${databaseId}::bigint AND deleted_at IS NULL
      RETURNING id::text
    `;

    if (rows.length === 0) {
      return { ok: false, message: "Le témoignage demandé est introuvable." };
    }

    return { ok: true };
  } catch (error) {
    reportDatabaseError("soft delete", error);
    return {
      ok: false,
      message: "Le témoignage n’a pas pu être supprimé.",
    };
  }
}
