import type { SiteSettings } from "@/lib/portfolio-schema";
export type { Category, Project, Service, SiteSettings, Testimonial } from "@/lib/portfolio-schema";

const apiOrigin = () => (process.env.PORTFOLIO_API_URL || "http://localhost:6231").replace(/\/+$/, "");

export function mediaUrl(value: string | null | undefined) {
  if (!value) return null;
  if (/^https:\/\//i.test(value)) return value;
  if (value.startsWith("/uploads/")) return `${apiOrigin()}${value}`;
  return null;
}

export function videoEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)) {
      const id = url.pathname === "/watch" ? url.searchParams.get("v") : url.pathname.split("/").filter(Boolean).at(-1);
      return id && /^[\w-]{6,}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : null;
    }
    if (url.hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{6,}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : null;
    }
    if (["vimeo.com", "www.vimeo.com"].includes(url.hostname)) {
      const id = url.pathname.split("/").filter(Boolean).at(-1);
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0` : null;
    }
    return null;
  } catch {
    return null;
  }
}

export function isMp4(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.pathname.toLowerCase().endsWith(".mp4");
  } catch {
    return false;
  }
}

export function socialLinks(settings: SiteSettings) {
  return [
    { name: "YouTube", href: settings.youTubeUrl },
    { name: "Instagram", href: settings.instagramUrl },
    { name: "TikTok", href: settings.tikTokUrl },
    { name: "LinkedIn", href: settings.linkedInUrl },
    { name: "Behance", href: settings.behanceUrl },
  ].filter((item): item is { name: string; href: string } => {
    if (!item.href) return false;
    try {
      return new URL(item.href).protocol === "https:";
    } catch {
      return false;
    }
  });
}
