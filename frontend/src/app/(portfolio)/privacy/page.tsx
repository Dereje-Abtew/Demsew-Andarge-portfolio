import type { Metadata } from "next";
import { getSettings } from "@/lib/portfolio-data";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How information sent through this portfolio is handled.",
};

export default async function PrivacyPage() {
  const settings = await getSettings();
  return (
    <main className="interior-page privacy-page" id="main-content">
      <section className="interior-hero">
        <p className="eyebrow">THE SMALL PRINT</p><h1>Your privacy<br /><em>matters.</em></h1>
        <p className="interior-intro">A simple explanation of what happens when you reach out through this site.</p>
      </section>
      <article className="privacy-copy">
        <p className="eyebrow">LAST UPDATED · OCTOBER 2026</p>
        <h2>Information you share</h2>
        <p>When you submit the contact form, the name, email address, optional phone number, subject, and message you provide are sent to the portfolio API and stored so the inquiry can be reviewed and answered. If email notifications are configured, the inquiry may also be forwarded to the portfolio owner.</p>
        <h2>How it is used</h2>
        <p>Your information is used only to respond to your request and discuss the project you contacted me about. It is not sold or used for advertising.</p>
        <h2>Retention and requests</h2>
        <p>Messages are retained in the site&apos;s admin inbox until deleted. To ask a question about your information or request its removal, email <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>.</p>
        <h2>Third-party services</h2>
        <p>When you choose to play an embedded film or follow an external social link, the video or social platform may process data according to its own privacy policy. The site does not load a video iframe until you choose to play it.</p>
        <p className="privacy-note">This page is a practical starting point; have it reviewed for the laws and services that apply to your final deployment.</p>
      </article>
    </main>
  );
}
