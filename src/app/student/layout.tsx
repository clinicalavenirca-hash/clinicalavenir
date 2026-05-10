import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { StudentSidebar } from '@/components/student/StudentSidebar';
import { requireStudent } from '@/lib/db/session';

export const dynamic = 'force-dynamic';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireStudent();
  return (
    <DashboardShell variant="student" profile={profile} sidebar={<StudentSidebar profile={profile} />}>
      {children}
    </DashboardShell>
  );
}
