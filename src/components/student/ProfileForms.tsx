'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import type { Profile } from '@/lib/data';
import { countries } from '@/lib/countries';
import { uploadImage } from '@/lib/supabase/storage';
import { toast } from '@/components/ui/Toast';
import { Avatar } from '@/components/ui/Avatar';
import { Reveal } from '@/components/ui/Reveal';
import { updateMyProfile, updateMyAvatar } from '@/app/actions/profile';
import { supabaseBrowser } from '@/lib/supabase/client';

export function ProfileForms({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [avatar, setAvatar] = useState<string | null>(profile.avatar);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [countryCode, setCountryCode] = useState(profile.countryCode ?? '+1');
  const [country, setCountry] = useState(profile.country ?? '');
  const [city, setCity] = useState(profile.city ?? '');
  const [address, setAddress] = useState(profile.address ?? '');

  async function onAvatar(file: File | null | undefined) {
    if (!file) return;
    setBusy(true);
    const res = await uploadImage('student-avatars', file, { folder: profile.id });
    if (!res.ok) { setBusy(false); toast(res.error, 'error'); return; }
    setAvatar(res.url);
    const persist = await updateMyAvatar(res.url);
    setBusy(false);
    if (persist?.error) { toast(persist.error, 'error'); return; }
    toast('Profile photo updated.', 'success');
    router.refresh();
  }

  async function removeAvatar() {
    setAvatar(null);
    const res = await updateMyAvatar(null);
    if (res?.error) { toast(res.error, 'error'); return; }
    toast('Profile photo removed.', 'info');
    router.refresh();
  }

  function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateMyProfile({ name, phone, countryCode, country, city, address });
      if (res?.error) { toast(res.error, 'error'); return; }
      toast('Profile saved.', 'success');
      router.refresh();
    });
  }

  function changePassword(e: React.FormEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const np = String(fd.get('np') || '');
    const np2 = String(fd.get('np2') || '');
    if (np.length < 8 || np !== np2) { toast('Passwords must match and be at least 8 characters.', 'warning'); return; }
    startTransition(async () => {
      const supa = supabaseBrowser();
      if (!supa) { toast('Supabase not configured.', 'error'); return; }
      const { error } = await supa.auth.updateUser({ password: np });
      if (error) { toast(error.message, 'error'); return; }
      form.reset();
      toast('Password updated.', 'success');
    });
  }

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <aside className="lg:col-span-4 space-y-4">
        <Reveal as="div">
          <div className="card card-pad text-center">
            <div className="relative w-24 h-24 mx-auto">
              <Avatar name={profile.name} src={avatar} size="xl" ringClassName="ring-4 ring-white shadow-soft-lg" />
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-600 text-white grid place-items-center hover:bg-brand-700 shadow-soft-md cursor-pointer" aria-label="Change photo">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={busy} onChange={(e) => onAvatar(e.target.files?.[0])} />
              </label>
            </div>
            <h3 className="mt-4 text-lg font-display font-bold">{profile.name}</h3>
            <p className="text-sm text-ink-500 break-all">{profile.email}</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              {avatar ? (
                <button onClick={removeAvatar} className="btn-ghost btn-sm text-rose-600 hover:bg-rose-50">
                  <Trash2 className="w-3.5 h-3.5" /> Remove photo
                </button>
              ) : (
                <p className="text-xs text-ink-500">Adding a photo is optional.</p>
              )}
            </div>
          </div>
        </Reveal>
        <Reveal as="div" delay={0.05}>
          <div className="card card-pad">
            <p className="font-semibold text-ink-900">Member since</p>
            <p className="mt-1 text-sm text-ink-600">{new Date(profile.joinedAt).toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })}</p>
          </div>
        </Reveal>
      </aside>

      <div className="lg:col-span-8 space-y-5">
        <form onSubmit={saveDetails} className="card card-pad space-y-5">
          <h3 className="text-lg font-display font-semibold">Personal details</h3>
          <p className="text-sm text-ink-500 -mt-2">Pulled from your application — feel free to update anything that&apos;s changed.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="label">Full name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" defaultValue={profile.email} disabled />
              <p className="helper">Email is set by admin and cannot be changed here.</p>
            </div>
            <div>
              <label className="label">Phone</label>
              <div className="flex gap-2">
                <select className="input !w-auto !max-w-[110px]" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                  {countries.map((c) => <option key={c.name} value={c.code}>{c.flag} {c.code}</option>)}
                </select>
                <input className="input flex-1" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div><label className="label">City</label><input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Toronto" /></div>
            <div>
              <label className="label">Country</label>
              <select className="input" value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="">Select country…</option>
                {countries.map((c) => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2"><label className="label">Address</label><input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, unit, postal code" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-ink-100">
            <button type="reset" className="btn-secondary btn-md">Cancel</button>
            <button type="submit" disabled={pending} className="btn-primary btn-md">
              {pending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save changes
            </button>
          </div>
        </form>

        <form onSubmit={changePassword} className="card card-pad space-y-5">
          <h3 className="text-lg font-display font-semibold">Change password</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">New password</label><input name="np" className="input" type="password" /></div>
            <div><label className="label">Confirm new password</label><input name="np2" className="input" type="password" /></div>
          </div>
          <div className="flex justify-end pt-3 border-t border-ink-100">
            <button type="submit" disabled={pending} className="btn-primary btn-md">
              {pending && <Loader2 className="w-4 h-4 animate-spin" />}
              Update password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
