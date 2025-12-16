'use client';

import React from 'react';
import { ResumeData } from '../types';
import { CanvasWorkspace, FONT_OPTIONS } from './CanvasWorkspace';
import { TEMPLATE_STYLES } from './resume/constants';
import { FontFamilyId, TemplateStyle, ThemeOverrides } from './resume/types';

interface ResumePreviewProps {
  data: ResumeData;
  template?: TemplateStyle;
  themeOverrides?: ThemeOverrides;
  onDataChange?: (data: ResumeData) => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, template = 'modern', themeOverrides, onDataChange }) => {
  const templateStyles = TEMPLATE_STYLES[template] ?? TEMPLATE_STYLES.modern;
  const fontClass =
    FONT_OPTIONS.find((option) => option.id === (themeOverrides?.bodyFont || templateStyles.bodyFont))?.className || 'font-sans';

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
      <div className="relative p-6">
        <CanvasWorkspace data={data} template={template} themeOverrides={themeOverrides} onDataChange={onDataChange} />
      </div>
    </div>
  );
};

export { FONT_OPTIONS };
export type { FontFamilyId, TemplateStyle, ThemeOverrides };
