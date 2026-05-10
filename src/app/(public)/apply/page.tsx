import { Reveal } from '@/components/ui/Reveal';
import { ApplyForm } from '@/components/public/ApplyForm';
import { CoursesRealtime } from '@/components/realtime/CoursesRealtime';
import { fetchCourses } from '@/lib/db/courses';
import { fetchEnrolledCourseSlugs } from '@/lib/db/progress';
import { getCurrentProfile } from '@/lib/db/session';

export const dynamic = 'force-dynamic';

export default async function ApplyPage({ searchParams }: { searchParams: { course?: string } }) {
  const preselected = searchParams.course || '';
  // Fetch courses + the signed-in student profile (if any) in parallel.
  const [courses, profile] = await Promise.all([fetchCourses(), getCurrentProfile()]);
  // For signed-in students, find which courses they're already enrolled in so
  // we can grey those out in the picker — no point letting someone re-apply
  // for a course they already own.
  const enrolledSlugs =
    profile && profile.role === 'student' ? await fetchEnrolledCourseSlugs(profile.id) : [];

  // Only pre-fill for students; admins shouldn't be applying for courses.
  const initialProfile =
    profile && profile.role === 'student'
      ? {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          countryCode: profile.countryCode ?? '+1',
          country: profile.country ?? '',
          city: profile.city ?? '',
          address: profile.address ?? ''
        }
      : null;

  return (
    <>
      <CoursesRealtime />
      <section className="hero-gradient">
        <div className="container-app py-12 sm:py-16">
          <div className="max-w-2xl">
            <Reveal><span className="eyebrow">Apply</span></Reveal>
            <Reveal delay={0.04}>
              <h1 className="mt-3">
                {initialProfile ? 'Pick another program.' : 'Tell us about yourself.'}
              </h1>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-3 text-ink-600 text-lg">
                {initialProfile
                  ? `We've kept your details from your account, ${initialProfile.name.split(' ')[0]}. Choose any number of programs and admin will reach out within 24 hours with payment options.`
                  : "Add the courses you'd like to enrol in, share your details, and we'll reach out within 24 hours with payment options. No payment is collected on this site."}
              </p>
            </Reveal>
          </div>
        </div>
      </section>
      <section className="py-12 sm:py-16">
        <div className="container-app">
          <ApplyForm
            preselected={preselected}
            catalog={courses.map((c) => ({ slug: c.slug, title: c.title, duration: c.duration, timings: c.timings }))}
            initialProfile={initialProfile}
            enrolledSlugs={enrolledSlugs}
          />
        </div>
      </section>
    </>
  );
}
