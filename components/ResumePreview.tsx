'use client';

import React from 'react';
import { ResumeData } from '../types';

export type TemplateStyle = 'modern' | 'minimal' | 'contrast' | 'elegant' | 'vibrant' | 'technical';

export type ThemeOverrides = {
  accentColor?: string;
  headerBgColor?: string;
  headerTextColor?: string;
  bodyFont?: FontFamilyId;
};

export type FontFamilyId = 'lato' | 'inter' | 'playfair' | 'source-serif' | 'poppins';

export const FONT_OPTIONS: { id: FontFamilyId; label: string; className: string; description: string; category: 'Sans' | 'Serif' }[] = [
  { id: 'lato', label: 'Lato', className: 'font-lato', description: 'Sans versátil y moderno', category: 'Sans' },
  { id: 'inter', label: 'Inter', className: 'font-inter', description: 'Sans técnica y minimalista', category: 'Sans' },
  { id: 'poppins', label: 'Poppins', className: 'font-poppins', description: 'Sans redondeada y amigable', category: 'Sans' },
  { id: 'playfair', label: 'Playfair Display', className: 'font-playfair', description: 'Serif elegante y clásica', category: 'Serif' },
  { id: 'source-serif', label: 'Source Serif 4', className: 'font-source-serif', description: 'Serif legible y confiable', category: 'Serif' },
];

type TemplateStyleConfig = {
  headerBgColor: string;
  headerGradient?: string;
  headerTitleColor: string;
  headerSubtitleColor: string;
  accentColor: string;
  sidebarBgColor: string;
  sidebarBorderColor: string;
  sidebarTextColor: string;
  bodyFont: FontFamilyId;
  pillBgColor: string;
  pillTextColor: string;
};

const TEMPLATE_STYLES: Record<TemplateStyle, TemplateStyleConfig> = {
  modern: {
    headerBgColor: '#0f172a',
    headerTitleColor: '#ffffff',
    headerSubtitleColor: '#bfdbfe',
    accentColor: '#2563eb',
    sidebarBgColor: '#f8fafc',
    sidebarBorderColor: '#e2e8f0',
    sidebarTextColor: '#0f172a',
    bodyFont: 'inter',
    pillBgColor: '#dbeafe',
    pillTextColor: '#0f172a',
  },
  minimal: {
    headerBgColor: '#ffffff',
    headerTitleColor: '#0f172a',
    headerSubtitleColor: '#2563eb',
    accentColor: '#1f2937',
    sidebarBgColor: '#ffffff',
    sidebarBorderColor: '#e2e8f0',
    sidebarTextColor: '#0f172a',
    bodyFont: 'playfair',
    pillBgColor: '#e2e8f0',
    pillTextColor: '#0f172a',
  },
  contrast: {
    headerBgColor: '#0f172a',
    headerGradient: 'linear-gradient(135deg, #2563eb 0%, #0f172a 100%)',
    headerTitleColor: '#ffffff',
    headerSubtitleColor: '#fef08a',
    accentColor: '#fef08a',
    sidebarBgColor: '#0f172a',
    sidebarBorderColor: '#1f2937',
    sidebarTextColor: '#e2e8f0',
    bodyFont: 'inter',
    pillBgColor: '#ffffff',
    pillTextColor: '#0f172a',
  },
  elegant: {
    headerBgColor: '#f8fafc',
    headerTitleColor: '#0f172a',
    headerSubtitleColor: '#9d174d',
    accentColor: '#be123c',
    sidebarBgColor: '#fff1f2',
    sidebarBorderColor: '#fecdd3',
    sidebarTextColor: '#0f172a',
    bodyFont: 'source-serif',
    pillBgColor: '#ffe4e6',
    pillTextColor: '#9f1239',
  },
  vibrant: {
    headerBgColor: '#0f172a',
    headerGradient: 'linear-gradient(120deg, #34d399 0%, #22d3ee 50%, #6366f1 100%)',
    headerTitleColor: '#ecfeff',
    headerSubtitleColor: '#cffafe',
    accentColor: '#22d3ee',
    sidebarBgColor: '#0b1224',
    sidebarBorderColor: '#111827',
    sidebarTextColor: '#e2e8f0',
    bodyFont: 'poppins',
    pillBgColor: '#0ea5e9',
    pillTextColor: '#ecfeff',
  },
  technical: {
    headerBgColor: '#0a0f1f',
    headerGradient: 'linear-gradient(135deg, #0ea5e9 0%, #0a0f1f 100%)',
    headerTitleColor: '#e2e8f0',
    headerSubtitleColor: '#7dd3fc',
    accentColor: '#7c3aed',
    sidebarBgColor: '#0f172a',
    sidebarBorderColor: '#1f2937',
    sidebarTextColor: '#e2e8f0',
    bodyFont: 'inter',
    pillBgColor: '#1f2937',
    pillTextColor: '#e0e7ff',
  },
};

