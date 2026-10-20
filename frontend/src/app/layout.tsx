import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Demsew Andarge — Video Editor & Motion Storyteller",
  description: "A private workspace for managing the Demsew Andarge portfolio.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
