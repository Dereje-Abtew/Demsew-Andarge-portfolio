import { ArrowUpRight, Aperture } from "lucide-react";
import Link from "next/link";
import { socialLinks } from "@/lib/portfolio";
import { getSettings } from "@/lib/portfolio-data";

export async function SiteFooter() {
  const settings = await getSettings();
  const links = socialLinks(settings);
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Link className="site-brand footer-brand" href="/">
            <span className="site-brand-mark"><Aperture size={17} /></span>
            <span>DEMSEW <i>ANDARGE</i></span>
          </Link>
          <p className="footer-caption">Thoughtful edits. Stories that stay.</p>
        </div>
        <div className="footer-contact">
          <span className="eyebrow">HAVE A STORY TO TELL?</span>
          <Link href="/contact">Let&apos;s make something matter <ArrowUpRight size={16} /></Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 DEMSEW ANDARGE</span>
        <div className="footer-socials">
          {links.map((link) => <a href={link.href} key={link.name} rel="noreferrer" target="_blank">{link.name}</a>)}
          <Link href="/privacy">Privacy</Link>
          <Link href="/admin/login">Studio login</Link>
        </div>
        <span>{settings.location}</span>
      </div>
    </footer>
  );
}
