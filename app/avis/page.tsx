import type { Metadata } from "next";
import Image from "next/image";
import ReviewCard from "@/components/reviews/review-card";
import { SITE_CONFIG } from "@/config/site-config";
import { getPublishedCustomerReviews } from "@/lib/customer-reviews";
import { createPageMetadata } from "@/lib/page-metadata";
import styles from "./avis.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Témoignages | Dega Food Express",
  description:
    "Témoignages reçus par Dega Food Express sur Instagram.",
  path: "/avis",
});

export default async function ReviewsPage() {
  const result = await getPublishedCustomerReviews(24);
  const testimonials = result.reviews;

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
            Des messages reçus directement sur Instagram.
          </p>
        </div>
      </section>

      <section
        className={styles.testimonialsSection}
        aria-labelledby="testimonials-title"
      >
        <div className={styles.sectionInner}>
          <h2 className="sr-only" id="testimonials-title">
            Témoignages publiés
          </h2>

          {testimonials.length > 0 ? (
            <ol className={styles.reviewGrid} role="list">
              {testimonials.map((review) => (
                <li key={review.id}>
                  <ReviewCard review={review} />
                </li>
              ))}
            </ol>
          ) : (
            <div className={styles.emptyState}>
              <p>
                {result.status === "ready"
                  ? "Aucun témoignage publié pour le moment."
                  : "Les témoignages sont momentanément indisponibles."}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
