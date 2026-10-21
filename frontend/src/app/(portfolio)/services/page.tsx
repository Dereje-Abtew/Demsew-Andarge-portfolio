import type { Metadata } from "next";
import { ArrowUpRight, Clapperboard, Film, MonitorPlay, Sparkles, WandSparkles } from "lucide-react";
import Link from "next/link";
import { getServices } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "Services",
  description: "Editing, motion design, color, and thoughtful video production services for brands and creators.",
};

const icons = [Film, Clapperboard, WandSparkles, MonitorPlay, Sparkles];

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <main className="interior-page services-page" id="main-content">
      <section className="interior-hero services-hero">
        <p className="eyebrow">HOW WE CAN WORK TOGETHER / 03</p>
        <h1>From footage<br />to <em>feeling.</em></h1>
        <p className="interior-intro">The right edit can make a good idea unforgettable. Here&apos;s how I can help yours get there.</p>
        <span className="interior-count">BUILT AROUND YOUR STORY</span>
      </section>
      <section className="services-cards">
        {services.map((service, index) => {
          const Icon = icons[index % icons.length];
          return (
            <article className="service-card" key={service.id}>
              <div className="service-card-top"><span>0{index + 1} / 0{services.length}</span><Icon size={20} strokeWidth={1.4} /></div>
              <h2>{service.title}</h2><p>{service.description}</p>
              <div className="service-card-bottom"><span>{service.priceLabel || "Custom quote"}</span><Link aria-label={`Request a quote for ${service.title}`} href="/contact"><ArrowUpRight size={17} /></Link></div>
            </article>
          );
        })}
      </section>
      <section className="service-process">
        <p className="eyebrow">THE PROCESS</p><h2>Clear from the<br /><em>first conversation.</em></h2>
        <div className="process-steps">
          <div><span>01</span><strong>We listen</strong><p>Share the idea, the audience, and what success looks like.</p></div>
          <div><span>02</span><strong>We shape</strong><p>A clear scope, schedule, and creative direction before the edit begins.</p></div>
          <div><span>03</span><strong>We finish</strong><p>Thoughtful review rounds, final polish, and delivery in the formats you need.</p></div>
        </div>
      </section>
      <section className="service-cta"><div><p className="eyebrow">NO TWO STORIES ARE THE SAME</p><h2>Tell me what you&apos;re<br /><em>imagining.</em></h2></div><Link className="button button-primary" href="/contact">Request a quote <ArrowUpRight size={15} /></Link></section>
    </main>
  );
}
