"use client";

import { Aperture, ArrowUpRight, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your email and password.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setError(result?.title ?? "Sign in failed. Please try again.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Could not reach the sign-in service. Check that the API is running.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-art">
        <div className="login-art-grain" />
        <div className="login-top-mark"><Aperture size={19} /> DEMSEW ANDARGE</div>
        <div className="login-editorial">
          <p className="eyebrow">PRIVATE WORKSPACE · 01</p>
          <h1>Your work,<br />in <em>motion.</em></h1>
          <p>One considered space to curate the stories, projects, and people that define your work.</p>
        </div>
        <div className="login-art-footer"><span>VIDEO EDITOR & MOTION STORYTELLER</span><span>ADDIS ABABA · ETHIOPIA</span></div>
      </div>

      <section className="login-panel">
        <div className="login-panel-brand"><span className="brand-icon"><Aperture size={17} /></span><span>DEMSEW<span className="brand-sub">STUDIO / ADMIN</span></span></div>
        <div className="login-card">
          <p className="eyebrow">WELCOME BACK</p>
          <h2>Sign in to your studio</h2>
          <p className="login-intro">Use your administrator credentials to continue.</p>
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label className="field-label" htmlFor="email">Email address</label>
            <input
              id="email"
              className="text-input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
            <div className="password-label"><label className="field-label" htmlFor="password">Password</label></div>
            <input
              id="password"
              className="text-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
            {error && <div className="notice notice-error" role="alert">{error}</div>}
            <button className="button button-primary login-submit" type="submit" disabled={busy}>
              {busy ? <><span className="loader loader-small" /> Verifying…</> : <>Enter workspace <ArrowUpRight size={16} /></>}
            </button>
          </form>
          <p className="secure-note"><LockKeyhole size={14} /> Secure, private administrator access</p>
        </div>
        <p className="login-copyright">© DEMSEW ANDARGE · ALL RIGHTS RESERVED</p>
      </section>
    </main>
  );
}
