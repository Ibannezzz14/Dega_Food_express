BEGIN;

ALTER TABLE customer_reviews
  ALTER COLUMN rating DROP NOT NULL;

ALTER TABLE customer_reviews
  ADD COLUMN IF NOT EXISTS source text;
UPDATE customer_reviews
SET source = 'other'
WHERE source IS NULL;
ALTER TABLE customer_reviews
  ALTER COLUMN source SET DEFAULT 'other',
  ALTER COLUMN source SET NOT NULL;

ALTER TABLE customer_reviews
  ADD COLUMN IF NOT EXISTS source_label varchar(40);
UPDATE customer_reviews
SET source_label = CASE
  WHEN source = 'instagram' THEN 'Instagram'
  ELSE 'Autre'
END
WHERE source_label IS NULL;
ALTER TABLE customer_reviews
  ALTER COLUMN source_label SET DEFAULT 'Autre',
  ALTER COLUMN source_label SET NOT NULL;

ALTER TABLE customer_reviews
  ADD COLUMN IF NOT EXISTS reviewed_at date;
UPDATE customer_reviews
SET reviewed_at = COALESCE(published_at, created_at)::date
WHERE reviewed_at IS NULL;
ALTER TABLE customer_reviews
  ALTER COLUMN reviewed_at SET DEFAULT CURRENT_DATE,
  ALTER COLUMN reviewed_at SET NOT NULL;

ALTER TABLE customer_reviews
  ADD COLUMN IF NOT EXISTS is_visible boolean;
UPDATE customer_reviews
SET is_visible = status = 'approved'
WHERE is_visible IS NULL;
ALTER TABLE customer_reviews
  ALTER COLUMN is_visible SET DEFAULT true,
  ALTER COLUMN is_visible SET NOT NULL;

ALTER TABLE customer_reviews
  ADD COLUMN IF NOT EXISTS is_featured boolean;
UPDATE customer_reviews
SET is_featured = false
WHERE is_featured IS NULL;
ALTER TABLE customer_reviews
  ALTER COLUMN is_featured SET DEFAULT false,
  ALTER COLUMN is_featured SET NOT NULL;

ALTER TABLE customer_reviews
  ADD COLUMN IF NOT EXISTS sort_order integer;
WITH ordered_reviews AS (
  SELECT
    id,
    (row_number() OVER (
      ORDER BY COALESCE(published_at, created_at) DESC, id DESC
    ) - 1)::integer AS position
  FROM customer_reviews
  WHERE sort_order IS NULL
)
UPDATE customer_reviews
SET sort_order = ordered_reviews.position
FROM ordered_reviews
WHERE customer_reviews.id = ordered_reviews.id;
ALTER TABLE customer_reviews
  ALTER COLUMN sort_order SET DEFAULT 0,
  ALTER COLUMN sort_order SET NOT NULL;

ALTER TABLE customer_reviews
  ADD COLUMN IF NOT EXISTS avatar_data bytea,
  ADD COLUMN IF NOT EXISTS avatar_mime_type varchar(30),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
UPDATE customer_reviews
SET updated_at = COALESCE(published_at, created_at, now())
WHERE updated_at IS NULL;
ALTER TABLE customer_reviews
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE customer_reviews
  DROP CONSTRAINT IF EXISTS customer_reviews_rating_check,
  DROP CONSTRAINT IF EXISTS customer_reviews_source_check,
  DROP CONSTRAINT IF EXISTS customer_reviews_sort_order_check,
  DROP CONSTRAINT IF EXISTS customer_reviews_avatar_shape;

ALTER TABLE customer_reviews
  ADD CONSTRAINT customer_reviews_rating_check
    CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  ADD CONSTRAINT customer_reviews_source_check
    CHECK (source IN ('instagram', 'other')),
  ADD CONSTRAINT customer_reviews_sort_order_check
    CHECK (sort_order >= 0),
  ADD CONSTRAINT customer_reviews_avatar_shape CHECK (
    (avatar_data IS NULL AND avatar_mime_type IS NULL)
    OR
    (
      avatar_data IS NOT NULL
      AND avatar_mime_type IS NOT NULL
      AND avatar_mime_type IN ('image/jpeg', 'image/png', 'image/webp')
      AND octet_length(avatar_data) BETWEEN 1 AND 524288
    )
  );

DROP INDEX IF EXISTS customer_reviews_publication_idx;

CREATE INDEX IF NOT EXISTS customer_reviews_public_order_idx
ON customer_reviews (
  is_featured DESC,
  sort_order ASC,
  reviewed_at DESC,
  id DESC
)
WHERE status = 'approved' AND is_visible = true AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS customer_reviews_admin_order_idx
ON customer_reviews (sort_order ASC, reviewed_at DESC, id DESC)
WHERE deleted_at IS NULL;

COMMIT;
