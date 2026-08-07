"use server";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import {
  createAdminCustomerReview,
  MAX_REVIEW_AVATAR_BYTES,
  moveAdminCustomerReview,
  REVIEW_AVATAR_MIME_TYPES,
  softDeleteAdminCustomerReview,
  updateAdminCustomerReview,
  type ReviewAvatar,
  type ReviewAvatarUpdate,
} from "@/lib/customer-reviews";
import { validateAdminCustomerReview } from "@/lib/customer-review-admin-validation";
import { isStatsAuthorizationValid } from "@/lib/stats-auth";

const ALLOWED_AVATAR_TYPES = new Set<string>(REVIEW_AVATAR_MIME_TYPES);

async function requireAdministrator() {
  const requestHeaders = await headers();

  if (!isStatsAuthorizationValid(requestHeaders.get("authorization"))) {
    notFound();
  }
}

function parseReviewId(value: FormDataEntryValue | null) {
  const id = String(value ?? "");
  return /^\d{1,18}$/.test(id) ? id : null;
}

function hasSignature(
  bytes: Uint8Array,
  signature: readonly number[],
  offset = 0,
) {
  return signature.every((value, index) => bytes[offset + index] === value);
}

function avatarSignatureIsValid(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return hasSignature(bytes, [0xff, 0xd8, 0xff]);
  }

  if (mimeType === "image/png") {
    return hasSignature(bytes, [
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
  }

  if (mimeType === "image/webp") {
    return (
      hasSignature(bytes, [0x52, 0x49, 0x46, 0x46]) &&
      hasSignature(bytes, [0x57, 0x45, 0x42, 0x50], 8)
    );
  }

  return false;
}

async function readAvatar(
  entry: FormDataEntryValue | null,
): Promise<{ ok: true; avatar: ReviewAvatar | null } | { ok: false; message: string }> {
  if (!(entry instanceof File) || entry.size === 0) {
    return { ok: true, avatar: null };
  }

  if (!ALLOWED_AVATAR_TYPES.has(entry.type)) {
    return {
      ok: false,
      message: "La photo doit être au format JPEG, PNG ou WebP.",
    };
  }

  if (entry.size > MAX_REVIEW_AVATAR_BYTES) {
    return {
      ok: false,
      message: "La photo ne doit pas dépasser 512 Kio.",
    };
  }

  const sourceData = new Uint8Array(await entry.arrayBuffer());
  if (!avatarSignatureIsValid(sourceData, entry.type)) {
    return {
      ok: false,
      message: "Le fichier image sélectionné est invalide.",
    };
  }

  try {
    const normalizedAvatar = await sharp(sourceData, {
      failOn: "error",
      limitInputPixels: 16_000_000,
    })
      .rotate()
      .resize(512, 512, {
        fit: "cover",
        position: "attention",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();

    if (
      normalizedAvatar.byteLength === 0 ||
      normalizedAvatar.byteLength > MAX_REVIEW_AVATAR_BYTES
    ) {
      return {
        ok: false,
        message: "La photo n’a pas pu être optimisée dans la taille autorisée.",
      };
    }

    return {
      ok: true,
      avatar: {
        data: new Uint8Array(normalizedAvatar),
        mimeType: "image/webp" satisfies ReviewAvatar["mimeType"],
      },
    };
  } catch {
    return {
      ok: false,
      message: "La photo n’a pas pu être lue ou optimisée.",
    };
  }
}

function validateForm(formData: FormData) {
  return validateAdminCustomerReview({
    displayName: formData.get("displayName"),
    rating: formData.get("rating"),
    message: formData.get("message"),
    source: "instagram",
    sourceLabel: "Instagram",
    reviewedAt: formData.get("reviewedAt"),
    isVisible: formData.get("isVisible") === "on",
    isFeatured: formData.get("isFeatured") === "on",
  });
}

function refreshReviewPages() {
  revalidatePath("/");
  revalidatePath("/avis");
  revalidatePath("/statistiques/avis");
}

function returnToAdmin(kind: "success" | "error", message: string): never {
  const query = new URLSearchParams({ [kind]: message });
  redirect(`/statistiques/avis?${query.toString()}`);
}

export async function createReviewAction(formData: FormData) {
  await requireAdministrator();

  const validation = validateForm(formData);
  if (!validation.ok) {
    returnToAdmin("error", validation.message);
  }

  const avatarResult = await readAvatar(formData.get("avatar"));
  if (!avatarResult.ok) {
    returnToAdmin("error", avatarResult.message);
  }

  const result = await createAdminCustomerReview(
    validation.value,
    avatarResult.avatar ?? undefined,
  );
  if (!result.ok) {
    returnToAdmin("error", result.message ?? "Enregistrement impossible.");
  }

  refreshReviewPages();
  returnToAdmin("success", "Témoignage ajouté.");
}

export async function updateReviewAction(formData: FormData) {
  await requireAdministrator();

  const id = parseReviewId(formData.get("id"));
  if (!id) {
    returnToAdmin("error", "Témoignage introuvable.");
  }

  const validation = validateForm(formData);
  if (!validation.ok) {
    returnToAdmin("error", validation.message);
  }

  const avatarResult = await readAvatar(formData.get("avatar"));
  if (!avatarResult.ok) {
    returnToAdmin("error", avatarResult.message);
  }

  let avatarUpdate: ReviewAvatarUpdate = { mode: "keep" };
  if (avatarResult.avatar) {
    avatarUpdate = { mode: "replace", avatar: avatarResult.avatar };
  } else if (formData.get("removeAvatar") === "on") {
    avatarUpdate = { mode: "remove" };
  }

  const result = await updateAdminCustomerReview(
    id,
    validation.value,
    avatarUpdate,
  );
  if (!result.ok) {
    returnToAdmin("error", result.message ?? "Modification impossible.");
  }

  refreshReviewPages();
  returnToAdmin("success", "Témoignage modifié.");
}

export async function moveReviewAction(formData: FormData) {
  await requireAdministrator();

  const id = parseReviewId(formData.get("id"));
  const direction = formData.get("direction");
  if (!id || (direction !== "up" && direction !== "down")) {
    returnToAdmin("error", "Déplacement invalide.");
  }

  const result = await moveAdminCustomerReview(id, direction);
  if (!result.ok) {
    returnToAdmin("error", result.message ?? "Déplacement impossible.");
  }

  refreshReviewPages();
  returnToAdmin("success", "Ordre mis à jour.");
}

export async function deleteReviewAction(formData: FormData) {
  await requireAdministrator();

  const id = parseReviewId(formData.get("id"));
  if (!id) {
    returnToAdmin("error", "Témoignage introuvable.");
  }

  const result = await softDeleteAdminCustomerReview(id);
  if (!result.ok) {
    returnToAdmin("error", result.message ?? "Suppression impossible.");
  }

  refreshReviewPages();
  returnToAdmin("success", "Témoignage supprimé.");
}
