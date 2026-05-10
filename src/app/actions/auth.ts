'use server';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

export async function signOut() {
  const supabase = supabaseServer();
  if (supabase) await supabase.auth.signOut();
  // Both portals land on the public home after sign-out.
  redirect('/');
}
