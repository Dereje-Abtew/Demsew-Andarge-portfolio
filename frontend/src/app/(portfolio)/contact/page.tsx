import type { Metadata } from "next";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { ContactForm } from "@/components/site/ContactForm";
import { socialLinks } from "@/lib/portfolio";
import { getSettings } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "Contact",
  description: "Have a film, campaign, or story in mind? Get in touch with Demsew Andarge.",
};

function whatsappHref(value: string | null) {
  if (!value) return null;
  if (/^https:\/\//i.test(value)) return value;
  const number = value.replace(/[^\d]/g, "");
  return number ? `https://wa.me/${number}` : null;
}

export default async function ContactPage() {
  const settings = await getSettings();
  const whatsApp = whatsappHref(settings.whatsApp);
  const socials = socialLinks(settings);
  const telegram = settings.telegram && /^https:\/\//i.test(settings.telegram) ? settings.telegram : null;

  return (
    <main className="interior-page contact-page" id="main-content">
      <section className="interior-hero contact-hero">
        <p className="eyebrow">THE FIRST FRAME / 04</p>
        <h1>Let&apos;s start<br /><em>somewhere.</em></h1>
        <p className="interior-intro">Tell me about the story you&apos;re trying to tell. The rough idea is more than enough to begin.</p>
        <span className="interior-count">TYPICAL REPLY WITHIN 2 BUSINESS DAYS</span>
      </section>
      <section className="contact-content">
        <div className="contact-details">
          <p className="eyebrow">GOOD THINGS START WITH A NOTE</p>
          <h2>Tell me what<br />you&apos;re <em>thinking.</em></h2>
          <p>Share your timeline, the feeling you&apos;re after, or just the beginning of an idea. I&apos;ll get back to you personally.</p>
          <a className="contact-detail-row" href={`mailto:${settings.contactEmail}`}><span><Mail size={17} /></span><div><small>EMAIL</small><strong>{settings.contactEmail}</strong></div><ArrowUpRight size={14} /></a>
          <div className="contact-detail-row"><span><MapPin size={17} /></span><div><small>BASED IN</small><strong>{settings.location}</strong></div></div>
          {whatsApp ? <a className="contact-detail-row" href={whatsApp} rel="noreferrer" target="_blank"><span><MessageCircle size={17} /></span><div><small>WHATSAPP</small><strong>Start a chat</strong></div><ArrowUpRight size={14} /></a> : null}
          {telegram ? <a className="contact-detail-row" href={telegram} rel="noreferrer" target="_blank"><span><Send size={17} /></span><div><small>TELEGRAM</small><strong>Message me</strong></div><ArrowUpRight size={14} /></a> : null}
          {socials.length ? <div className="contact-social-links"><span>ELSEWHERE</span>{socials.map((item) => <a href={item.href} key={item.name} rel="noreferrer" target="_blank">{item.name}</a>)}</div> : null}
        </div>
        <ContactForm />
      </section>
      <div className="contact-footnote"><span>01 — CLEAR BRIEF, BETTER WORK</span><span>02 — NO COMMITMENT TO AN INQUIRY</span><span>03 — ALWAYS A HUMAN REPLY</span></div>
    </main>
  );
}
