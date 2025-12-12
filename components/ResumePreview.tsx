'use client';

import React from 'react';
import { ResumeData } from '../types';

export type TemplateStyle = 'modern' | 'minimal' | 'contrast' | 'elegant' | 'vibrant' | 'technical';

export type ThemeOverrides = {
  accentColor?: string;
  headerBgColor?: string;
  headerTextColor?: string;
  bodyFont?: 'sans' | 'serif';
};

type TemplateStyleConfig = {
  headerBgColor: string;
  headerGradient?: string;
  headerTitleColor: string;
  headerSubtitleColor: string;
  accentColor: string;
  sidebarBgColor: string;
  sidebarBorderColor: string;
  sidebarTextColor: string;
  bodyFont: 'font-sans' | 'font-serif';
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
    bodyFont: 'font-sans',
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
    bodyFont: 'font-serif',
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
    bodyFont: 'font-sans',
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
    bodyFont: 'font-serif',
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
    bodyFont: 'font-sans',
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
    bodyFont: 'font-sans',
    pillBgColor: '#1f2937',
    pillTextColor: '#e0e7ff',
  },
};

interface ResumePreviewProps {
  data: ResumeData;
  template?: TemplateStyle;
  themeOverrides?: ThemeOverrides;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, template = 'modern', themeOverrides }) => {
  const { personalInfo, summary, experience, education, skills, languages } = data;
  const templateStyles = TEMPLATE_STYLES[template] ?? TEMPLATE_STYLES.modern;

  const accentColor = themeOverrides?.accentColor || templateStyles.accentColor;
  const headerBgColor = themeOverrides?.headerBgColor || templateStyles.headerBgColor;
  const headerTextColor = themeOverrides?.headerTextColor || templateStyles.headerSubtitleColor;
  const fontClass = themeOverrides?.bodyFont === 'serif' ? 'font-serif' : templateStyles.bodyFont;
  const sidebarTextColor = templateStyles.sidebarTextColor;
  const headerBackgroundStyle = templateStyles.headerGradient && !themeOverrides?.headerBgColor
    ? { background: templateStyles.headerGradient }
    : { backgroundColor: headerBgColor };

  return (
    <div
      id="resume-preview"
      className={`bg-white shadow-2xl w-full max-w-[8.5in] min-h-[11in] mx-auto text-slate-800 ${fontClass} print:shadow-none`}
      style={{
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      {/* Header Section */}
      <div
        className={`p-10 print-color-adjust-exact`}
        style={headerBackgroundStyle}
      >
        <h1
          className="text-4xl md:text-5xl font-bold font-serif tracking-tight uppercase mb-2"
          style={{ color: templateStyles.headerTitleColor }}
        >
          {personalInfo.fullName}
        </h1>
        <p
          className={`text-xl tracking-wider uppercase font-medium mb-6`}
          style={{ color: headerTextColor }}
        >
          {personalInfo.jobTitle}
        </p>

        <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm font-light" style={{ color: headerTextColor }}>
          {personalInfo.email && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              {personalInfo.email}
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              {personalInfo.phone}
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              {personalInfo.location}
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center gap-2">
              <span className="font-bold bg-white text-slate-900 rounded-sm px-1 text-xs">in</span> {personalInfo.linkedin}
            </div>
          )}
        </div>
      </div>

        <div className="flex flex-col md:flex-row h-full">
          {/* Main Column */}
          <div className="w-full md:w-2/3 p-8 md:p-10 pr-6">
          {/* Summary */}
          {summary && (
            <section className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-widest mb-4 border-b-2 border-slate-200 pb-2 flex items-center gap-2">
                <span className="bg-slate-900 w-2 h-2 rounded-full"></span>
                Perfil Profesional
              </h2>
              <p className="text-slate-700 leading-relaxed text-justify">{summary}</p>
            </section>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-widest mb-6 border-b-2 border-slate-200 pb-2 flex items-center gap-2">
                <span className="bg-slate-900 w-2 h-2 rounded-full"></span>
                Experiencia Laboral
              </h2>
              <div className="space-y-6">
                {experience.map((exp, index) => (
                  <div key={index} className="break-inside-avoid">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-xl font-bold text-slate-800">{exp.role}</h3>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-3">
                      <span className={`font-bold uppercase tracking-wide`} style={{ color: accentColor }}>{exp.company}</span>
                      <span className="text-slate-500 font-medium italic">{exp.startDate} – {exp.endDate}</span>
                    </div>
                    <ul className="list-disc list-outside ml-4 space-y-1.5 text-slate-700 text-sm md:text-base">
                      {exp.description && exp.description.map((point, idx) => (
                        <li key={idx} className="pl-1">{point}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Column */}
        <div
          className={`w-full md:w-1/3 p-8 md:p-10 border-l print-color-adjust-exact`}
          style={{
            background: templateStyles.sidebarBgColor,
            borderColor: templateStyles.sidebarBorderColor,
            color: sidebarTextColor,
          }}
        >
          {/* Skills */}
          {skills && skills.length > 0 && (
            <section className="mb-8 break-inside-avoid">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-slate-300 pb-1" style={{ color: sidebarTextColor }}>
                Habilidades
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className={`text-sm font-medium block w-full mb-1 px-2 py-1 rounded`}
                    style={{ backgroundColor: templateStyles.pillBgColor, color: templateStyles.pillTextColor }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <section className="mb-8 break-inside-avoid">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-slate-300 pb-1" style={{ color: sidebarTextColor }}>
                Educación
              </h2>
              <div className="space-y-5">
                {education.map((edu, index) => (
                  <div key={index}>
                    <h3 className="font-bold leading-tight mb-1" style={{ color: sidebarTextColor }}>{edu.institution}</h3>
                    <div className={`text-sm font-medium mb-1`} style={{ color: accentColor }}>{edu.degree}</div>
                    <div className="text-xs text-slate-500 uppercase">{edu.startDate} – {edu.endDate}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <section className="break-inside-avoid">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-slate-300 pb-1" style={{ color: sidebarTextColor }}>
                Idiomas
              </h2>
              <ul className="list-none space-y-2">
                {languages.map((lang, index) => (
                  <li key={index} className="text-sm flex items-center justify-between" style={{ color: sidebarTextColor }}>
                    <span>{lang}</span>
                    <span className={`h-1.5 w-1.5 rounded-full`} style={{ backgroundColor: accentColor }}></span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
