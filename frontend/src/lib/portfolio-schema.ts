import "server-only";
import { z } from "zod";

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  sortOrder: z.number(),
});

export const projectSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  client: z.string().nullable(),
  year: z.number(),
  videoUrl: z.string(),
  thumbnailUrl: z.string().nullable(),
  tools: z.string().nullable(),
  beforeAfterUrl: z.string().nullable(),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  sortOrder: z.number(),
  categoryId: z.number(),
  categoryName: z.string(),
});

export const testimonialSchema = z.object({
  id: z.number(),
  clientName: z.string(),
  clientTitle: z.string().nullable(),
  clientImageUrl: z.string().nullable(),
  quote: z.string(),
  isPublished: z.boolean(),
  sortOrder: z.number(),
});

export const serviceSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  priceLabel: z.string().nullable(),
  isPublished: z.boolean(),
  sortOrder: z.number(),
});

export const settingsSchema = z.object({
  heroTitle: z.string(),
  heroSubtitle: z.string(),
  showreelUrl: z.string().nullable(),
  aboutText: z.string(),
  profilePhotoUrl: z.string().nullable(),
  cvUrl: z.string().nullable(),
  contactEmail: z.string(),
  whatsApp: z.string().nullable(),
  telegram: z.string().nullable(),
  instagramUrl: z.string().nullable(),
  youTubeUrl: z.string().nullable(),
  tikTokUrl: z.string().nullable(),
  linkedInUrl: z.string().nullable(),
  behanceUrl: z.string().nullable(),
  location: z.string(),
  seoTitle: z.string(),
  seoDescription: z.string(),
});

export type Category = z.infer<typeof categorySchema>;
export type Project = z.infer<typeof projectSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type SiteSettings = z.infer<typeof settingsSchema>;

export const fallbackCategories: Category[] = [
  { id: 1, name: "Commercials", slug: "commercials", sortOrder: 0 },
  { id: 2, name: "Music Videos", slug: "music-videos", sortOrder: 1 },
  { id: 3, name: "Weddings", slug: "weddings", sortOrder: 2 },
  { id: 4, name: "Social Media / Reels", slug: "social-media", sortOrder: 3 },
  { id: 5, name: "Documentaries", slug: "documentaries", sortOrder: 4 },
  { id: 6, name: "Corporate", slug: "corporate", sortOrder: 5 },
  { id: 7, name: "Motion Graphics", slug: "motion-graphics", sortOrder: 6 },
];

export const fallbackProjects: Project[] = [
  {
    id: 1,
    title: "A Story in Motion",
    slug: "a-story-in-motion",
    description: "A sample project. Replace this with a real campaign and project details.",
    client: "Sample Client",
    year: 2026,
    videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
    thumbnailUrl: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=1200&q=80",
    tools: "Premiere Pro, After Effects",
    beforeAfterUrl: null,
    isFeatured: true,
    isPublished: true,
    sortOrder: 0,
    categoryId: 1,
    categoryName: "Commercials",
  },
  {
    id: 2,
    title: "After the Rhythm",
    slug: "after-the-rhythm",
    description: "A sample music video project. Replace this content with your own work.",
    client: "Independent Artist",
    year: 2026,
    videoUrl: "https://vimeo.com/76979871",
    thumbnailUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80",
    tools: "DaVinci Resolve, After Effects",
    beforeAfterUrl: null,
    isFeatured: true,
    isPublished: true,
    sortOrder: 1,
    categoryId: 2,
    categoryName: "Music Videos",
  },
];

export const fallbackTestimonials: Testimonial[] = [{
  id: 1,
  clientName: "Sample Client",
  clientTitle: "Replace with a real client",
  clientImageUrl: null,
  quote: "A sample testimonial. Replace this text with an approved client review.",
  isPublished: true,
  sortOrder: 0,
}];

export const fallbackServices: Service[] = [
  { id: 1, title: "Commercial & Brand Films", description: "Story-led edits for campaigns, products, and brands.", priceLabel: "Custom quote", isPublished: true, sortOrder: 0 },
  { id: 2, title: "Music Videos", description: "Rhythm-driven edits, color, and motion design.", priceLabel: "Custom quote", isPublished: true, sortOrder: 1 },
  { id: 3, title: "Social Content", description: "Platform-ready short-form edits and reels.", priceLabel: "Custom quote", isPublished: true, sortOrder: 2 },
];

export const fallbackSettings: SiteSettings = {
  heroTitle: "Demsew Andarge",
  heroSubtitle: "Video Editor & Motion Storyteller",
  showreelUrl: null,
  aboutText: "I shape raw footage into stories that move people.",
  profilePhotoUrl: null,
  cvUrl: null,
  contactEmail: "hello@example.com",
  whatsApp: null,
  telegram: null,
  instagramUrl: null,
  youTubeUrl: null,
  tikTokUrl: null,
  linkedInUrl: null,
  behanceUrl: null,
  location: "Addis Ababa, Ethiopia",
  seoTitle: "Demsew Andarge — Video Editor",
  seoDescription: "Cinematic video editing and motion storytelling.",
};
