"use client";

import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { useState } from "react";
import type { Testimonial } from "@/lib/portfolio";

export function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const [active, setActive] = useState(0);
  if (!items.length) return <div className="testimonial-empty">Good stories are better when they&apos;re shared.</div>;
  const current = items[active];
  return (
    <div aria-roledescription="carousel" className="testimonial-carousel">
      <div className="testimonial-quote"><Quote aria-hidden="true" size={31} strokeWidth={1.2} /></div>
      <blockquote>
        <p>“{current.quote}”</p>
        <footer><strong>{current.clientName}</strong>{current.clientTitle ? <span>{current.clientTitle}</span> : null}</footer>
      </blockquote>
      <div className="testimonial-controls">
        <span>{String(active + 1).padStart(2, "0")} <i>/</i> {String(items.length).padStart(2, "0")}</span>
        <button aria-label="Previous testimonial" onClick={() => setActive((active - 1 + items.length) % items.length)} type="button"><ArrowLeft size={17} /></button>
        <button aria-label="Next testimonial" onClick={() => setActive((active + 1) % items.length)} type="button"><ArrowRight size={17} /></button>
      </div>
    </div>
  );
}
