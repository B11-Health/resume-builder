import { FontFamilyId, TemplateStyle, TemplateStyleConfig } from './types';

export const FONT_OPTIONS: { id: FontFamilyId; label: string; className: string; description: string; category: 'Sans' | 'Serif' }[] = [
  { id: 'lato', label: 'Lato', className: 'font-lato', description: 'Sans versátil y moderno', category: 'Sans' },
  { id: 'inter', label: 'Inter', className: 'font-inter', description: 'Sans técnica y minimalista', category: 'Sans' },
  { id: 'poppins', label: 'Poppins', className: 'font-poppins', description: 'Sans redondeada y amigable', category: 'Sans' },
  { id: 'playfair', label: 'Playfair Display', className: 'font-playfair', description: 'Serif elegante y clásica', category: 'Serif' },
  { id: 'source-serif', label: 'Source Serif 4', className: 'font-source-serif', description: 'Serif legible y confiable', category: 'Serif' },
];

export const TEMPLATE_STYLES: Record<TemplateStyle, TemplateStyleConfig> = {
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

  electric: {
    headerBgColor: '#3b82f6', // blue-500
    headerTitleColor: '#ffffff',
    headerSubtitleColor: '#bfdbfe', // blue-200
    accentColor: '#f97316', // orange-600
    sidebarBgColor: '#1F2937', // gray-800
    sidebarBorderColor: '#374151', // gray-700
    sidebarTextColor: '#e5e7eb', // gray-200
    bodyFont: 'inter',
    pillBgColor: '#3b82f6', // blue-500
    pillTextColor: '#ffffff',
  },
};