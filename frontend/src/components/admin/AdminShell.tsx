"use client";

import {
  Aperture,
  BriefcaseBusiness,
  ChevronDown,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Quote,
  Settings2,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-api";

const navigation = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Categories", href: "/admin/categories", icon: BriefcaseBusiness },
  { label: "Testimonials", href: "/admin/testimonials", icon: Quote },
  { label: "Services", href: "/admin/services", icon: Sparkles },
  { label: "Messages", href: "/admin/messages", icon: MessageSquareText },
  { label: "Site settings", href: "/admin/settings", icon: Settings2 },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      await adminFetch("dashboard");
      setAuthorized(true);
    } catch {
      router.replace("/admin/login");
    }
  }, [router]);

  useEffect(() => {
    if (pathname === "/admin/login") {
      return;
    }
    const onUnauthorized = () => {
      setAuthorized(false);
      router.replace("/admin/login");
    };
    window.addEventListener("admin:unauthorized", onUnauthorized);
    const timer = window.setTimeout(() => { void checkSession(); }, 0);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("admin:unauthorized", onUnauthorized);
    };
  }, [checkSession, pathname, router]);

  async function logout() {
    setSigningOut(true);
    await fetch("/api/admin/auth/logout", { method: "POST" });
    setAuthorized(false);
    router.replace("/admin/login");
    router.refresh();
  }

  if (pathname === "/admin/login") return children;
  if (!authorized) {
    return (
      <main className="admin-loading" aria-live="polite">
        <span className="loader" />
        <p>Verifying your session…</p>
      </main>
    );
  }

  return (
    <div className="admin-frame">
      <aside className="admin-sidebar">
        <Link className="brand-mark" href="/admin" aria-label="Demsew Andarge, admin home">
          <span className="brand-icon"><Aperture size={17} /></span>
          <span>DEMSEW<span className="brand-sub">STUDIO / ADMIN</span></span>
        </Link>

        <div className="sidebar-label">WORKSPACE</div>
        <nav className="admin-nav" aria-label="Admin navigation">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`admin-nav-link ${active ? "active" : ""}`}>
                <Icon size={17} strokeWidth={1.8} />
                <span>{label}</span>
                {label === "Messages" && <span className="nav-pip" aria-label="Inbox" />}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <span className="avatar">DA</span>
            <span><strong>Demsew Andarge</strong><small>Administrator</small></span>
            <ChevronDown size={15} />
          </div>
          <button className="logout-link" onClick={logout} disabled={signingOut}>
            <LogOut size={16} /> {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <span className="topbar-path">PORTFOLIO MANAGEMENT <span>/</span> {pathname.split("/").at(-1)?.replaceAll("-", " ").toUpperCase() || "OVERVIEW"}</span>
          <Link className="view-site-link" href="/" target="_blank" rel="noreferrer">View website <span aria-hidden="true">↗</span></Link>
        </header>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="admin-content"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
