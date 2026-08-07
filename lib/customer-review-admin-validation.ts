export const ADMIN_CUSTOMER_REVIEW_SOURCES = [
  "instagram",
] as const;

export type AdminCustomerReviewSource =
  (typeof ADMIN_CUSTOMER_REVIEW_SOURCES)[number];

export type CustomerReviewRating = 1 | 2 | 3 | 4 | 5;

export type AdminCustomerReviewInput = {
  displayName: string;
  rating: CustomerReviewRating | null;
  message: string;
  source: AdminCustomerReviewSource;
  sourceLabel: string;
  reviewedAt: string;
  isVisible: boolean;
  isFeatured: boolean;
};

export type AdminCustomerReviewValidation =
  | { ok: true; value: AdminCustomerReviewInput }
  | {
      ok: false;
      field:
        | "displayName"
        | "rating"
        | "message"
        | "source"
        | "sourceLabel"
        | "reviewedAt"
        | "isVisible"
        | "isFeatured";
      message: string;
    };

function normalizeSingleLine(value: unknown) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeMessage(value: unknown) {
  return String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[\t ]+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

function normalizeOptionalRating(
  value: unknown,
): CustomerReviewRating | null | undefined {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return undefined;
  }

  return rating as CustomerReviewRating;
}

function normalizeBoolean(value: unknown) {
  if (value === true || value === "true" || value === "1" || value === "on") {
    return true;
  }

  if (
    value === false ||
    value === null ||
    value === undefined ||
    value === "" ||
    value === "false" ||
    value === "0" ||
    value === "off"
  ) {
    return false;
  }

  return undefined;
}

function normalizeDate(value: unknown) {
  const date = normalizeSingleLine(value);
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function isAdminCustomerReviewSource(
  value: string,
): value is AdminCustomerReviewSource {
  return ADMIN_CUSTOMER_REVIEW_SOURCES.some((source) => source === value);
}

export function validateAdminCustomerReview(input: {
  displayName: unknown;
  rating: unknown;
  message: unknown;
  source: unknown;
  sourceLabel: unknown;
  reviewedAt: unknown;
  isVisible: unknown;
  isFeatured: unknown;
}): AdminCustomerReviewValidation {
  const displayName = normalizeSingleLine(input.displayName);
  if (displayName.length < 2 || displayName.length > 50) {
    return {
      ok: false,
      field: "displayName",
      message: "Indiquez un prénom ou un nom entre 2 et 50 caractères.",
    };
  }

  const rating = normalizeOptionalRating(input.rating);
  if (rating === undefined) {
    return {
      ok: false,
      field: "rating",
      message: "La note doit être vide ou comprise entre 1 et 5 étoiles.",
    };
  }

  const message = normalizeMessage(input.message);
  if (message.length < 10 || message.length > 500) {
    return {
      ok: false,
      field: "message",
      message: "Le témoignage doit contenir entre 10 et 500 caractères.",
    };
  }

  const source = normalizeSingleLine(input.source).toLocaleLowerCase("fr-CH");
  if (!isAdminCustomerReviewSource(source)) {
    return {
      ok: false,
      field: "source",
      message: "La source doit être Instagram.",
    };
  }

  const sourceLabel = normalizeSingleLine(input.sourceLabel);
  if (sourceLabel.length < 2 || sourceLabel.length > 40) {
    return {
      ok: false,
      field: "sourceLabel",
      message: "Le nom de la source doit contenir entre 2 et 40 caractères.",
    };
  }

  if (sourceLabel.toLocaleLowerCase("fr-CH") !== "instagram") {
    return {
      ok: false,
      field: "sourceLabel",
      message: "Le libellé de la source doit être Instagram.",
    };
  }

  const reviewedAt = normalizeDate(input.reviewedAt);
  if (!reviewedAt) {
    return {
      ok: false,
      field: "reviewedAt",
      message: "Indiquez une date valide au format AAAA-MM-JJ.",
    };
  }

  const isVisible = normalizeBoolean(input.isVisible);
  if (isVisible === undefined) {
    return {
      ok: false,
      field: "isVisible",
      message: "L’état de visibilité est invalide.",
    };
  }

  const isFeatured = normalizeBoolean(input.isFeatured);
  if (isFeatured === undefined) {
    return {
      ok: false,
      field: "isFeatured",
      message: "L’état de mise en avant est invalide.",
    };
  }

  return {
    ok: true,
    value: {
      displayName,
      rating,
      message,
      source,
      sourceLabel: "Instagram",
      reviewedAt,
      isVisible,
      isFeatured,
    },
  };
}
