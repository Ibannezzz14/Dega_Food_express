import "server-only";

import {
  createStatsCredentials,
  validateStatsAuthorization,
  type StatsCredentials,
} from "@/lib/stats-auth-core";

export function getStatsCredentials(): StatsCredentials | null {
  return createStatsCredentials(
    process.env.STATS_USER,
    process.env.STATS_PASSWORD,
  );
}

export function isStatsAuthorizationValid(
  authorization: string | null,
) {
  return validateStatsAuthorization(authorization, getStatsCredentials());
}
