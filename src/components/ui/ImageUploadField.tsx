'use client';
import { useRef, useState } from 'react';
import { ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
import { uploadImage, type Bucket } from '@/lib/supabase/storage';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

type Props = {
  bucket: Bucket;
  folder?: string;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  label?: string;
  hint?: string;
  aspect?: 'square' | 'video' | 'cover';
  className?: string;
};

const ASPECT = {
  square: 'aspect-square',
  video: 'aspect-video',
  cover: 'aspect-[16/10]'
} as const;

/**
 * Drop-in image upload control. Renders a preview when `value` is set, otherwise
 * a click-to-upload zone. Uploads to the named Supabase Storage bucket and
 * returns the public URL via onChange. Falls back to a friendly toast when
 * Supabase is not configured.
 */
export function ImageUploadField({ bucket, folder, value, onChange, label, hint, aspect = 'cover', className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | null | undefined) {
    if (!file) return;
    setBusy(true);
    const res = await uploadImage(bucket, file, { folder });
    setBusy(false);
    if (!res.ok) {
      toast(res.error, 'error');
      return;
    }
    onChange(res.url);
    toast('Image uploaded.', 'success');
  }

  return (
    <div className={cn('w-full', className)}>
      {label && <label className="label">{label}</label>}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value ? (
        <div className={cn('relative rounded-xl overflow-hidden ring-1 ring-ink-100 group', ASPECT[aspect])}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/0 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="btn-secondary btn-sm !bg-white/95"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="btn-ghost btn-sm !text-rose-200 hover:!bg-white/10"
            >
              <Trash2 className="w-4 h-4" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={cn(
            'w-full rounded-xl border-2 border-dashed border-ink-200 grid place-items-center text-center px-6 py-8 cursor-pointer transition-colors hover:border-brand-400 hover:bg-brand-50/30 disabled:cursor-not-allowed',
            ASPECT[aspect]
          )}
        >
          <div>
            {busy ? (
              <Loader2 className="w-10 h-10 mx-auto text-brand-500 animate-spin" />
            ) : (
              <ImageIcon className="w-10 h-10 mx-auto text-ink-300" strokeWidth={1.5} />
            )}
            <p className="mt-3 text-sm font-semibold text-ink-900">{busy ? 'Uploading…' : 'Click to upload an image'}</p>
            <p className="text-xs text-ink-500 mt-1">PNG, JPG, or WebP · up to 5 MB</p>
          </div>
        </button>
      )}
      {hint && <p className="helper">{hint}</p>}
    </div>
  );
}
