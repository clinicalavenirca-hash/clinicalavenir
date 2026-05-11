/**
 * WhatsApp redirect helper. Used by Apply + Contact forms — after the
 * form submission persists to the database, we also open a wa.me deep
 * link in a new tab with the form contents pre-filled so the user can
 * tap "send" and notify admin via WhatsApp simultaneously.
 */

// Avenir admissions WhatsApp number. Strip "+" and spaces for the wa.me URL.
export const ADMIN_WHATSAPP_NUMBER = '15145503765';

/** Opens wa.me/<number>?text=<message> in a new tab. No-op during SSR. */
export function openWhatsApp(message: string): void {
  if (typeof window === 'undefined') return;
  const url = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
