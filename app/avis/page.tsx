import type { Metadata } from "next";
import Image from "next/image";
import ReviewCard from "@/components/reviews/review-card";
import { SITE_CONFIG } from "@/config/site-config";
import { getCachedPublishedCustomerReviews } from "@/lib/customer-reviews";
import { createPageMetadata } from "@/lib/page-metadata";
import styles from "./avis.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Témoignages | Dega Food Express",
  description:
    "Témoignages reçus par Dega Food Express sur Instagram.",
  path: "/avis",
});

export default async function ReviewsPage() {
  const result = await getCachedPublishedCustomerReviews(24);
  const testimonials = result.reviews;
  const hasTestimonials =
    result.status === "ready" && testimonials.length > 0;
  const emptyMessage =
    result.status === "error"
      ? `Les témoignages sont momentanément indisponibles. Référence ${result.reference}.`
      : "Les témoignages arriveront bientôt.";

  return (
    <main id="contenu" className={styles.page} tabIndex={-1}>
      <section className={styles.hero} aria-labelledby="reviews-page-title">
        <Image
          className={styles.heroBackdrop}
          src={SITE_CONFIG.images.testimonialsBackdrop}
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Instagram</p>
          <h1 id="reviews-page-title">Témoignages de nos clients.</h1>
          <p className={styles.heroText}>
            {hasTestimonials
              ? "Des messages reçus directement sur Instagram."
              : emptyMessage}
          </p>
        </div>
      </section>

      {hasTestimonials ? (
        <section
          className={styles.testimonialsSection}
          aria-labelledby="testimonials-title"
        >
          <div className={styles.sectionInner}>
            <h2 className="sr-only" id="testimonials-title">
              Témoignages publiés
            </h2>
            <ol className={styles.reviewGrid} role="list">
              {testimonials.map((review) => (
                <li key={review.id}>
                  <ReviewCard review={review} />
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}
    </main>
  );
}
