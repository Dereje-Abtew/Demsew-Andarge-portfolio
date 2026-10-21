import type { Metadata } from "next";
import { WorkGallery } from "@/components/site/WorkGallery";
import { getCategories, getProjects } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "Selected Work",
  description: "Explore selected commercials, music videos, social films, and motion stories edited by Demsew Andarge.",
};

export default async function WorkPage() {
  const [projects, categories] = await Promise.all([getProjects(), getCategories()]);
  return (
    <main className="interior-page" id="main-content">
      <section className="interior-hero work-hero">
        <p className="eyebrow">THE PORTFOLIO / 01</p>
        <h1>Selected<br /><em>work.</em></h1>
        <p className="interior-intro">A collection of stories shaped with rhythm, feeling, and a deep respect for the frame.</p>
        <span className="interior-count">{String(projects.length).padStart(2, "0")} PROJECTS</span>
      </section>
      <section className="work-listing">
        <WorkGallery categories={categories} projects={projects} />
      </section>
    </main>
  );
}
