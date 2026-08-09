import type { PublicCustomerReview } from "@/lib/customer-reviews";
import styles from "./customer-reviews.module.css";

type ReviewCardProps = {
  review: PublicCustomerReview;
};

const reviewDateFormatter = new Intl.DateTimeFormat("fr-CH", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatReviewDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : reviewDateFormatter.format(date);
}

function getInitials(displayName: string) {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase("fr-CH"))
    .join("");
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const rating = review.rating;

  return (
    <article
      className={styles.reviewCard}
      data-featured={review.isFeatured || undefined}
    >
      <header className={styles.cardHeader}>
        <div className={styles.authorIdentity}>
          <span className={styles.avatar} aria-hidden="true">
            <span>{getInitials(review.displayName)}</span>
            {review.avatarUrl ? (
              // L’image est servie par la route interne des avatars administrés.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={review.avatarUrl}
                alt=""
                width={48}
                height={48}
                loading="lazy"
              />
            ) : null}
          </span>

          <div className={styles.authorDetails}>
            <strong>{review.displayName}</strong>
            <time dateTime={review.reviewedAt}>
              {formatReviewDate(review.reviewedAt)}
            </time>
          </div>
        </div>

        <span className={styles.sourceLabel}>{review.sourceLabel}</span>
      </header>

      {rating !== null ? (
        <div
          className={styles.stars}
          role="img"
          aria-label={`${rating} étoile${rating > 1 ? "s" : ""} sur 5`}
        >
          <span aria-hidden="true">
            {Array.from({ length: 5 }, (_, index) =>
              index < rating ? "★" : "☆",
            ).join("")}
          </span>
        </div>
      ) : null}

      <blockquote>{review.message}</blockquote>
    </article>
  );
}
