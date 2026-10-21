import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clapperboard, Film, Sparkles, WandSparkles } from "lucide-react";
import { HeroReel } from "@/components/site/HeroReel";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Reveal } from "@/components/site/Reveal";
import { TestimonialCarousel } from "@/components/site/TestimonialCarousel";
import { socialLinks } from "@/lib/portfolio";
import { getCategories, getFeaturedProjects, getServices, getSettings, getTestimonials } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  description: "Cinematic edits, motion design, and stories made to stay with you.",
};

const serviceIcons = [Film, Clapperboard, WandSparkles, Sparkles];

function personJsonLd(name: string, description: string, location: string, links: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: "Video Editor & Motion Storyteller",
    description,
    address: { "@type": "PostalAddress", addressLocality: location, addressCountry: "ET" },
    sameAs: links,
  };
}

export default async function HomePage() {
  const [settings, featured, services, testimonials, categories] = await Promise.all([
    getSettings(), getFeaturedProjects(), getServices(), getTestimonials(), getCategories(),
  ]);
  const links = socialLinks(settings);
  const jsonLd = personJsonLd(settings.heroTitle, settings.seoDescription, settings.location, links.map((link) => link.href));

  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <HeroReel featured={featured} settings={settings} />

      <section className="intro-band">
        <div className="intro-marker"><span>01</span> THE POINT OF VIEW</div>
        <p>Every frame is a chance to make someone <em>feel something.</em> I bring picture, rhythm, and movement together to make stories that mean more.</p>
        <span className="intro-side-note">EDITED WITH INTENTION <i>✳</i></span>
      </section>

      <section className="section-wrap selected-work" id="selected-work">
        <Reveal>
          <div className="section-heading">
            <div><p className="eyebrow">A FEW RECENT STORIES</p><h2>Selected <em>work</em></h2></div>
            <Link className="text-link" href="/work">Explore all work <ArrowUpRight size={15} /></Link>
          </div>
        </Reveal>
        {featured.length ? (
          <div className="project-grid">
            {featured.map((project, index) => <Reveal delay={index * 0.08} key={project.id}><ProjectCard index={index} project={project} /></Reveal>)}
          </div>
        ) : (
          <div className="empty-work">New work is on the way. <Link href="/contact">Let&apos;s talk about yours <ArrowRight size={14} /></Link></div>
        )}
      </section>

      <section className="services-teaser">
        <div className="services-teaser-intro">
          <p className="eyebrow">WHAT I DO</p>
          <h2>Good stories<br />deserve a <em>good edit.</em></h2>
          <p>From the first assembly to the final frame, I help projects find their pace, shape, and feeling.</p>
          <Link className="text-link" href="/services">Discover the services <ArrowUpRight size={15} /></Link>
        </div>
        <div className="service-list">
          {services.slice(0, 4).map((service, index) => {
            const Icon = serviceIcons[index % serviceIcons.length];
            return (
              <Link className="service-row" href="/services" key={service.id}>
                <span className="service-row-icon"><Icon size={18} strokeWidth={1.5} /></span>
                <span className="service-row-copy"><small>0{index + 1}</small><strong>{service.title}</strong><span>{service.description}</span></span>
                <ArrowUpRight className="service-row-arrow" size={17} />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="proof-strip" aria-label="Portfolio highlights">
        <div><strong>{String(featured.length).padStart(2, "0")}</strong><span>FEATURED FILMS</span></div>
        <span className="proof-line" />
        <div><strong>{String(services.length).padStart(2, "0")}</strong><span>WAYS TO COLLABORATE</span></div>
        <span className="proof-line" />
        <div><strong>{String(categories.length).padStart(2, "0")}</strong><span>CREATIVE FORMATS</span></div>
        <p>Small teams. Considered details.<br />A finished film you can feel.</p>
      </section>

      <section className="testimonial-section">
        <div className="testimonial-heading"><p className="eyebrow">KIND WORDS</p><h2>Better together.</h2></div>
        <TestimonialCarousel items={testimonials} />
      </section>

      <section className="home-cta">
        <div className="cta-orbit" aria-hidden="true" />
        <p className="eyebrow">HAVE SOMETHING IN MIND?</p>
        <h2>Let&apos;s make it<br /><em>move.</em></h2>
        <p>Tell me what you&apos;re building. We&apos;ll find the right way to tell it.</p>
        <Link className="button button-light" href="/contact">Start a conversation <ArrowUpRight size={15} /></Link>
        <span className="cta-number">02 / 02</span>
      </section>

      <div className="home-contact-strip">
        <span>DIRECT INQUIRIES</span><a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail} <ArrowUpRight size={13} /></a>
        <span className="contact-location">{settings.location}</span>
      </div>
    </main>
  );
}
