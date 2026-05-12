/**
 * WhatsApp redirect helpers. Used by Apply + Contact forms — form submission
 * also opens a wa.me deep link with the form contents pre-filled so the user
 * can tap "send" and notify admin via WhatsApp in addition to the DB save.
 *
 * The two-step API exists because browsers only allow `window.open` calls
 * that happen INSIDE a user-gesture handler with no preceding `await`. To
 * bridge the gap until the DB save resolves, callers pre-open a blank tab
 * synchronously at the start of the click handler (`openWhatsAppTab`),
 * then redirect that already-owned tab to the wa.me URL once the save
 * succeeds (`navigateWhatsAppTab`). If the save fails, callers should
 * close the blank tab so the user isn't left staring at about:blank.
 */

// Avenir admissions WhatsApp number. Strip "+" and spaces for the wa.me URL.
export const ADMIN_WHATSAPP_NUMBER = '15145503765';

/** Build the full wa.me deep link with an encoded message body. */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Opens a blank target tab synchronously. MUST be called as the first
 * thing inside a click handler — no `await` before it — so the browser
 * counts it as a user-gesture-driven action and never blocks it.
 *
 * Returns the Window handle, or null if the browser refused outright
 * (very aggressive popup blockers, or SSR). Callers should be defensive
 * against null and fall back to `window.location.assign(url)`.
 */
export function openWhatsAppTab(): Window | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.open('about:blank', '_blank');
  } catch {
    return null;
  }
}

/**
 * Points the pre-opened blank tab at the wa.me deep link. If the original
 * `window.open` was blocked (`tab` is null or already closed), falls back
 * to navigating the *current* tab so the user still ends up at WhatsApp.
 * That fallback loses the in-app success screen but preserves the
 * "redirect to WhatsApp with details" promise.
 */
export function navigateWhatsAppTab(tab: Window | null, message: string): void {
  if (typeof window === 'undefined') return;
  const url = buildWhatsAppUrl(message);
  if (tab && !tab.closed) {
    try {
      tab.location.href = url;
      return;
    } catch {
      // Cross-origin / closed-during-await edge cases — fall through to assign.
    }
  }
  window.location.assign(url);
}

/**
 * Legacy single-step API kept for any caller that intentionally wants the
 * direct-click flow (e.g. a "Send to admin on WhatsApp" button on a
 * success screen, where the click is already a user gesture).
 */
export function openWhatsApp(message: string): void {
  if (typeof window === 'undefined') return;
  window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
}
