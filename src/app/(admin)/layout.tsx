import { requireAdmin } from "@/lib/auth";
import { logout } from "@/app/login/actions";
import { AdminShell } from "@/components/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <AdminShell adminName={admin.name} logoutAction={logout}>
      {children}
    </AdminShell>
  );
}
