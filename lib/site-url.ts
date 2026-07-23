const LOCAL_SITE_URL = "http://localhost:3000";

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

    if (url.protocol !== "http:" && url.protocol !== "https:") {
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

export function getSiteUrl() {
  return (
    parseSiteUrl(process.env.SITE_URL) ??
    parseSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    new URL(LOCAL_SITE_URL)
  );
}

export const siteUrl = getSiteUrl();
