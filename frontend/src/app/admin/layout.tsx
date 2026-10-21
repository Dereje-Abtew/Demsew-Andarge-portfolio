import { AdminShell } from "@/components/admin/AdminShell";
import { Suspense } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<main className="admin-loading"><span className="loader" /><p>Opening studio workspace…</p></main>}>
    <AdminShell>{children}</AdminShell>
  </Suspense>;
}
