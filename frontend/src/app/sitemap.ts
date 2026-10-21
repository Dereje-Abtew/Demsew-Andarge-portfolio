import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/portfolio-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:6230").replace(/\/+$/, "");
  const routes = ["", "/work", "/about", "/services", "/contact", "/privacy"];
  const projects = await getProjects();
  return [
    ...routes.map((route) => ({ url: `${baseUrl}${route}`, changeFrequency: "monthly" as const, priority: route ? 0.7 : 1 })),
    ...projects.map((project) => ({ url: `${baseUrl}/work/${project.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
