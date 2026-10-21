"use client";

import { ArrowUpRight, Check, Send } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(120, "Name is too long."),
  email: z.string().trim().email("Enter a valid email address.").max(256, "Email is too long."),
  phone: z.string().trim().max(40, "Phone number is too long."),
  subject: z.string().trim().min(1, "Add a subject.").max(180, "Subject is too long."),
  message: z.string().trim().min(1, "Tell me a little about your project.").max(5000, "Message is too long."),
});

export function ContactForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSent(false);
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please review the form.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!response.ok) {
        const result: unknown = await response.json().catch(() => null);
        const problem = z.object({ title: z.string().optional(), detail: z.string().optional() }).safeParse(result);
        setError(problem.success ? problem.data.detail || problem.data.title || "Your message could not be sent. Please try again." : "Your message could not be sent. Please try again.");
        return;
      }
      form.reset();
      setSent(true);
    } catch {
      setError("Could not reach the message service. Please try again later.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="contact-form" noValidate onSubmit={submit}>
      {sent ? <div className="contact-success" role="status"><Check size={18} /><span>Your note is on its way. Thank you — I&apos;ll be in touch soon.</span></div> : null}
      {error ? <div className="notice notice-error" role="alert">{error}</div> : null}
      <div className="contact-form-grid">
        <label className="form-field"><span>Your name <i>*</i></span><input autoComplete="name" name="name" required placeholder="How should I address you?" /></label>
        <label className="form-field"><span>Email address <i>*</i></span><input autoComplete="email" name="email" required type="email" placeholder="you@example.com" /></label>
        <label className="form-field"><span>Phone / WhatsApp</span><input autoComplete="tel" name="phone" type="tel" placeholder="Optional" /></label>
        <label className="form-field"><span>What are we making? <i>*</i></span><input name="subject" required placeholder="Campaign, music video, event…" /></label>
        <label className="form-field field-wide"><span>A little about the project <i>*</i></span><textarea name="message" required rows={5} placeholder="The idea, timeline, deliverables — anything that helps me understand the story." /></label>
      </div>
      <button className="button button-primary contact-submit" disabled={busy} type="submit">
        {busy ? <><span className="loader loader-small" /> Sending…</> : <>Send your inquiry <Send size={14} /> <ArrowUpRight size={14} /> </>}
      </button>
      <p className="form-privacy">Your details are only used to reply to this inquiry.</p>
    </form>
  );
}
