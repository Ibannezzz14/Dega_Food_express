import "server-only";

import postgres from "postgres";

type PostgresClient = ReturnType<typeof postgres>;

const globalDatabase = globalThis as typeof globalThis & {
  degaAnalyticsDatabase?: PostgresClient;
};

export function getAnalyticsDatabase() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    return null;
  }

  if (!globalDatabase.degaAnalyticsDatabase) {
    globalDatabase.degaAnalyticsDatabase = postgres(connectionString, {
      max: 1,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 5,
      connection: {
        application_name: "dega_food_site",
        statement_timeout: 8_000,
        lock_timeout: 3_000,
        idle_in_transaction_session_timeout: 8_000,
      },
      onnotice: () => {},
    });
  }

  return globalDatabase.degaAnalyticsDatabase;
}
