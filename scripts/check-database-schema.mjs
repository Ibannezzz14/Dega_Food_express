import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import postgres from "postgres";

const projectRoot = resolve(import.meta.dirname, "..");
const connectionString = process.env.DATABASE_URL?.trim();
const destructiveTestEnabled =
  process.env.ALLOW_DESTRUCTIVE_DB_TESTS === "true";

if (!connectionString || !destructiveTestEnabled) {
  throw new Error(
    "Le test DB exige DATABASE_URL et ALLOW_DESTRUCTIVE_DB_TESTS=true.",
  );
}

const databaseUrl = new URL(connectionString);
const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(
  databaseUrl.hostname,
);
const databaseName = databaseUrl.pathname.replace(/^\//, "");

if (!isLocalHost || !/(?:_ci|_test)$/.test(databaseName)) {
  throw new Error(
    "Le test destructif est limité à une base locale dont le nom finit par _ci ou _test.",
  );
}

const sql = postgres(connectionString, {
  max: 1,
  prepare: false,
  connect_timeout: 5,
  onnotice: () => {},
});

async function readSql(relativePath) {
  return readFile(resolve(projectRoot, relativePath), "utf8");
}

async function resetTables() {
  await sql.unsafe(
    "DROP TABLE IF EXISTS customer_reviews, whatsapp_handoff_daily CASCADE",
  );
}

async function assertCurrentSchema() {
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('customer_reviews', 'whatsapp_handoff_daily')
    ORDER BY table_name
  `;
  assert.deepEqual(
    tables.map((row) => row.table_name),
    ["customer_reviews", "whatsapp_handoff_daily"],
  );

  const reviewColumns = await sql`
    SELECT column_name, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'customer_reviews'
  `;
  const columns = new Map(
    reviewColumns.map((row) => [row.column_name, row.is_nullable]),
  );

  for (const name of [
    "source",
    "source_label",
    "reviewed_at",
    "is_visible",
    "is_featured",
    "sort_order",
    "avatar_data",
    "avatar_mime_type",
    "updated_at",
    "deleted_at",
  ]) {
    assert.ok(columns.has(name), `Colonne manquante : ${name}`);
  }
  assert.equal(columns.get("rating"), "YES");

  const constraints = await sql`
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'customer_reviews'::regclass
  `;
  const constraintNames = new Set(constraints.map((row) => row.conname));
  assert.ok(constraintNames.has("customer_reviews_avatar_shape"));
  assert.ok(constraintNames.has("customer_reviews_source_check"));
  assert.ok(constraintNames.has("customer_reviews_published_shape"));
}

try {
  const schema = await readSql("db/schema.sql");
  const legacySchema = await readSql(
    "db/fixtures/customer_reviews_legacy.sql",
  );
  const migration = await readSql(
    "db/migrations/20260807_customer_review_admin.sql",
  );

  await resetTables();
  await sql.unsafe(schema);
  await sql.unsafe(schema);
  await assertCurrentSchema();

  await resetTables();
  await sql.unsafe(legacySchema);
  await sql.unsafe(migration);
  await sql.unsafe(migration);
  await sql.unsafe(schema);
  await assertCurrentSchema();

  console.info("Schéma PostgreSQL et migration vérifiés.");
} finally {
  await sql.end({ timeout: 5 });
}
