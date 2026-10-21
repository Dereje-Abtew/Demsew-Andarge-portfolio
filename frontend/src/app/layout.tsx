import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:6230"),
  title: {
    default: "Demsew Andarge — Video Editor & Motion Storyteller",
    template: "%s · Demsew Andarge",
  },
  description: "Cinematic video editing, motion design, and stories made to stay with you.",
  openGraph: {
    title: "Demsew Andarge — Video Editor & Motion Storyteller",
    description: "Cinematic video editing, motion design, and stories made to stay with you.",
    type: "website",
    locale: "en_ET",
    siteName: "Demsew Andarge",
  },
  twitter: {
    card: "summary_large_image",
    title: "Demsew Andarge — Video Editor & Motion Storyteller",
    description: "Cinematic video editing, motion design, and stories made to stay with you.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
