type ContentSecurityPolicyOptions = {
  nonce?: string;
  development?: boolean;
};

export function createContentSecurityPolicy({
  nonce,
  development = false,
}: ContentSecurityPolicyOptions = {}) {
  const scriptSources = ["'self'"];
  const connectSources = ["'self'"];

  if (nonce) {
    scriptSources.push(`'nonce-${nonce}'`, "'strict-dynamic'");
  } else {
    // Next.js injecte le bootstrap de ses pages statiques dans le HTML.
    scriptSources.push("'unsafe-inline'");
  }

  if (development) {
    scriptSources.push("'unsafe-eval'");
    connectSources.push("ws:", "wss:");
  }

  return [
    "default-src 'self'",
    `script-src ${scriptSources.join(" ")}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src ${connectSources.join(" ")}`,
    "media-src 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}
