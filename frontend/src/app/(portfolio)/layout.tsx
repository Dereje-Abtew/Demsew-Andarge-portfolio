import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
