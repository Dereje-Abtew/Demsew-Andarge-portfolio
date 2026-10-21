"use client";

import { ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { isMp4, mediaUrl, type Project } from "@/lib/portfolio";

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const [preview, setPreview] = useState(false);
  const reduceMotion = useReducedMotion();
  const image = mediaUrl(project.thumbnailUrl);
  const previewVideo = isMp4(project.videoUrl);
  const startPreview = () => {
    if (previewVideo && !reduceMotion) setPreview(true);
  };
  return (
    <article className={`project-card project-tone-${index % 4}`}>
      <Link
        className="project-card-link"
        href={`/work/${project.slug}`}
        onBlur={() => setPreview(false)}
        onFocus={startPreview}
        onMouseEnter={startPreview}
        onMouseLeave={() => setPreview(false)}
      >
        <div className="project-visual">
          {image ? <Image alt="" className="project-image" fill priority={index === 0} sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw" src={image} /> : null}
          {preview && previewVideo ? <video aria-hidden="true" autoPlay className="project-preview-video" loop muted playsInline preload="none" src={project.videoUrl} /> : null}
          <span aria-hidden="true" className="project-grain" />
          <span className="project-index">{String(index + 1).padStart(2, "0")}</span>
          <span className="project-open"><ArrowUpRight size={18} /></span>
          <span className="project-play-mark" aria-hidden="true">▶</span>
          <span className="project-visual-label">{project.categoryName}</span>
        </div>
        <div className="project-meta">
          <div><h3>{project.title}</h3><p>{project.client || "Independent project"}</p></div>
          <span>{project.year}</span>
        </div>
      </Link>
    </article>
  );
}
