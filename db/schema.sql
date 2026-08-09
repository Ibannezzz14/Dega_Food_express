CREATE TABLE IF NOT EXISTS whatsapp_handoff_daily (
  stat_date date NOT NULL,
  region text NOT NULL
    CONSTRAINT whatsapp_handoff_daily_region_lucens CHECK (region = 'lucens'),
  fulfillment text NOT NULL CHECK (fulfillment IN ('pickup', 'delivery')),
  postal_code varchar(4) NOT NULL DEFAULT '',
  city_key varchar(80) NOT NULL DEFAULT '',
  city_label varchar(80) NOT NULL DEFAULT '',
  handoff_count bigint NOT NULL DEFAULT 1 CHECK (handoff_count > 0),
  CONSTRAINT whatsapp_handoff_location_shape CHECK (
    (
      fulfillment = 'pickup'
      AND postal_code = ''
      AND city_key = ''
      AND city_label = ''
    )
    OR
    (
      fulfillment = 'delivery'
      AND postal_code ~ '^[0-9]{4}$'
      AND char_length(city_key) BETWEEN 2 AND 80
      AND char_length(city_label) BETWEEN 2 AND 80
    )
  ),
  PRIMARY KEY (
    stat_date,
    region,
    fulfillment,
    postal_code,
    city_key
  )
);

CREATE INDEX IF NOT EXISTS whatsapp_handoff_daily_date_idx
ON whatsapp_handoff_daily (stat_date DESC);

CREATE INDEX IF NOT EXISTS whatsapp_handoff_daily_location_idx
ON whatsapp_handoff_daily (
  fulfillment,
  postal_code,
  city_key,
  stat_date DESC
);

CREATE TABLE IF NOT EXISTS customer_reviews (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  display_name varchar(50) NOT NULL,
  rating smallint
    CONSTRAINT customer_reviews_rating_check
    CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  message varchar(500) NOT NULL,
  source text NOT NULL DEFAULT 'other'
    CONSTRAINT customer_reviews_source_check
    CHECK (source IN ('instagram', 'other')),
  source_label varchar(40) NOT NULL DEFAULT 'Autre',
  reviewed_at date NOT NULL DEFAULT CURRENT_DATE,
  is_visible boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0
    CONSTRAINT customer_reviews_sort_order_check CHECK (sort_order >= 0),
  avatar_data bytea,
  avatar_mime_type varchar(30),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  deleted_at timestamptz,
  CONSTRAINT customer_reviews_published_shape CHECK (
    status <> 'approved' OR published_at IS NOT NULL
  ),
  CONSTRAINT customer_reviews_avatar_shape CHECK (
    (avatar_data IS NULL AND avatar_mime_type IS NULL)
    OR
    (
      avatar_data IS NOT NULL
      AND avatar_mime_type IS NOT NULL
      AND avatar_mime_type IN ('image/jpeg', 'image/png', 'image/webp')
      AND octet_length(avatar_data) BETWEEN 1 AND 524288
    )
  )
);

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
