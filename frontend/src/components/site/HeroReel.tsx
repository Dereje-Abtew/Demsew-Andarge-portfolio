"use client";

import { ArrowDown, ArrowUpRight, Play, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { isMp4, mediaUrl, videoEmbedUrl } from "@/lib/portfolio";
import type { Project, SiteSettings } from "@/lib/portfolio";

export function HeroReel({ settings, featured }: { settings: SiteSettings; featured: Project[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [playing, setPlaying] = useState(false);
  const poster = mediaUrl(featured[0]?.thumbnailUrl ?? settings.profilePhotoUrl);
  const mp4 = settings.showreelUrl && isMp4(settings.showreelUrl) ? settings.showreelUrl : null;
  const embed = settings.showreelUrl ? videoEmbedUrl(settings.showreelUrl) : null;

  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-backdrop">
        {poster ? <Image alt="" className="hero-poster" fill priority sizes="100vw" src={poster} /> : null}
        {mp4 ? <video autoPlay className="hero-video" loop muted playsInline poster={poster ?? undefined} src={mp4} /> : null}
        <div className="hero-shade" />
        <div className="hero-rings" aria-hidden="true" />
      </div>
      <div className="hero-content">
        <p className="hero-kicker"><span /> INDEPENDENT VIDEO EDITOR & MOTION DESIGNER</p>
        <h1 id="hero-title">{settings.heroTitle}<span className="hero-period">.</span></h1>
        <p className="hero-subtitle">{settings.heroSubtitle}</p>
        <p className="hero-description">I turn raw moments into considered films — shaped with feeling, rhythm, and a little bit of wonder.</p>
        <div className="hero-actions">
          <button className="button button-light" onClick={() => { setPlaying(true); dialog.current?.showModal(); }} type="button">
            <Play fill="currentColor" size={14} /> Watch the reel
          </button>
          <Link className="button button-outline-light" href="/contact">Start a project <ArrowUpRight size={15} /></Link>
        </div>
      </div>
      <div className="hero-bottom">
        <span>{settings.location.toUpperCase()}</span>
        <a href="#selected-work"><ArrowDown size={15} /> SCROLL TO EXPLORE</a>
        <span>AVAILABLE FOR SELECT PROJECTS</span>
      </div>
      <dialog
        aria-label="Showreel video"
        className="reel-dialog"
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close();
        }}
        onClose={() => {
          setPlaying(false);
          const video = dialog.current?.querySelector("video");
          if (video) video.pause();
        }}
        ref={dialog}
      >
        <div className="reel-dialog-inner">
          <button aria-label="Close showreel" className="reel-close" onClick={() => dialog.current?.close()} type="button"><X size={20} /></button>
          {playing && mp4 ? <video autoPlay controls playsInline poster={poster ?? undefined} src={mp4} /> : playing && embed ? (
            <iframe allow="autoplay; fullscreen; picture-in-picture" allowFullScreen src={embed} title="Demsew Andarge showreel" />
          ) : playing ? (
            <div className="reel-empty"><Play fill="currentColor" size={25} /><p>Add a showreel URL in Studio settings to feature your film here.</p></div>
          ) : null}
        </div>
      </dialog>
    </section>
  );
}
