import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { requireAdmin } from '@/lib/db/session';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();
  return (
    <DashboardShell variant="admin" profile={profile} sidebar={<AdminSidebar profile={profile} />}>
      {children}
    </DashboardShell>
  );
}
