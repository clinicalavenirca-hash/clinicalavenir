import { cache } from 'react';
import type { Student } from '@/lib/data';
import { supabaseServer } from '@/lib/supabase/server';

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: 'active' | 'inactive';
  joined_at: string;
  enrollments: { course: { slug: string } | null }[] | null;
};

function rowToStudent(r: Row): Student {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone ?? '',
    courses: (r.enrollments ?? []).map((e) => e.course?.slug).filter(Boolean) as string[],
    status: r.status,
    joinedAt: r.joined_at
  };
}

/** Returns every profile with role='student', joined with enrolled course slugs. */
export const fetchStudents = cache(async (): Promise<Student[]> => {
  const supa = supabaseServer();
  if (!supa) return [];
  const { data, error } = await supa
    .from('profiles')
    .select('id, name, email, phone, status, joined_at, enrollments(course:courses(slug))')
    .eq('role', 'student')
    .order('joined_at', { ascending: false });
  if (error) { console.error('[fetchStudents]', error.message); return []; }
  return (data as unknown as Row[]).map(rowToStudent);
});

export const fetchStudent = cache(async (id: string): Promise<Student | null> => {
  const supa = supabaseServer();
  if (!supa) return null;
  const { data, error } = await supa
    .from('profiles')
    .select('id, name, email, phone, status, joined_at, enrollments(course:courses(slug))')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return rowToStudent(data as unknown as Row);
});
