import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

const publicRoutes = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/carte", changeFrequency: "weekly", priority: 0.9 },
  { path: "/presentation", changeFrequency: "monthly", priority: 0.7 },
  { path: "/evenements", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
] as const satisfies ReadonlyArray<{
  path: `/${string}` | "/";
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}>;

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map(({ path, changeFrequency, priority }) => ({
    url: new URL(path, siteUrl).toString(),
    changeFrequency,
    priority,
  }));
}
