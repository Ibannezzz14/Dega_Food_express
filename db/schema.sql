CREATE TABLE IF NOT EXISTS whatsapp_handoff_daily (
  stat_date date NOT NULL,
  region text NOT NULL CHECK (region IN ('lausanne', 'lucens')),
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

ALTER TABLE whatsapp_handoff_daily
DROP COLUMN IF EXISTS updated_at;

CREATE INDEX IF NOT EXISTS whatsapp_handoff_daily_date_idx
ON whatsapp_handoff_daily (stat_date DESC);

CREATE INDEX IF NOT EXISTS whatsapp_handoff_daily_location_idx
ON whatsapp_handoff_daily (
  fulfillment,
  postal_code,
  city_key,
  stat_date DESC
);
