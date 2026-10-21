import "server-only";
import { cacheLife } from "next/cache";
import {
  categorySchema,
  fallbackCategories,
  fallbackProjects,
  fallbackServices,
  fallbackSettings,
  fallbackTestimonials,
  projectSchema,
  serviceSchema,
  settingsSchema,
  testimonialSchema,
} from "@/lib/portfolio-schema";
import { z } from "zod";

const apiOrigin = () => (process.env.PORTFOLIO_API_URL || "http://localhost:6231").replace(/\/+$/, "");

async function readPublic<T>(path: string, schema: z.ZodType<T>, fallback: T): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiOrigin()}${path}`);
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.warn(`Portfolio API request failed for ${path}; using the built-in preview content.`);
    return fallback;
  }

  if (!response.ok) {
    console.warn(`Portfolio API returned ${response.status} for ${path}; using the built-in preview content.`);
    return fallback;
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    console.warn(`Portfolio API returned invalid JSON for ${path}; using the built-in preview content.`);
    return fallback;
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    console.warn(`Portfolio API response did not match the expected shape for ${path}.`, parsed.error.issues);
    return fallback;
  }
  return parsed.data;
}

export async function getCategories() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300, expire: 3600 });
  return readPublic("/api/public/categories", z.array(categorySchema), fallbackCategories);
}

export async function getProjects() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300, expire: 3600 });
  return readPublic("/api/public/projects", z.array(projectSchema), fallbackProjects);
}

export async function getFeaturedProjects() {
  const projects = await getProjects();
  return projects.filter((project) => project.isFeatured).slice(0, 3);
}

export async function getProject(slug: string) {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300, expire: 3600 });
  const fallback = fallbackProjects.find((project) => project.slug === slug) ?? null;
  let response: Response;
  try {
    response = await fetch(`${apiOrigin()}/api/public/projects/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.warn(`Portfolio API request failed for project ${slug}; using preview content if available.`);
    return fallback;
  }
  if (response.status === 404) return fallback;
  if (!response.ok) {
    console.warn(`Portfolio API returned ${response.status} for project ${slug}; using preview content if available.`);
    return fallback;
  }
  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    console.warn(`Portfolio API returned invalid JSON for project ${slug}; using preview content if available.`);
    return fallback;
  }
  const parsed = projectSchema.safeParse(payload);
  if (!parsed.success) {
    console.warn(`Portfolio API project response did not match the expected shape for ${slug}.`, parsed.error.issues);
    return fallback;
  }
  return parsed.data;
}

export async function getTestimonials() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300, expire: 3600 });
  return readPublic("/api/public/testimonials", z.array(testimonialSchema), fallbackTestimonials);
}

export async function getServices() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300, expire: 3600 });
  return readPublic("/api/public/services", z.array(serviceSchema), fallbackServices);
}

export async function getSettings() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300, expire: 3600 });
  return readPublic("/api/public/settings", settingsSchema, fallbackSettings);
}
