import type { NextConfig } from "next";
import { createContentSecurityPolicy } from "./lib/content-security-policy";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: createContentSecurityPolicy({
      development: process.env.NODE_ENV === "development",
    }),
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), geolocation=(), microphone=()",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
] as const;

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  experimental: {
    useTypeScriptCli: false,
    serverActions: {
      bodySizeLimit: "1mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/index.html",
        destination: "/",
        permanent: true,
      },
      {
        source: "/menu.html",
        destination: "/carte",
        permanent: true,
      },
      {
        source: "/carte/plats.html",
        destination: "/carte",
        permanent: true,
      },
      {
        source: "/carte/entrees.html",
        destination: "/carte",
        permanent: true,
      },
      {
        source: "/carte/desserts.html",
        destination: "/carte",
        permanent: true,
      },
      {
        source: "/carte/boissons.html",
        destination: "/carte",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...securityHeaders],
      },
    ];
  },
};

export default nextConfig;
