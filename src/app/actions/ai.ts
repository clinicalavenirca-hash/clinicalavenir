'use server';
import { requireStudent } from '@/lib/db/session';
import { groqChat } from '@/lib/groq';

/**
 * Server actions for the AI assistant. Both gates require an authenticated
 * student so the LLM endpoint isn't a free-for-all public proxy. Inputs are
 * length-capped to keep prompts bounded and avoid huge token bills if a
 * user pastes something pathological.
 */

const MAX_JD_CHARS = 8000;
const MAX_RESUME_CHARS = 12000;

function clip(s: string, n: number): string {
  if (!s) return '';
  return s.length > n ? s.slice(0, n) : s;
}

/**
 * Rewrite the student's resume against a target job description. Returns a
 * tailored resume in plain text (sections separated by blank lines, bullets
 * prefixed with "•"). We keep the OUTPUT structure simple so the panel
 * doesn't need a heavy renderer.
 */
export async function tailorResume(input: {
  jobTitle: string;
  company: string;
  jobDescription: string;
  resume: string;
}) {
  await requireStudent();
  const jobTitle = clip(input.jobTitle?.trim() ?? '', 200);
  const company = clip(input.company?.trim() ?? '', 200);
  const jd = clip(input.jobDescription?.trim() ?? '', MAX_JD_CHARS);
  const resume = clip(input.resume?.trim() ?? '', MAX_RESUME_CHARS);

  if (!jd || !resume) {
    return { error: 'Both the job description and your current resume are required.' };
  }

  const system = `You are a career coach editing resumes for entry-level candidates breaking into the Canadian pharma / life-sciences industry (pharmacovigilance, regulatory affairs, clinical research, clinical data management).

Rules you MUST follow:
- Rewrite the candidate's existing resume so it speaks to the target role. Reuse the candidate's real experience — never fabricate roles, companies, dates, or credentials.
- Keep the same overall section structure (Summary, Experience, Education, Skills, Certifications).
- Tighten language to use action verbs and quantified results where the candidate has provided numbers.
- Surface keywords and competencies that appear in the job description so the resume passes an ATS pre-screen, but only insert keywords the candidate already credibly possesses.
- Use plain text. Section headings on their own line in ALL CAPS. Bullets prefixed with "• ". No markdown, no asterisks.
- Output ONLY the rewritten resume — no preamble, no closing notes, no explanations.`;

  const user = `TARGET ROLE
${jobTitle}${company ? ` at ${company}` : ''}

JOB DESCRIPTION
${jd}

CANDIDATE'S CURRENT RESUME
${resume}

Rewrite the resume above so it is tailored to the target role. Keep all factual content; only re-frame and re-prioritise.`;

  const result = await groqChat(
    [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    { temperature: 0.4, maxTokens: 1800 }
  );

  if (!result.ok) return { error: result.error };
  return { ok: true, content: result.content };
}

/**
 * Draft a cover letter for a specific role. The student supplies their
 * basic profile (name + a paragraph about background) and the JD; the model
 * returns a single-page cover letter with clear paragraphs.
 */
export async function generateCoverLetter(input: {
  jobTitle: string;
  company: string;
  jobDescription: string;
  candidateName: string;
  candidateBackground: string;
}) {
  await requireStudent();
  const jobTitle = clip(input.jobTitle?.trim() ?? '', 200);
  const company = clip(input.company?.trim() ?? '', 200);
  const jd = clip(input.jobDescription?.trim() ?? '', MAX_JD_CHARS);
  const name = clip(input.candidateName?.trim() ?? '', 120);
  const background = clip(input.candidateBackground?.trim() ?? '', MAX_RESUME_CHARS);

  if (!jd || !background || !name) {
    return { error: 'Name, background, and job description are all required.' };
  }

  const system = `You are a career coach drafting cover letters for entry-level candidates breaking into Canadian pharma / life-sciences roles.

Rules:
- Tone: warm, specific, confident. Not generic.
- Length: 220–320 words. Three paragraphs plus a short opener and sign-off.
- Structure:
  Opening line addressing the company (e.g. "Dear ${company || 'Hiring Team'},").
  Paragraph 1: who the candidate is and the role they're applying for.
  Paragraph 2: 2–3 specific reasons their background fits the role, drawn from the candidate's supplied background. Surface keywords from the JD only when the candidate's background credibly supports them.
  Paragraph 3: why the company specifically — a single sentence connecting to the JD or company mission.
  Sign-off: "Sincerely, [candidate name]"
- NEVER fabricate experience, certifications, employers, or numbers. Use only what the candidate has provided.
- Plain text only. No markdown, no headers, no bullet lists.
- Output ONLY the letter.`;

  const user = `TARGET ROLE
${jobTitle}${company ? ` at ${company}` : ''}

JOB DESCRIPTION
${jd}

CANDIDATE
Name: ${name}
Background: ${background}

Draft the cover letter now.`;

  const result = await groqChat(
    [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    { temperature: 0.6, maxTokens: 1000 }
  );

  if (!result.ok) return { error: result.error };
  return { ok: true, content: result.content };
}
