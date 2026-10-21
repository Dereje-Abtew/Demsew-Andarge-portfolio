"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { isMp4, mediaUrl, videoEmbedUrl } from "@/lib/portfolio";

export function VideoEmbed({ src, poster, title, compact = false }: {
  src: string;
  poster?: string | null;
  title: string;
  compact?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const image = mediaUrl(poster);
  const mp4 = isMp4(src);
  const embed = videoEmbedUrl(src);
  return (
    <div className={`video-embed${compact ? " video-embed-compact" : ""}`}>
      {playing && mp4 ? (
        <video autoPlay className="video-player" controls playsInline poster={image ?? undefined} src={src} />
      ) : playing && embed ? (
        <iframe
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="video-player"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          src={embed}
          title={title}
        />
      ) : (
        <button
          aria-label={`Play ${title}`}
          className="video-poster"
          onClick={() => setPlaying(true)}
          type="button"
        >
          {image ? <Image alt="" className="poster-image" fill priority={!compact} sizes={compact ? "(max-width: 760px) 90vw, 40vw" : "100vw"} src={image} /> : null}
          <span aria-hidden="true" className="poster-shape poster-shape-one" />
          <span aria-hidden="true" className="poster-shape poster-shape-two" />
          <span className="video-play"><Play fill="currentColor" size={18} /></span>
          <span className="poster-caption">PLAY FILM <span>↗</span></span>
        </button>
      )}
    </div>
  );
}
