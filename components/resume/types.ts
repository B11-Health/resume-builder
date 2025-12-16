export type TemplateStyle = 'modern' | 'minimal' | 'contrast' | 'elegant' | 'vibrant' | 'technical';

export type ThemeOverrides = {
  accentColor?: string;
  headerBgColor?: string;
  headerTextColor?: string;
  bodyFont?: FontFamilyId;
};

export type FontFamilyId = 'lato' | 'inter' | 'playfair' | 'source-serif' | 'poppins';

export type TemplateStyleConfig = {
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
