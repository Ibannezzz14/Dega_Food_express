CREATE TABLE customer_reviews (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  display_name varchar(50) NOT NULL,
  rating smallint NOT NULL
    CONSTRAINT customer_reviews_rating_check CHECK (rating BETWEEN 1 AND 5),
  message varchar(500) NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  CONSTRAINT customer_reviews_published_shape CHECK (
    status <> 'approved' OR published_at IS NOT NULL
  )
);

CREATE INDEX customer_reviews_publication_idx
ON customer_reviews (published_at DESC, created_at DESC)
WHERE status = 'approved';
