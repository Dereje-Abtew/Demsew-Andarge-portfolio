"use client";

import { Aperture, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/work", label: "Selected work" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <Link className="site-brand" href="/" aria-label="Demsew Andarge home" onClick={() => setOpen(false)}>
        <span className="site-brand-mark"><Aperture size={18} strokeWidth={1.6} /></span>
        <span>DEMSEW <i>ANDARGE</i></span>
      </Link>
      <button
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        className="site-menu-toggle"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      <nav aria-label="Main navigation" className={`site-nav${open ? " site-nav-open" : ""}`}>
        {links.map((link) => (
          <Link
            aria-current={pathname === link.href || pathname.startsWith(`${link.href}/`) ? "page" : undefined}
            className="site-nav-link"
            href={link.href}
            key={link.href}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link className="site-nav-cta" href="/contact" onClick={() => setOpen(false)}>Let&apos;s talk <span aria-hidden="true">↗</span></Link>
      </nav>
    </header>
  );
}
