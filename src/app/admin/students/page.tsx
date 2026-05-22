import { fetchStudents } from '@/lib/db/students';
import { fetchAllCourses } from '@/lib/db/courses';
import { supabaseServer } from '@/lib/supabase/server';
import { StudentsTable } from '@/components/admin/StudentsTable';
import { CreateStudentModal } from '@/components/admin/CreateStudentModal';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [students, courses] = await Promise.all([fetchStudents(), fetchAllCourses()]);
  // Pull avatars in one extra query so the table can show them
  const supa = supabaseServer();
  let avatarById = new Map<string, string | null>();
  if (supa && students.length > 0) {
    const { data } = await supa.from('profiles').select('id, avatar').in('id', students.map((s) => s.id));
    if (data) avatarById = new Map(data.map((d) => [d.id as string, (d.avatar ?? null) as string | null]));
  }
  const enriched = students.map((s) => ({ ...s, avatar: avatarById.get(s.id) ?? null }));

  return (
    <>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <span className="eyebrow">People</span>
          <h1 className="mt-2 text-2xl sm:text-3xl">Students</h1>
          <p className="mt-1 text-ink-600">
            Manage accounts, course access, and login state. Create new students from the
            Applications inbox, or add one directly with the button on the right.
          </p>
        </div>
        <CreateStudentModal courses={courses.map((c) => ({ slug: c.slug, title: c.title }))} />
      </div>
      <StudentsTable students={enriched} courses={courses} />
    </>
  );
}
