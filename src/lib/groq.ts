/**
 * Tiny server-only wrapper around the Groq chat-completions endpoint.
 *
 * Why not the official SDK: a single `fetch` call keeps the dependency tree
 * minimal, plays well with Next.js edge if we ever need it, and gives us
 * direct control over abort/timeout handling.
 *
 * GROQ_API_KEY must be set in the runtime env. GROQ_MODEL is optional and
 * defaults to llama-3.3-70b-versatile.
 */

type GroqMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export type GroqResult =
  | { ok: true; content: string }
  | { ok: false; error: string };

export async function groqChat(
  messages: GroqMessage[],
  opts: { temperature?: number; maxTokens?: number; timeoutMs?: number } = {}
): Promise<GroqResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { ok: false, error: 'AI is not configured on this server (missing GROQ_API_KEY).' };
  }
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 45_000);

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: opts.temperature ?? 0.4,
        max_tokens: opts.maxTokens ?? 1500
      }),
      signal: controller.signal
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, error: `Groq ${res.status}: ${text.slice(0, 200) || res.statusText}` };
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) return { ok: false, error: 'Empty response from Groq.' };
    return { ok: true, content };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, error: 'AI request timed out. Try again.' };
    }
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown AI error.' };
  } finally {
    clearTimeout(timeout);
  }
}
