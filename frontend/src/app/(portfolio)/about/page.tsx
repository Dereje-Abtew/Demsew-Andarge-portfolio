import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownToLine, ArrowUpRight, Clapperboard, Focus, MoveRight } from "lucide-react";
import { mediaUrl } from "@/lib/portfolio";
import { getSettings } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "About",
  description: "Meet Demsew Andarge, a video editor and motion storyteller based in Ethiopia.",
};

const skills = ["Adobe Premiere Pro", "After Effects", "DaVinci Resolve", "Final Cut Pro", "Story editing", "Color grading", "Motion design", "Sound & pacing"];

export default async function AboutPage() {
  const settings = await getSettings();
  const photo = mediaUrl(settings.profilePhotoUrl);
  return (
    <main className="interior-page about-page" id="main-content">
      <section className="interior-hero about-hero">
        <p className="eyebrow">A LITTLE ABOUT ME / 02</p>
        <h1>Finding the<br /><em>feeling.</em></h1>
        <p className="interior-intro">{settings.heroSubtitle} based in {settings.location}. I believe the edit is where a story finds its voice.</p>
        <span className="interior-count">CURIOUS BY NATURE · EDITOR BY CRAFT</span>
      </section>
      <section className="about-story">
        <div className="about-photo">
          {photo ? <Image alt="Demsew Andarge, video editor and motion storyteller" fill priority sizes="(max-width: 760px) 90vw, 42vw" src={photo} /> : (
            <div className="about-photo-placeholder"><Clapperboard size={41} strokeWidth={1} /><span>YOUR PORTRAIT GOES HERE</span></div>
          )}
          <span className="photo-caption">{settings.location.toUpperCase()} · {settings.heroTitle.toUpperCase()}</span>
        </div>
        <div className="about-copy">
          <p className="eyebrow">THE PERSON BEHIND THE FRAME</p>
          <h2>Not just what<br />happens. <em>How it feels.</em></h2>
          {settings.aboutText.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          {settings.cvUrl ? <a className="button button-outline-light" href={mediaUrl(settings.cvUrl) ?? settings.cvUrl} rel="noreferrer" target="_blank">Download my CV <ArrowDownToLine size={15} /></a> : <p className="cv-note">CV available on request.</p>}
        </div>
      </section>
      <section className="craft-section">
        <div className="craft-intro"><p className="eyebrow">THE CRAFT</p><h2>A good cut has<br />its own <em>heartbeat.</em></h2><p>Intuition sets the direction. Craft makes every detail feel inevitable.</p></div>
        <div className="craft-list">
          <div><span>01</span><Focus size={19} /><strong>Find the story</strong><p>Look beyond the footage for the moment that makes it matter.</p></div>
          <div><span>02</span><Clapperboard size={19} /><strong>Shape the rhythm</strong><p>Build a pace that gives the picture room to speak.</p></div>
          <div><span>03</span><MoveRight size={19} /><strong>Finish with feeling</strong><p>Bring color, sound, and motion into one considered world.</p></div>
        </div>
      </section>
      <section className="skills-section">
        <div><p className="eyebrow">TOOLS OF THE TRADE</p><h2>Good tools.<br /><em>Better instincts.</em></h2></div>
        <div className="skills-list">{skills.map((skill, index) => <span key={skill}><i>{String(index + 1).padStart(2, "0")}</i>{skill}</span>)}</div>
      </section>
      <section className="about-bottom-cta"><p>Have a story that needs a careful eye?</p><Link className="text-link" href="/contact">Tell me about it <ArrowUpRight size={15} /></Link></section>
    </main>
  );
}
