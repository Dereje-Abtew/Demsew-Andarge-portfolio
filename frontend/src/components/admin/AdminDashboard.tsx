"use client";

import { ArrowUpRight, BriefcaseBusiness, FolderKanban, MessageSquareText, Quote, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { adminFetch, errorMessage } from "@/lib/admin-api";

type Message = {
  id: number;
  name: string;
  email: string;
  subject: string;
  createdAtUtc: string;
  isRead: boolean;
};

type Dashboard = {
  projects: number;
  messages: number;
  unreadMessages: number;
  categories: number;
  testimonials: number;
  services: number;
  latestMessages: Message[];
};

const metrics = [
  { key: "projects", title: "Projects", icon: FolderKanban, href: "/admin/projects", accent: "amber" },
  { key: "messages", title: "Messages", icon: MessageSquareText, href: "/admin/messages", accent: "blue" },
  { key: "categories", title: "Categories", icon: BriefcaseBusiness, href: "/admin/categories", accent: "violet" },
  { key: "testimonials", title: "Testimonials", icon: Quote, href: "/admin/testimonials", accent: "green" },
  { key: "services", title: "Services", icon: Sparkles, href: "/admin/services", accent: "rose" },
] as const;

export function AdminDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    adminFetch<Dashboard>("dashboard").then(setData).catch((reason: unknown) => setError(errorMessage(reason)));
  }, []);

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR PORTFOLIO OVERVIEW</p>
          <h1>Good to see you, Demsew<span className="accent-dot">.</span></h1>
          <p className="page-description">A quick look at what’s happening with your portfolio.</p>
        </div>
        <Link className="button button-primary" href="/admin/projects">Manage projects <ArrowUpRight size={16} /></Link>
      </div>

      {error && <div className="notice notice-error" role="alert">{error}</div>}
      <section className="metric-grid" aria-label="Portfolio summary">
        {metrics.map(({ key, title, icon: Icon, href, accent }, index) => (
          <Link className={`metric-card metric-${accent}`} href={href} key={key}>
            <div className="metric-top"><span>{title}</span><Icon size={18} /></div>
            <strong>{data?.[key] ?? "—"}</strong>
            <small>{key === "messages" && data ? `${data.unreadMessages} unread` : "Manage content"} <ArrowUpRight size={13} /></small>
            <span className="metric-index">0{index + 1}</span>
          </Link>
        ))}
      </section>

      <section className="panel recent-panel">
        <div className="panel-heading">
          <div><p className="eyebrow">YOUR INBOX</p><h2>Recent messages</h2></div>
          <Link className="text-link" href="/admin/messages">Open inbox <ArrowUpRight size={15} /></Link>
        </div>
        <div className="message-list">
          {(data?.latestMessages ?? []).map((message) => (
            <Link className="message-row" key={message.id} href="/admin/messages">
              <span className={`message-indicator ${message.isRead ? "" : "unread"}`} />
              <span className="message-avatar">{message.name.trim().slice(0, 1).toUpperCase()}</span>
              <span className="message-main"><strong>{message.name}</strong><small>{message.subject}</small></span>
              <span className="message-email">{message.email}</span>
              <time>{new Date(message.createdAtUtc).toLocaleDateString()}</time>
              <ArrowUpRight size={15} />
            </Link>
          ))}
          {data && data.latestMessages.length === 0 && <p className="empty-state">Your inbox is quiet. New inquiries will appear here.</p>}
          {!data && !error && <p className="empty-state">Loading recent messages…</p>}
        </div>
      </section>
      <div className="dashboard-footnote"><span className="status-dot" /> All systems operational <span>·</span> Changes are saved to your portfolio API</div>
    </>
  );
}
