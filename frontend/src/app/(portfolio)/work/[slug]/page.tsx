import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { VideoEmbed } from "@/components/site/VideoEmbed";
import { mediaUrl } from "@/lib/portfolio";
import { getProject, getProjects } from "@/lib/portfolio-data";

type ProjectRouteProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: project.thumbnailUrl ? [mediaUrl(project.thumbnailUrl) ?? project.thumbnailUrl] : undefined,
      type: "video.other",
    },
  };
}

export default async function ProjectPage({ params }: ProjectRouteProps) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  const image = mediaUrl(project.thumbnailUrl);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: project.title,
    description: project.description,
    thumbnailUrl: image ? [image] : undefined,
    uploadDate: `${project.year}-01-01`,
    contentUrl: project.videoUrl,
    creator: { "@type": "Person", name: "Demsew Andarge" },
  };

  return (
    <main className="project-detail" id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="project-detail-top"><Link className="back-link" href="/work"><ArrowLeft size={15} /> Back to selected work</Link><span>{project.categoryName.toUpperCase()} / {project.year}</span></div>
      <div className="project-detail-heading">
        <div><p className="eyebrow">PROJECT / {String(project.sortOrder + 1).padStart(2, "0")}</p><h1>{project.title}<span>.</span></h1></div>
        <p>{project.description}</p>
      </div>
      <VideoEmbed poster={image} src={project.videoUrl} title={project.title} />
      <section className="project-info-grid">
        <div className="project-info-copy"><p className="eyebrow">THE STORY</p><h2>Made to <em>stay with you.</em></h2><p>{project.description}</p></div>
        <dl className="project-facts">
          <div><dt>CLIENT</dt><dd>{project.client || "Independent"}</dd></div>
          <div><dt>ROLE</dt><dd>Editing &amp; motion storytelling</dd></div>
          <div><dt>YEAR</dt><dd>{project.year}</dd></div>
          <div><dt>TOOLS</dt><dd>{project.tools || "Video editing"}</dd></div>
          <div><dt>FORMAT</dt><dd>{project.categoryName}</dd></div>
        </dl>
      </section>
      {project.beforeAfterUrl ? (
        <section className="before-after-section">
          <p className="eyebrow">BEHIND THE CUT</p><h2>From footage to <em>feeling.</em></h2>
          {mediaUrl(project.beforeAfterUrl) ? <Image alt={`Before and after view for ${project.title}`} className="before-after-image" height={800} src={mediaUrl(project.beforeAfterUrl)!} width={1400} /> : null}
        </section>
      ) : null}
      <Link className="next-project-cta" href="/contact"><span>HAVE A PROJECT LIKE THIS?</span><strong>Let&apos;s talk about it <ArrowUpRight size={18} /></strong></Link>
    </main>
  );
}
