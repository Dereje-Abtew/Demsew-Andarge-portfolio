"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/site/ProjectCard";
import type { Category, Project } from "@/lib/portfolio";

export function WorkGallery({ projects, categories }: { projects: Project[]; categories: Category[] }) {
  const [active, setActive] = useState("all");
  const filtered = useMemo(
    () => active === "all" ? projects : projects.filter((project) => project.categoryId === Number(active)),
    [active, projects],
  );
  return (
    <>
      <div aria-label="Filter projects by category" className="work-filters" role="group">
        <button aria-pressed={active === "all"} className={active === "all" ? "filter-active" : ""} onClick={() => setActive("all")} type="button">
          All work <span>{projects.length.toString().padStart(2, "0")}</span>
        </button>
        {categories.map((category) => {
          const count = projects.filter((project) => project.categoryId === category.id).length;
          return (
            <button
              aria-pressed={active === String(category.id)}
              className={active === String(category.id) ? "filter-active" : ""}
              key={category.id}
              onClick={() => setActive(String(category.id))}
              type="button"
            >
              {category.name}<span>{count.toString().padStart(2, "0")}</span>
            </button>
          );
        })}
      </div>
      <div className="project-grid work-project-grid">
        <AnimatePresence mode="popLayout">
          {filtered.map((project, index) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              initial={{ opacity: 0, y: 12 }}
              key={project.id}
              layout
              transition={{ duration: 0.25 }}
            >
              <ProjectCard index={index} project={project} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {filtered.length === 0 ? <p className="empty-work">Nothing in this category just yet. Check back soon.</p> : null}
    </>
  );
}
