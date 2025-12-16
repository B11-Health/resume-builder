'use client';

import React from 'react';
import { ResumeData } from '../types';
import { HiOutlineDevicePhoneMobile, HiOutlineEnvelope, HiOutlineLink, HiOutlineMapPin } from 'react-icons/hi2';
import { InfoRow, Pill, SectionHeader, avoidBreakStyle } from './resume/layout';
import { FONT_OPTIONS, TEMPLATE_STYLES } from './resume/constants';
import { FontFamilyId, TemplateStyle, ThemeOverrides } from './resume/types';

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
  const fontClass =
    FONT_OPTIONS.find((option) => option.id === (themeOverrides?.bodyFont || templateStyles.bodyFont))?.className || 'font-sans';
  const headerBackgroundStyle = templateStyles.headerGradient && !themeOverrides?.headerBgColor
    ? { background: templateStyles.headerGradient }
    : { backgroundColor: headerBgColor };

  const htmlResume = data.htmlResume?.trim();

  if (htmlResume) {
    return (
      <div
        className={`relative bg-white shadow-2xl w-[8.5in] max-w-[8.5in] min-h-[11in] mx-auto text-slate-800 ${fontClass} print:shadow-none overflow-visible`}
        style={{
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
          boxShadow: '0 25px 60px rgba(15,23,42,0.15)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100 pointer-events-none" aria-hidden />
        <div
          className="relative h-full w-full"
          dangerouslySetInnerHTML={{ __html: htmlResume }}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative bg-white shadow-2xl w-[8.5in] max-w-[8.5in] min-h-[11in] mx-auto text-slate-800 ${fontClass} print:shadow-none overflow-visible`}
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
                {personalInfo.email && <InfoRow icon={<HiOutlineEnvelope className="w-4 h-4" />} label={personalInfo.email} />}
                {personalInfo.phone && (
                  <InfoRow icon={<HiOutlineDevicePhoneMobile className="w-4 h-4" />} label={personalInfo.phone} />
                )}
                {personalInfo.location && <InfoRow icon={<HiOutlineMapPin className="w-4 h-4" />} label={personalInfo.location} />}
                {personalInfo.linkedin && <InfoRow icon={<HiOutlineLink className="w-4 h-4" />} label={personalInfo.linkedin} />}
                {personalInfo.website && <InfoRow icon={<HiOutlineLink className="w-4 h-4" />} label={personalInfo.website} />}
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

export { FONT_OPTIONS };
export type { FontFamilyId, TemplateStyle, ThemeOverrides };
