import Link from "next/link";
import { ArrowRightIcon } from "@/components/shared/icons";
import { getPublishedCustomerReviews } from "@/lib/customer-reviews";
import ReviewCard from "./review-card";
import styles from "./customer-reviews.module.css";

export default async function ReviewsSection() {
  const result = await getPublishedCustomerReviews(3);
  const reviews = result.reviews;
  const hasReviews = result.status === "ready" && reviews.length > 0;

  return (
    <section className={styles.section} id="avis" aria-labelledby="reviews-title">
      <div className={styles.inner}>
        <header className={styles.heading}>
          <div>
            <span>Sur Instagram</span>
            <h2 id="reviews-title">Témoignages de nos clients.</h2>
            {!hasReviews ? (
              <p className={styles.comingSoon}>
                Les témoignages arriveront bientôt.
              </p>
            ) : null}
          </div>
          {hasReviews ? (
            <Link className={styles.sectionLink} href="/avis">
              Tous les témoignages
              <ArrowRightIcon />
            </Link>
          ) : null}
        </header>

        {hasReviews ? (
          <ol className={styles.reviewList} role="list">
            {reviews.map((review) => (
              <li key={review.id}>
                <ReviewCard review={review} />
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </section>
  );
}
