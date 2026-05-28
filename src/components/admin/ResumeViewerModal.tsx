'use client';
import { useState } from 'react';
import { X, Download, AlertCircle, Printer } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

interface Resume {
  fullName?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  summary?: string;
  experiences?: Array<{ role: string; company: string; start: string; end: string; bullets: string }>;
  education?: Array<{ degree: string; school: string; years: string; notes: string }>;
  skills?: string;
  certifications?: string;
}

interface ResumeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: Resume | null;
  pdfName?: string;
  fullName?: string;
  placeholder?: boolean;
}

export function ResumeViewerModal({ 
  isOpen, 
  onClose, 
  resume, 
  pdfName = 'resume.pdf',
  fullName = 'Resume',
  placeholder = false
}: ResumeViewerModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    setIsPrinting(true);
    const win = window.open('', '_blank');
    if (!win) {
      toast('Allow popups to print the resume.', 'error');
      return;
    }

    const html = generateResumeHTML(resume || {});
    win.document.write(html);
    win.document.close();
    win.focus();
    
    setTimeout(() => {
      win.print();
      setIsPrinting(false);
    }, 100);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-ink-200 flex items-center justify-between p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-display font-bold text-ink-900">{fullName}'s Resume</h2>
              <p className="text-sm text-ink-500 mt-0.5">{pdfName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-ink-100 rounded-lg transition-colors text-ink-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 space-y-4">
            {placeholder ? (
              <div className="flex items-start gap-3 text-sm text-ink-700 bg-ink-50 ring-1 ring-inset ring-ink-200 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={2.2} />
                <span>This applicant hasn't attached a resume to their profile yet.</span>
              </div>
            ) : (
              <>
                {/* Resume Display */}
                <div className="bg-ink-50 rounded-lg p-6 space-y-4 text-sm">
                  {/* Header */}
                  <div className="border-b border-ink-200 pb-4">
                    <h1 className="text-xl font-bold text-ink-900">{resume?.fullName}</h1>
                    <p className="text-ink-600 font-semibold">{resume?.title}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-600">
                      {resume?.email && <span>{resume.email}</span>}
                      {resume?.phone && <span>•</span>}
                      {resume?.phone && <span>{resume.phone}</span>}
                      {resume?.location && <span>•</span>}
                      {resume?.location && <span>{resume.location}</span>}
                    </div>
                    {resume?.linkedin && (
                      <div className="mt-2">
                        <a href={`https://${resume.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:underline">
                          {resume.linkedin}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  {resume?.summary && (
                    <div>
                      <h3 className="font-semibold text-ink-900 uppercase tracking-wide text-xs">Summary</h3>
                      <p className="mt-2 text-ink-700 whitespace-pre-wrap">{resume.summary}</p>
                    </div>
                  )}

                  {/* Experience */}
                  {resume?.experiences && resume.experiences.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-ink-900 uppercase tracking-wide text-xs">Experience</h3>
                      <div className="mt-3 space-y-3">
                        {resume.experiences.map((exp, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-ink-900">{exp.role}</p>
                                <p className="text-ink-600">{exp.company}</p>
                              </div>
                              <p className="text-xs text-ink-600 font-semibold">
                                {exp.start}
                                {exp.end && ` – ${exp.end}`}
                              </p>
                            </div>
                            <p className="mt-2 text-ink-700 whitespace-pre-wrap text-xs leading-relaxed">
                              {exp.bullets}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {resume?.education && resume.education.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-ink-900 uppercase tracking-wide text-xs">Education</h3>
                      <div className="mt-3 space-y-3">
                        {resume.education.map((edu, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-ink-900">{edu.degree}</p>
                                <p className="text-ink-600">{edu.school}</p>
                              </div>
                              <p className="text-xs text-ink-600 font-semibold">{edu.years}</p>
                            </div>
                            {edu.notes && (
                              <p className="mt-1 text-ink-700 text-xs">{edu.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {resume?.skills && (
                    <div>
                      <h3 className="font-semibold text-ink-900 uppercase tracking-wide text-xs">Skills</h3>
                      <p className="mt-2 text-ink-700 whitespace-pre-wrap text-xs leading-relaxed">
                        {resume.skills}
                      </p>
                    </div>
                  )}

                  {/* Certifications */}
                  {resume?.certifications && (
                    <div>
                      <h3 className="font-semibold text-ink-900 uppercase tracking-wide text-xs">Certifications</h3>
                      <p className="mt-2 text-ink-700 whitespace-pre-wrap text-xs leading-relaxed">
                        {resume.certifications}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-ink-200 px-5 sm:px-6 py-4 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="btn-secondary btn-md"
            >
              Close
            </button>
            {!placeholder && (
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="btn-primary btn-md"
              >
                <Printer className="w-4 h-4" />
                {isPrinting ? 'Printing...' : 'Print / Download'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function generateResumeHTML(resume: Resume): string {
  const fullName = resume.fullName || 'Resume';
  const title = resume.title || '';
  const email = resume.email || '';
  const phone = resume.phone || '';
  const location = resume.location || '';
  const linkedin = resume.linkedin || '';
  const summary = resume.summary || '';
  const experiences = resume.experiences || [];
  const education = resume.education || [];
  const skills = resume.skills || '';
  const certifications = resume.certifications || '';

  const expHtml = experiences
    .map(
      (e) =>
        `<div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <strong style="font-size: 11pt;">${e.role}</strong><br/>
              <span style="color: #666;">${e.company}</span>
            </div>
            <span style="font-size: 10pt; color: #666; white-space: nowrap;">${e.start}${
          e.end ? ` – ${e.end}` : ''
        }</span>
          </div>
          <div style="margin-top: 4px; font-size: 10pt; color: #333; white-space: pre-wrap; line-height: 1.4;">
            ${e.bullets.replace(/\n/g, '<br/>')}
          </div>
        </div>`
    )
    .join('');

  const eduHtml = education
    .map(
      (e) =>
        `<div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <strong style="font-size: 11pt;">${e.degree}</strong><br/>
              <span style="color: #666;">${e.school}</span>
            </div>
            <span style="font-size: 10pt; color: #666; white-space: nowrap;">${e.years}</span>
          </div>
          ${e.notes ? `<div style="margin-top: 4px; font-size: 10pt; color: #333;">${e.notes}</div>` : ''}
        </div>`
    )
    .join('');

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${fullName} — Resume</title>
  <style>
    @page { size: A4; margin: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 24mm 18mm;
      color: #222;
      font-size: 11pt;
      line-height: 1.5;
    }
    h1 { font-size: 16pt; margin: 0 0 4px 0; }
    h2 { font-size: 10pt; margin: 12pt 0 6pt 0; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #000; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
    .header { border-bottom: 1px solid #999; padding-bottom: 8px; margin-bottom: 12pt; }
    .contact { font-size: 9pt; color: #555; }
    .contact a { color: #0066cc; text-decoration: none; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${fullName}</h1>
    <div style="font-weight: 500; color: #333; font-size: 11pt; margin-bottom: 4px;">${title}</div>
    <div class="contact">
      ${email ? `${email}` : ''}
      ${email && phone ? ' • ' : ''}
      ${phone ? `${phone}` : ''}
      ${(email || phone) && location ? ' • ' : ''}
      ${location ? `${location}` : ''}
      ${linkedin ? `<br/><a href="https://${linkedin}">${linkedin}</a>` : ''}
    </div>
  </div>

  ${
    summary
      ? `<div>
      <h2>Summary</h2>
      <div style="white-space: pre-wrap; font-size: 10pt;">${summary}</div>
    </div>`
      : ''
  }

  ${
    experiences.length > 0
      ? `<div>
      <h2>Experience</h2>
      ${expHtml}
    </div>`
      : ''
  }

  ${
    education.length > 0
      ? `<div>
      <h2>Education</h2>
      ${eduHtml}
    </div>`
      : ''
  }

  ${
    skills
      ? `<div>
      <h2>Skills</h2>
      <div style="white-space: pre-wrap; font-size: 10pt;">${skills}</div>
    </div>`
      : ''
  }

  ${
    certifications
      ? `<div>
      <h2>Certifications</h2>
      <div style="white-space: pre-wrap; font-size: 10pt;">${certifications}</div>
    </div>`
      : ''
  }
</body>
</html>`;
}
