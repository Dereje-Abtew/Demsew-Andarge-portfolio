import Link from "next/link";
import { ArrowLeft, Aperture } from "lucide-react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="not-found-page" id="main-content">
        <span className="brand-icon"><Aperture size={20} /></span>
        <p className="eyebrow">OUT OF FRAME / 404</p>
        <h1>This story<br /><em>isn&apos;t here.</em></h1>
        <p>The page you&apos;re looking for may have moved or never made the final cut.</p>
        <Link className="button button-outline-light" href="/"><ArrowLeft size={15} /> Back to the beginning</Link>
      </main>
      <SiteFooter />
    </>
  );
}
