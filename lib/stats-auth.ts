import "server-only";

import {
  validateStatsAuthorization,
  type StatsCredentials,
} from "@/lib/stats-auth-core";

export function getStatsCredentials(): StatsCredentials | null {
  const username = process.env.STATS_USER?.trim();
  const password = process.env.STATS_PASSWORD;

  if (!username || !password || password.length < 12) {
    return null;
  }

  return { username, password };
}

export function isStatsAuthorizationValid(
  authorization: string | null,
) {
  return validateStatsAuthorization(authorization, getStatsCredentials());
}
