const LOCAL_SITE_URL = "http://localhost:3000";

type SiteUrlEnvironment = {
  siteUrl?: string;
  vercelProductionUrl?: string;
  production?: boolean;
};

function parseSiteUrl(value: string | undefined) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return null;
  }

  const candidate = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    const url = new URL(candidate);

    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username ||
      url.password
    ) {
      return null;
    }

    url.pathname = "/";
    url.search = "";
    url.hash = "";

    return url;
  } catch {
    return null;
  }
}

function isLocalHostname(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "[::1]"
  );
}

export function resolveSiteUrl({
  siteUrl,
  vercelProductionUrl,
  production = false,
}: SiteUrlEnvironment) {
  const explicitUrl = parseSiteUrl(siteUrl);
  if (siteUrl?.trim() && !explicitUrl) {
    throw new Error("SITE_URL doit contenir une URL HTTP(S) valide.");
  }

  const vercelUrl = parseSiteUrl(vercelProductionUrl);
  if (vercelProductionUrl?.trim() && !vercelUrl) {
    throw new Error(
      "VERCEL_PROJECT_PRODUCTION_URL contient une URL invalide.",
    );
  }

  const resolvedUrl = explicitUrl ?? vercelUrl;
  if (!production) {
    return resolvedUrl ?? new URL(LOCAL_SITE_URL);
  }

  if (
    !resolvedUrl ||
    resolvedUrl.protocol !== "https:" ||
    isLocalHostname(resolvedUrl.hostname)
  ) {
    throw new Error(
      "Une SITE_URL publique en HTTPS est requise pour construire le site en production.",
    );
  }

  return resolvedUrl;
}

export function getSiteUrl() {
  return resolveSiteUrl({
    siteUrl: process.env.SITE_URL,
    vercelProductionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    production: process.env.NODE_ENV === "production",
  });
}

export const siteUrl = getSiteUrl();
