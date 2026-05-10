import { fetchProfile } from '@/lib/db/profiles';
import { requireStudent } from '@/lib/db/session';
import { ProfileForms } from '@/components/student/ProfileForms';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const me = await requireStudent();
  const profile = await fetchProfile(me.id);
  if (!profile) notFound();

  return (
    <>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <span className="eyebrow">Account</span>
          <h1 className="mt-2 text-2xl sm:text-3xl">Profile</h1>
          <p className="mt-1 text-ink-600">
            These details came from your application — review them, update anything that&apos;s changed, and add a profile photo if you&apos;d like.
          </p>
        </div>
      </div>
      <ProfileForms profile={profile} />
    </>
  );
}
