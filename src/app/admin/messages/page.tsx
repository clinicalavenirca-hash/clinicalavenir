import { Mail } from 'lucide-react';
import { supabaseServer } from '@/lib/supabase/server';
import { MessagesInbox, type ContactMessage } from '@/components/admin/MessagesInbox';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const supa = supabaseServer();
  let messages: ContactMessage[] = [];
  if (supa) {
    const { data, error } = await supa
      .from('contact_messages')
      .select('id, full_name, email, phone, country_code, topic, message, status, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[messages] fetch failed', error.message);
    } else {
      messages = (data ?? []).map((r) => ({
        id: r.id as string,
        fullName: r.full_name as string,
        email: r.email as string,
        phone: (r.phone as string | null) ?? '',
        countryCode: (r.country_code as string | null) ?? '',
        topic: (r.topic as string | null) ?? '',
        message: r.message as string,
        status: r.status as ContactMessage['status'],
        createdAt: r.created_at as string
      }));
    }
  }

  const newCount = messages.filter((m) => m.status === 'new').length;

  return (
    <>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <span className="eyebrow">Inbox</span>
          <h1 className="mt-2 text-2xl sm:text-3xl">Messages</h1>
          <p className="mt-1 text-ink-600">
            Submissions from the public Contact form. Mark as read once you&apos;ve seen them, replied after you respond.
          </p>
        </div>
        {newCount > 0 && (
          <span className="badge-accent">
            <Mail className="w-3 h-3" strokeWidth={2.4} />
            {newCount} new
          </span>
        )}
      </div>

      <MessagesInbox initial={messages} />
    </>
  );
}
