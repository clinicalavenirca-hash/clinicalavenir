'use client';
import { supabaseBrowser } from './client';

/**
 * Storage bucket names. Keep this list in sync with supabase/schema.sql.
 *  - course-covers     : public, admin uploads
 *  - instructor-photos : public, admin uploads
 *  - story-avatars     : public, admin uploads
 *  - student-avatars   : public, students upload their own avatar
 */
export type Bucket =
  | 'course-covers'
  | 'instructor-photos'
  | 'story-avatars'
  | 'student-avatars';

export type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string };

/**
 * Uploads a file to a Supabase Storage bucket and returns its public URL.
 * Returns an error result when Supabase is not configured or the upload fails.
 */
export async function uploadImage(
  bucket: Bucket,
  file: File,
  opts: { folder?: string } = {}
): Promise<UploadResult> {
  const supabase = supabaseBrowser();
  if (!supabase) return { ok: false, error: 'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL.' };

  if (!file.type.startsWith('image/')) {
    return { ok: false, error: 'Only image files are accepted.' };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: 'Image must be smaller than 5 MB.' };
  }

  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  const path = `${opts.folder ? opts.folder.replace(/^\/+|\/+$/g, '') + '/' : ''}${id}.${ext}`;

  const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false
  });
  if (upErr) return { ok: false, error: upErr.message };

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { ok: true, url: data.publicUrl, path };
}

export async function removeImage(bucket: Bucket, path: string): Promise<boolean> {
  const supabase = supabaseBrowser();
  if (!supabase) return false;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return !error;
}
