import { AdminSection } from "@/components/admin/AdminSection";

const allowedSections = ["projects", "categories", "testimonials", "services", "messages", "settings"];

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!allowedSections.includes(section)) {
    return <section className="notice notice-error">That admin section does not exist.</section>;
  }
  return <AdminSection section={section} />;
}
