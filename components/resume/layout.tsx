import React from 'react';

export const avoidBreakStyle: React.CSSProperties = {
  breakInside: 'avoid',
  pageBreakInside: 'avoid',
};

export const SectionHeader = ({ label, accent }: { label: string; accent: string }) => (
  <div className="flex items-center gap-3 uppercase tracking-[0.28em] text-[11px] font-semibold text-slate-500" style={avoidBreakStyle}>
    <span className="h-[1px] w-8 bg-slate-200" />
    <span className="text-slate-600" style={{ color: accent }}>
      {label}
    </span>
    <span className="h-[1px] flex-1 bg-slate-200" />
  </div>
);

export const Pill = ({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) => (
  <span
    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-tight"
    style={{ backgroundColor: bg, color }}
  >
    {children}
  </span>
);

export const InfoRow = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-start gap-3 text-sm text-slate-700" style={avoidBreakStyle}>
    <span className="text-slate-500 mt-1">{icon}</span>
    <span className="leading-relaxed break-words">{label}</span>
  </div>
);