interface ResumePreviewProps {
  data: ResumeData;
  template?: TemplateStyle;
  themeOverrides?: ThemeOverrides;
}

const avoidBreakStyle: React.CSSProperties = {
  breakInside: 'avoid',
  pageBreakInside: 'avoid',
};

const SectionHeader = ({ label, accent }: { label: string; accent: string }) => (
  <div className="flex items-center gap-3 uppercase tracking-[0.28em] text-[11px] font-semibold text-slate-500" style={avoidBreakStyle}>
    <span className="h-[1px] w-8 bg-slate-200" />
    <span className="text-slate-600" style={{ color: accent }}>
      {label}
    </span>
    <span className="h-[1px] flex-1 bg-slate-200" />
  </div>
);

const Pill = ({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) => (
  <span
    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-tight"
    style={{ backgroundColor: bg, color }}
  >
    {children}
  </span>
);

const InfoRow = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-start gap-3 text-sm text-slate-700" style={avoidBreakStyle}>
    <span className="text-slate-500 mt-1">{icon}</span>
    <span className="leading-relaxed break-words">{label}</span>
  </div>
);

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, template = 'modern', themeOverrides }) => {
  const { personalInfo, summary, experience, education, skills, languages } = data;
  const templateStyles = TEMPLATE_STYLES[template] ?? TEMPLATE_STYLES.modern;

  const accentColor = themeOverrides?.accentColor || templateStyles.accentColor;
  const headerBgColor = themeOverrides?.headerBgColor || templateStyles.headerBgColor;
  const headerTextColor = themeOverrides?.headerTextColor || templateStyles.headerSubtitleColor;
  const fontClass =
    FONT_OPTIONS.find((option) => option.id === (themeOverrides?.bodyFont || templateStyles.bodyFont))?.className || 'font-sans';
  const headerBackgroundStyle = templateStyles.headerGradient && !themeOverrides?.headerBgColor
    ? { background: templateStyles.headerGradient }
    : { backgroundColor: headerBgColor };

  return (
    <div
      id="resume-preview"
      className={`relative bg-white shadow-2xl w-[8.5in] max-w-[8.5in] min-h-[11in] mx-auto text-slate-800 ${fontClass} print:shadow-none overflow-hidden`}
      style={{
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
        boxShadow: '0 25px 60px rgba(15,23,42,0.15)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100 pointer-events-none" aria-hidden />
      <div className="relative flex flex-col h-full">
        <header
          className="px-[1.15in] pt-[1in] pb-8 border-b border-slate-200 shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
          style={{ ...headerBackgroundStyle, color: headerTextColor }}
        >
          <div className="flex items-start justify-between gap-6" style={avoidBreakStyle}>
            <div className="space-y-3">
              <p className="text-sm font-semibold tracking-[0.3em] uppercase opacity-80">Currículum</p>
              <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm" style={{ color: templateStyles.headerTitleColor }}>
                {personalInfo.fullName}
              </h1>
              <p className="text-lg font-medium tracking-wide" style={{ color: headerTextColor }}>
                {personalInfo.jobTitle}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 text-sm" style={avoidBreakStyle}>
              {personalInfo.email && <Pill bg="rgba(255,255,255,0.12)" color={headerTextColor}>{personalInfo.email}</Pill>}
              {personalInfo.phone && <Pill bg="rgba(255,255,255,0.12)" color={headerTextColor}>{personalInfo.phone}</Pill>}
              {personalInfo.location && <Pill bg="rgba(255,255,255,0.12)" color={headerTextColor}>{personalInfo.location}</Pill>}
            </div>
          </div>
          {summary && (
            <div
              className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-sm leading-relaxed text-white/90"
              style={{ ...avoidBreakStyle, color: headerTextColor }}
            >
              {summary}
            </div>
          )}
        </header>

        <div className="flex-1 px-[1.15in] py-[0.9in] space-y-8">
          <div className="grid grid-cols-[0.42fr_0.58fr] gap-8 items-start">
            <aside
              className="bg-white/80 rounded-2xl border border-slate-200 shadow-inner px-6 py-7 space-y-5"
              style={avoidBreakStyle}
            >
              <SectionHeader label="Contacto" accent={accentColor} />
              <div className="space-y-3">
                {personalInfo.email && <InfoRow icon={<MailIcon />} label={personalInfo.email} />}
                {personalInfo.phone && <InfoRow icon={<PhoneIcon />} label={personalInfo.phone} />}
                {personalInfo.location && <InfoRow icon={<LocationIcon />} label={personalInfo.location} />}
                {personalInfo.linkedin && <InfoRow icon={<LinkIcon />} label={personalInfo.linkedin} />}
                {personalInfo.website && <InfoRow icon={<LinkIcon />} label={personalInfo.website} />}
              </div>

              {skills?.length > 0 && (
                <div className="space-y-3" style={avoidBreakStyle}>
                  <SectionHeader label="Habilidades" accent={accentColor} />
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <Pill key={idx} bg={templateStyles.pillBgColor} color={templateStyles.pillTextColor}>
                        {skill}
                      </Pill>
                    ))}
                  </div>
                </div>
              )}

              {languages?.length > 0 && (
                <div className="space-y-3" style={avoidBreakStyle}>
                  <SectionHeader label="Idiomas" accent={accentColor} />
                  <div className="space-y-2 text-sm text-slate-700">
                    {languages.map((lang, idx) => (
                      <div key={idx} className="flex items-start gap-2" style={avoidBreakStyle}>
                        <span className="mt-1 text-[8px]" style={{ color: accentColor }}>
                          ●
                        </span>
                        <span className="leading-relaxed">{lang}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            <main className="space-y-6">
              {experience?.length > 0 && (
                <div className="space-y-4" style={avoidBreakStyle}>
                  <SectionHeader label="Experiencia" accent={accentColor} />
                  <div className="space-y-4">
                    {experience.map((item, idx) => (
                      <div
                        key={`${item.company}-${idx}`}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
                        style={avoidBreakStyle}
                      >
                        <div className="flex flex-wrap justify-between gap-2 mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 leading-tight">{item.role}</h3>
                            <p className="text-sm font-medium text-slate-600">{item.company}</p>
                          </div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">
                            {item.startDate} — {item.endDate}
                          </p>
                        </div>
                        <ul className="list-disc list-outside pl-5 text-sm text-slate-700 space-y-2 leading-relaxed">
                          {item.description?.map((line, lineIdx) => (
                            <li key={lineIdx} style={avoidBreakStyle}>
                              {line}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {education?.length > 0 && (
                <div className="space-y-4" style={avoidBreakStyle}>
                  <SectionHeader label="Educación" accent={accentColor} />
                  <div className="space-y-3">
                    {education.map((item, idx) => (
                      <div
                        key={`${item.institution}-${idx}`}
                        className="bg-white rounded-xl border border-slate-200 shadow-sm p-4"
                        style={avoidBreakStyle}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-base font-semibold text-slate-900 leading-tight">{item.degree}</h3>
                            <p className="text-sm text-slate-600">{item.institution}</p>
                          </div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold whitespace-nowrap">
                            {item.startDate} — {item.endDate}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

const MailIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 015.657 5.657l-3.536 3.536a4 4 0 01-5.657 0" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.172 13.828a4 4 0 010-5.657l3.536-3.536a4 4 0 015.657 5.657" />
  </svg>
);

