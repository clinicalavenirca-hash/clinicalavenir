import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock } from 'lucide-react';
import { fetchStudent } from '@/lib/db/students';
import { fetchProfile } from '@/lib/db/profiles';
import { fetchAllCourses } from '@/lib/db/courses';
import { fetchLearningStatus } from '@/lib/db/progress';
import { fetchStudentJobApplications } from '@/lib/db/jobApplications';
import { cn, formatDate } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import {
  ResetPasswordCard,
  ToggleStudentStatusButton,
  DeleteStudentButton,
  StudentCourseRow,
  AddCourseControl
} from '@/components/admin/StudentDetailActions';

export const dynamic = 'force-dynamic';

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const student = await fetchStudent(params.id);
  if (!student) notFound();

  const [profile, courses, learning, jobApps] = await Promise.all([
    fetchProfile(student.id),
    fetchAllCourses(),
    fetchLearningStatus(student.id),
    fetchStudentJobApplications(student.id)
  ]);

  const enrolledCourses = courses.filter((c) => student.courses.includes(c.slug));
  const availableToAdd = courses.filter((c) => !student.courses.includes(c.slug));

  return (
    <>
      <div className="mb-4">
        <Link href="/admin/students" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700">
          <ArrowLeft className="w-4 h-4" /> Back to students
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-4 space-y-4">
          <div className="card card-pad text-center">
            <Avatar name={student.name} src={profile?.avatar ?? null} size="xl" className="mx-auto" ringClassName="ring-4 ring-white shadow-soft-lg" />
            <h3 className="mt-4 text-lg font-display font-bold">{student.name}</h3>
            <p className="text-sm text-ink-500 break-all">{student.email}</p>
            <p className="text-sm text-ink-500">{profile?.countryCode ?? ''} {profile?.phone ?? student.phone}</p>
            <div className="mt-4">
              {student.status === 'active'
                ? <span className="badge-success">Active account</span>
                : <span className="badge-ink">Inactive</span>}
            </div>
          </div>

          {profile && (profile.address || profile.city || profile.country) && (
            <div className="card card-pad">
              <p className="font-semibold text-ink-900">Contact &amp; address</p>
              <dl className="mt-3 space-y-2 text-sm">
                {profile.city && <div className="flex items-start justify-between gap-3"><dt className="text-ink-500">City</dt><dd className="text-ink-800 text-right">{profile.city}</dd></div>}
                {profile.country && <div className="flex items-start justify-between gap-3"><dt className="text-ink-500">Country</dt><dd className="text-ink-800 text-right">{profile.country}</dd></div>}
                {profile.address && <div className="flex items-start justify-between gap-3"><dt className="text-ink-500">Address</dt><dd className="text-ink-800 text-right">{profile.address}</dd></div>}
                <div className="flex items-start justify-between gap-3"><dt className="text-ink-500">Joined</dt><dd className="text-ink-800 text-right">{formatDate(profile.joinedAt, { month: 'long', day: 'numeric', year: 'numeric' })}</dd></div>
              </dl>
            </div>
          )}

          <div className="card card-pad">
            <p className="font-semibold text-ink-900">Course access</p>
            <div className="mt-3 space-y-2">
              {enrolledCourses.length > 0 ? enrolledCourses.map((c) => (
                <StudentCourseRow key={c.id} userId={student.id} courseId={c.id} courseTitle={c.title} />
              )) : (
                <p className="text-sm text-ink-500 italic">Not enrolled in any courses yet.</p>
              )}
            </div>
            <AddCourseControl userId={student.id} available={availableToAdd.map((c) => ({ id: c.id, title: c.title }))} />
          </div>

          <div className="card card-pad border-rose-100 bg-rose-50/40">
            <p className="font-semibold text-rose-900">Danger zone</p>
            <div className="mt-3 space-y-2">
              <ToggleStudentStatusButton id={student.id} current={student.status} />
              <DeleteStudentButton id={student.id} name={student.name} />
            </div>
          </div>
        </aside>

        <div className="lg:col-span-8 space-y-5">
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
              <h3 className="font-display font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4 text-brand-600" /> Learning status</h3>
              <span className="text-xs text-ink-500">{learning.length} enrolled</span>
            </div>
            {learning.length === 0 ? (
              <div className="p-8 text-center text-sm text-ink-500">No courses started yet.</div>
            ) : (
              <ul className="divide-y divide-ink-100">
                {learning.map((s) => (
                  <li key={s.courseId} className="p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <p className="font-semibold text-ink-900">{s.courseTitle}</p>
                        <p className="text-xs text-ink-500 mt-0.5">{s.modulesCompleted} / {s.modulesTotal} modules · {s.videosWatched} / {s.videosTotal} lessons</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {s.lastWatchedAt && <span className="text-xs text-ink-500 inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Last watched {formatDate(s.lastWatchedAt)}</span>}
                        <span className={cn('badge text-[11px]', s.percent >= 100 ? 'badge-success' : s.percent >= 50 ? 'badge-brand' : 'badge-ink')}>{s.percent}%</span>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all" style={{ width: `${s.percent}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <ResetPasswordCard id={student.id} />

          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-ink-100">
              <h3 className="font-display font-semibold">Job application history</h3>
            </div>
            {jobApps.length ? (
              <div className="overflow-x-auto scroll-thin">
                <table className="table">
                  <thead><tr><th>Role</th><th>Applied</th><th>Status</th><th>Resume</th></tr></thead>
                  <tbody>
                    {jobApps.map((a) => {
                      const tone = ({ applied: 'badge-ink', interview: 'badge-brand', offer: 'badge-success', rejected: 'badge-danger' } as const)[a.status];
                      return (
                        <tr key={a.id}>
                          <td className="font-semibold text-ink-900 text-sm">Job {a.jobId.slice(0, 8)}</td>
                          <td className="text-sm text-ink-600">{formatDate(a.appliedAt)}</td>
                          <td><span className={cn(tone, 'capitalize')}>{a.status}</span></td>
                          <td className="text-sm text-brand-700 font-medium">{a.resumeSnapshotName}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-ink-500">No applications yet.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
