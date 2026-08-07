import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ConfirmDeleteButton from "@/components/admin/confirm-delete-button";
import { listAdminCustomerReviews } from "@/lib/customer-reviews";
import { isStatsAuthorizationValid } from "@/lib/stats-auth";
import {
  createReviewAction,
  deleteReviewAction,
  moveReviewAction,
  updateReviewAction,
} from "./actions";
import styles from "./avis-admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administration des avis | Dega Food Express",
  description: "Gestion privée des témoignages Dega Food Express.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

type ReviewsAdminPageProps = {
  searchParams: Promise<{
    success?: string | string[];
    error?: string | string[];
  }>;
};

function readFeedback(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getTodayInSwitzerland() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Zurich",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function getVisibilityLabel(review: {
  status: "pending" | "approved" | "rejected";
  isVisible: boolean;
}) {
  if (review.status === "pending") {
    return "À vérifier";
  }

  return review.isVisible ? "Visible" : "Masqué";
}

export default async function ReviewsAdminPage({
  searchParams,
}: ReviewsAdminPageProps) {
  const requestHeaders = await headers();

  if (!isStatsAuthorizationValid(requestHeaders.get("authorization"))) {
    notFound();
  }

  const [params, result] = await Promise.all([
    searchParams,
    listAdminCustomerReviews(),
  ]);
  const success = readFeedback(params.success);
  const error = readFeedback(params.error);
  const today = getTodayInSwitzerland();

  return (
    <main id="contenu" className={styles.page} tabIndex={-1}>
      <section className={styles.hero} aria-labelledby="reviews-admin-title">
        <div className={styles.heroInner}>
          <div>
            <p className={styles.eyebrow}>Administration</p>
            <h1 id="reviews-admin-title">Avis & témoignages</h1>
          </div>
          <nav className={styles.adminNav} aria-label="Espace d’administration">
            <Link href="/statistiques">Statistiques</Link>
            <Link href="/avis" target="_blank" rel="noopener noreferrer">
              Voir la page publique
            </Link>
          </nav>
        </div>
      </section>

      <div className={styles.content}>
        {success ? (
          <p className={styles.successMessage} role="status">
            {success}
          </p>
        ) : null}
        {error ? (
          <p className={styles.errorMessage} role="alert">
            {error}
          </p>
        ) : null}

        {result.status !== "ready" ? (
          <section className={styles.configurationState} role="alert">
            <h2>
              {result.status === "unconfigured"
                ? "Base de données non configurée"
                : "Gestion momentanément indisponible"}
            </h2>
            <p>
              {result.status === "unconfigured"
                ? "Ajoutez DATABASE_URL pour gérer les témoignages depuis cette page."
                : "Réessayez dans quelques instants."}
            </p>
          </section>
        ) : (
          <>
            <section className={styles.createPanel} aria-labelledby="create-title">
              <header className={styles.sectionHeading}>
                <div>
                  <p className={styles.sectionLabel}>Nouveau</p>
                  <h2 id="create-title">Ajouter un témoignage</h2>
                </div>
              </header>

              <form
                action={createReviewAction}
                className={styles.reviewForm}
              >
                <div className={styles.formGrid}>
                  <label className={styles.field}>
                    <span>Prénom ou nom</span>
                    <input name="displayName" maxLength={50} required />
                  </label>

                  <label className={styles.field}>
                    <span>Note facultative</span>
                    <select name="rating" defaultValue="">
                      <option value="">Sans note</option>
                      <option value="5">5 étoiles</option>
                      <option value="4">4 étoiles</option>
                      <option value="3">3 étoiles</option>
                      <option value="2">2 étoiles</option>
                      <option value="1">1 étoile</option>
                    </select>
                  </label>

                  <label className={styles.field}>
                    <span>Date du témoignage</span>
                    <input
                      name="reviewedAt"
                      type="date"
                      defaultValue={today}
                      required
                    />
                  </label>

                  <label className={styles.field}>
                    <span>Photo ou avatar</span>
                    <input
                      name="avatar"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                    />
                    <small>JPEG, PNG ou WebP · 512 Kio maximum</small>
                  </label>

                  <label className={`${styles.field} ${styles.messageField}`}>
                    <span>Témoignage</span>
                    <textarea
                      name="message"
                      minLength={10}
                      maxLength={500}
                      rows={5}
                      required
                    />
                  </label>
                </div>

                <div className={styles.formFooter}>
                  <div className={styles.checkOptions}>
                    <label>
                      <input name="isVisible" type="checkbox" defaultChecked />
                      Visible sur le site
                    </label>
                    <label>
                      <input name="isFeatured" type="checkbox" />
                      Mettre en avant
                    </label>
                  </div>
                  <button className={styles.primaryButton} type="submit">
                    Ajouter
                  </button>
                </div>
              </form>
            </section>

            <section aria-labelledby="manage-title">
              <header className={styles.sectionHeading}>
                <div>
                  <p className={styles.sectionLabel}>Contenu publié</p>
                  <h2 id="manage-title">Gérer les témoignages</h2>
                </div>
                <span className={styles.reviewCount}>
                  {result.reviews.length} témoignage
                  {result.reviews.length === 1 ? "" : "s"}
                </span>
              </header>

              {result.reviews.length > 0 ? (
                <ol className={styles.adminReviewList}>
                  {result.reviews.map((review, index) => (
                    <li className={styles.adminReviewCard} key={review.id}>
                      <div className={styles.cardToolbar}>
                        <div className={styles.cardIdentity}>
                          {review.avatarUrl ? (
                            <Image
                              src={review.avatarUrl}
                              width={52}
                              height={52}
                              alt=""
                              unoptimized
                            />
                          ) : (
                            <span aria-hidden="true">
                              {review.displayName.charAt(0).toUpperCase()}
                            </span>
                          )}
                          <div>
                            <strong>{review.displayName}</strong>
                            <small>{getVisibilityLabel(review)}</small>
                          </div>
                        </div>

                        <div className={styles.orderControls}>
                          <form action={moveReviewAction}>
                            <input name="id" type="hidden" value={review.id} />
                            <input name="direction" type="hidden" value="up" />
                            <button
                              type="submit"
                              disabled={index === 0}
                              aria-label={`Monter le témoignage de ${review.displayName}`}
                            >
                              ↑
                            </button>
                          </form>
                          <form action={moveReviewAction}>
                            <input name="id" type="hidden" value={review.id} />
                            <input name="direction" type="hidden" value="down" />
                            <button
                              type="submit"
                              disabled={index === result.reviews.length - 1}
                              aria-label={`Descendre le témoignage de ${review.displayName}`}
                            >
                              ↓
                            </button>
                          </form>
                        </div>
                      </div>

                      <form
                        action={updateReviewAction}
                        className={styles.reviewForm}
                      >
                        <input name="id" type="hidden" value={review.id} />
                        <div className={styles.formGrid}>
                          <label className={styles.field}>
                            <span>Prénom ou nom</span>
                            <input
                              name="displayName"
                              defaultValue={review.displayName}
                              maxLength={50}
                              required
                            />
                          </label>

                          <label className={styles.field}>
                            <span>Note facultative</span>
                            <select
                              name="rating"
                              defaultValue={review.rating ?? ""}
                            >
                              <option value="">Sans note</option>
                              <option value="5">5 étoiles</option>
                              <option value="4">4 étoiles</option>
                              <option value="3">3 étoiles</option>
                              <option value="2">2 étoiles</option>
                              <option value="1">1 étoile</option>
                            </select>
                          </label>

                          <label className={styles.field}>
                            <span>Date du témoignage</span>
                            <input
                              name="reviewedAt"
                              type="date"
                              defaultValue={review.reviewedAt.slice(0, 10)}
                            />
                          </label>

                          <div className={styles.field}>
                            <label htmlFor={`avatar-${review.id}`}>
                              Remplacer la photo
                            </label>
                            <input
                              id={`avatar-${review.id}`}
                              name="avatar"
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                            />
                            {review.avatarUrl ? (
                              <label className={styles.removeAvatar}>
                                <input name="removeAvatar" type="checkbox" />
                                Retirer la photo actuelle
                              </label>
                            ) : null}
                          </div>

                          <label
                            className={`${styles.field} ${styles.messageField}`}
                          >
                            <span>Témoignage</span>
                            <textarea
                              name="message"
                              defaultValue={review.message}
                              minLength={10}
                              maxLength={500}
                              rows={5}
                              required
                            />
                          </label>
                        </div>

                        <div className={styles.formFooter}>
                          <div className={styles.checkOptions}>
                            <label>
                              <input
                                name="isVisible"
                                type="checkbox"
                                defaultChecked={review.isVisible}
                              />
                              Visible sur le site
                            </label>
                            <label>
                              <input
                                name="isFeatured"
                                type="checkbox"
                                defaultChecked={review.isFeatured}
                              />
                              Mettre en avant
                            </label>
                          </div>
                          <button className={styles.secondaryButton} type="submit">
                            Enregistrer
                          </button>
                        </div>
                      </form>

                      <form className={styles.deleteForm} action={deleteReviewAction}>
                        <input name="id" type="hidden" value={review.id} />
                        <ConfirmDeleteButton className={styles.deleteButton} />
                      </form>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className={styles.emptyState}>
                  Aucun témoignage enregistré.
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
