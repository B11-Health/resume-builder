'use client';

import React, { useState, useCallback } from 'react';
import { INITIAL_RESUME_DATA, ResumeData, ResumeGenerationRequest } from '../types';
import { InputSection } from './InputSection';
import { FONT_OPTIONS, FontFamilyId, ResumePreview, TemplateStyle, ThemeOverrides } from './ResumePreview';
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineArrowDownTray,
  HiOutlineCloudArrowDown,
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
  HiOutlineSparkles,
  HiOutlineSwatch,
} from 'react-icons/hi2';

const templates: { id: TemplateStyle; name: string; description: string; badge: string }[] = [
  {
    id: 'modern',
    name: 'Moderno',
    description: 'Cintillo sólido, acentos en azul y jerarquía clara.',
    badge: 'Recomendado',
  },
  {
    id: 'minimal',
    name: 'Minimalista',
    description: 'Diseño aireado en blanco y negro con tipografía elegante.',
    badge: 'Ligero',
  },
  {
    id: 'contrast',
    name: 'Alto contraste',
    description: 'Gradiente vibrante y sidebar oscuro para destacar.',
    badge: 'Creativo',
  },
  {
    id: 'elegant',
    name: 'Elegante',
    description: 'Tonos vino y rosa pálido para un look sofisticado.',
    badge: 'Premium',
  },
  {
    id: 'vibrant',
    name: 'Vibrante',
    description: 'Gradientes multicolor y energía juvenil.',
    badge: 'Colorido',
  },
  {
    id: 'technical',
    name: 'Tech',
    description: 'Oscuro con acentos neón para roles digitales.',
    badge: 'Digital',
  },
];

const templateThemeDefaults: Record<TemplateStyle, Required<ThemeOverrides>> = {
  modern: {
    accentColor: '#2563eb',
    headerBgColor: '#0f172a',
    headerTextColor: '#bfdbfe',
    bodyFont: 'inter',
  },
  minimal: {
    accentColor: '#1f2937',
    headerBgColor: '#ffffff',
    headerTextColor: '#2563eb',
    bodyFont: 'playfair',
  },
  contrast: {
    accentColor: '#fef08a',
    headerBgColor: '#0f172a',
    headerTextColor: '#fef08a',
    bodyFont: 'inter',
  },
  elegant: {
    accentColor: '#be123c',
    headerBgColor: '#f8fafc',
    headerTextColor: '#9d174d',
    bodyFont: 'source-serif',
  },
  vibrant: {
    accentColor: '#22d3ee',
    headerBgColor: '#0f172a',
    headerTextColor: '#cffafe',
    bodyFont: 'poppins',
  },
  technical: {
    accentColor: '#7c3aed',
    headerBgColor: '#0a0f1f',
    headerTextColor: '#7dd3fc',
    bodyFont: 'inter',
  },
};

const themePresets: { id: string; name: string; accentColor: string; headerBgColor: string; headerTextColor: string; bodyFont: FontFamilyId; }[] = [
  {
    id: 'atlantic',
    name: 'Atlántico',
    accentColor: '#0ea5e9',
    headerBgColor: '#0f172a',
    headerTextColor: '#bae6fd',
    bodyFont: 'inter',
  },
  {
    id: 'sunset',
    name: 'Atardecer',
    accentColor: '#fb923c',
    headerBgColor: '#1c1917',
    headerTextColor: '#fed7aa',
    bodyFont: 'playfair',
  },
  {
    id: 'forest',
    name: 'Bosque',
    accentColor: '#22c55e',
    headerBgColor: '#0b1725',
    headerTextColor: '#bbf7d0',
    bodyFont: 'lato',
  },
  {
    id: 'sand',
    name: 'Arena',
    accentColor: '#d97706',
    headerBgColor: '#fffbeb',
    headerTextColor: '#92400e',
    bodyFont: 'source-serif',
  },
];

const quickSteps = [
  {
    title: 'Carga tu base',
    description: 'Importa tu docx o pega texto plano para mantener tu voz.',
    icon: <HiOutlineDocumentText className="w-10 h-10 text-blue-500" />,
  },
  {
    title: 'Personaliza en vivo',
    description: 'Prueba plantillas, colores y tipografías sin perder contenido.',
    icon: <HiOutlineAdjustmentsHorizontal className="w-10 h-10 text-indigo-500" />,
  },
  {
    title: 'Entrega pulida',
    description: 'Descarga en PDF carta listo para impresión y ATS friendly.',
    icon: <HiOutlineCloudArrowDown className="w-10 h-10 text-emerald-500" />,
  },
];

const mergeResumeData = (incoming: ResumeData, current: ResumeData): ResumeData => {
  const safeList = (items?: string[]) => items?.filter((item) => Boolean(item && item.trim().length > 0)) ?? [];

  return {
    ...current,
    ...incoming,
    personalInfo: {
      ...current.personalInfo,
      ...incoming.personalInfo,
    },
    summary: incoming.summary?.trim() || current.summary,
    experience: incoming.experience?.map((exp) => ({
      ...exp,
      description: safeList(exp.description),
    })) ?? current.experience,
    education: incoming.education ?? current.education,
    skills: safeList(incoming.skills) || current.skills,
    languages: safeList(incoming.languages) || current.languages,
    htmlResume: incoming.htmlResume?.trim() || current.htmlResume,
  };
};

const TeamList = () => {
  const teamMembers = [
    { id: 1, firstName: 'Cristian', lastName: 'Martínez', role: 'Fundador · Producto', focus: 'Experiencia de usuario' },
    { id: 2, firstName: 'Pablo', lastName: 'Gutiérrez', role: 'Ingeniero de Datos', focus: 'Infraestructura y APIs' },
    { id: 3, firstName: 'Yashira', lastName: 'Rivera', role: 'Diseño UX', focus: 'Narrativas visuales' },
    { id: 4, firstName: 'Melissa', lastName: 'Pérez', role: 'Marketing', focus: 'Comunidad y aliados' },
    { id: 5, firstName: 'Víctor', lastName: 'González', role: 'Ingeniero Fullstack', focus: 'Integraciones' },
    { id: 6, firstName: 'Elizabeth', lastName: 'Crespo', role: 'Talent Partner', focus: 'Programas de mentoría' },
    { id: 7, firstName: 'Alfredo', lastName: 'Colón', role: 'QA & Soporte', focus: 'Calidad y accesibilidad' },
  ];

  return (
    <div className="rounded-2xl bg-white/10 border border-white/15 shadow-2xl p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-blue-100 font-semibold">Voluntariado</p>
          <h3 className="text-xl font-bold text-white">Conoce a quienes hacen esto posible</h3>
        </div>
        <span className="px-3 py-1 text-[11px] font-bold rounded-full bg-white/10 border border-white/20 text-white">Equipo Code Gym</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/10 p-4 shadow-inner hover:border-blue-200/70 hover:shadow-xl transition"
          >
            <div className="shrink-0 rounded-full w-12 h-12 bg-gradient-to-br from-blue-200 via-blue-400 to-indigo-500 text-slate-900 font-extrabold flex items-center justify-center">
              {member.firstName[0]}
              {member.lastName[0]}
            </div>
            <div className="flex-1 text-white">
              <p className="font-semibold text-lg leading-tight">
                {member.firstName} {member.lastName}
              </p>
              <p className="text-blue-100 text-sm">{member.role}</p>
              <p className="text-xs text-blue-50 mt-1">{member.focus}</p>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/20 text-blue-50">PR</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ResumeBuilder: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateStyle>('modern');
  const [themeOverrides, setThemeOverrides] = useState<Required<ThemeOverrides>>(templateThemeDefaults.modern);
  const [previewMode, setPreviewMode] = useState<'ai' | 'manual'>('manual');
  const [manualOverride, setManualOverride] = useState(false);

  const handleGenerate = useCallback(async ({ text, jobDescription, jobLink }: ResumeGenerationRequest) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, jobDescription, jobLink }),
      });

      if (!response.ok) {
        const { error: message } = await response.json();
        throw new Error(message || 'Error generando el currículum.');
      }

      const newData = await response.json();
      setResumeData((prev) => mergeResumeData(newData, prev));
      const hasHtml = Boolean(newData.htmlResume?.trim());
      setManualOverride((prev) => (hasHtml ? prev : false));
      setPreviewMode(hasHtml && !manualOverride ? 'ai' : 'manual');
      if (window.innerWidth < 1024) {
        setShowPreviewMobile(true);
      }
    } catch (error) {
      alert('Hubo un error generando el currículum. Por favor revisa tu API Key o intenta nuevamente.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDownloadPDF = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const previousMobileState = showPreviewMobile;

    const revealPreviewIfHidden = async () => {
      const preview = document.getElementById('resume-preview');
      const hasSize = preview instanceof HTMLElement && preview.offsetHeight > 0 && preview.offsetWidth > 0;

      if (!hasSize) {
        setShowPreviewMobile(true);
        await wait(400);
      }

      const refreshedPreview = document.getElementById('resume-preview');
      if (!(refreshedPreview instanceof HTMLElement) || refreshedPreview.offsetHeight === 0 || refreshedPreview.offsetWidth === 0) {
        return null;
      }
      return refreshedPreview;
    };

    try {
      const previewElement = await revealPreviewIfHidden();

      await (document.fonts?.ready ?? Promise.resolve());
      await wait(150);

      if (!(previewElement instanceof HTMLElement)) {
        throw new Error('Vista previa no disponible');
      }

      previewElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await wait(200);

      const [{ jsPDF }, html2canvas] = await Promise.all([
        import('jspdf'),
        import('html2canvas').then((module) => module.default),
      ]);

      const canvas = await html2canvas(previewElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        onclone(cloneDocument) {
          const cloned = cloneDocument.getElementById('resume-preview');
          if (cloned instanceof HTMLElement) {
            cloned.style.boxShadow = 'none';
          }
        },
      });

      const pdf = new jsPDF('p', 'pt', 'letter');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgData = canvas.toDataURL('image/png');
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = Math.min(pageWidth / canvasWidth, pageHeight / canvasHeight);
      const printWidth = canvasWidth * ratio;
      const printHeight = canvasHeight * ratio;
      const offsetX = (pageWidth - printWidth) / 2;
      const offsetY = (pageHeight - printHeight) / 2;

      pdf.addImage(imgData, 'PNG', offsetX, offsetY, printWidth, printHeight, undefined, 'FAST');
      pdf.save('resume.pdf');
    } catch (error) {
      console.error('Error al generar el PDF automáticamente', error);
      alert('No se pudo generar el PDF. Intenta nuevamente.');
    } finally {
      if (!previousMobileState) {
        setShowPreviewMobile(previousMobileState);
      }
      setIsDownloading(false);
    }
  };

  const previewData = previewMode === 'manual' ? { ...resumeData, htmlResume: undefined } : resumeData;
  const isAiLayoutActive = previewMode === 'ai' && Boolean(resumeData.htmlResume?.trim());

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-pr-blue to-pr-dark-blue p-2 rounded-xl shadow-lg">
                <HiOutlineDocumentText className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-2xl tracking-tight text-slate-800 leading-none">Resume Builder</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className={`hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg transform active:scale-95 ${isDownloading ? 'bg-slate-400 cursor-not-allowed opacity-80' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                <HiOutlineArrowDownTray className="w-4 h-4" />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Tabs */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-20 z-40 no-print shadow-sm">
        <div className="flex text-sm font-medium text-center text-gray-500">
           <button 
             onClick={() => setShowPreviewMobile(false)}
             className={`flex-1 p-4 border-b-2 transition-colors ${!showPreviewMobile ? 'border-pr-blue text-pr-blue font-bold' : 'border-transparent hover:text-gray-600'}`}
           >
             1. Editar Datos
           </button>
           <button 
             onClick={() => setShowPreviewMobile(true)}
             className={`flex-1 p-4 border-b-2 transition-colors ${showPreviewMobile ? 'border-pr-blue text-pr-blue font-bold' : 'border-transparent hover:text-gray-600'}`}
           >
             2. Vista Previa
           </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow max-w-[90rem] mx-auto w-full p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* Editor Side (Left) */}
        <div className={`lg:w-[400px] xl:w-[450px] flex-shrink-0 flex flex-col gap-6 ${showPreviewMobile ? 'hidden lg:flex' : 'flex'} no-print`}>
           <InputSection onGenerate={handleGenerate} isLoading={isLoading} />

             <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
             <div className="flex items-start justify-between mb-4">
               <div>
                 <h2 className="text-2xl font-bold text-slate-800 font-serif mb-1">2. Elige tu estilo</h2>
                 <p className="text-slate-600 text-sm">Selecciona cómo quieres que se vea tu CV. Puedes cambiarlo cuando quieras.</p>
               </div>
               <span className="text-[10px] uppercase tracking-[0.15em] font-bold bg-pr-blue text-white px-3 py-1 rounded-full">Nuevo</span>
             </div>

              {resumeData.htmlResume && (
                <div className="mb-4 p-4 rounded-lg border border-indigo-100 bg-indigo-50/70 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-md text-pr-blue shadow-sm">
                      <HiOutlineSparkles className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-800">La IA envió un diseño completo.</p>
                      <p className="text-sm text-slate-600">
                        Puedes usarlo tal cual o volver al modo editable para aplicar plantillas y tipografías.
                      </p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setManualOverride(false);
                        setPreviewMode('ai');
                      }}
                      className={`w-full px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                        previewMode === 'ai'
                          ? 'border-pr-blue bg-white text-pr-blue shadow-sm'
                          : 'border-slate-200 bg-white hover:border-pr-blue/50 text-slate-700'
                      }`}
                    >
                      Usar diseño de la IA
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setManualOverride(true);
                        setPreviewMode('manual');
                      }}
                      className={`w-full px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                        previewMode === 'manual'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-emerald-200 text-slate-700'
                      }`}
                    >
                      Aplicar plantillas editables
                    </button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      if (resumeData.htmlResume) {
                        setManualOverride(true);
                      }
                      if (isAiLayoutActive) {
                        setPreviewMode('manual');
                      }
                      setSelectedTemplate(template.id);
                      setThemeOverrides(templateThemeDefaults[template.id]);
                    }}
                    className={`text-left p-4 rounded-lg border transition-all duration-200 flex justify-between items-center gap-3 hover:-translate-y-[2px] ${
                      selectedTemplate === template.id
                        ? 'border-pr-blue bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-slate-50 hover:border-pr-blue/50'
                    } ${isAiLayoutActive ? 'opacity-80' : ''}`}
                  >
                    <div>
                      <p className="text-xs uppercase text-slate-500 font-semibold mb-1 flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white border text-[10px] font-bold text-slate-600">{template.badge}</span>
                        Plantilla
                      </p>
                      <h3 className="text-lg font-bold text-slate-800">{template.name}</h3>
                      <p className="text-sm text-slate-600">{template.description}</p>
                    </div>
                    <div className={`w-16 h-16 rounded-md border overflow-hidden ${selectedTemplate === template.id ? 'border-pr-blue bg-gradient-to-br from-pr-blue/20 to-pr-dark-blue/30' : 'border-slate-200 bg-white'}`}>
                      <div className="h-1/2" style={{ background: templateThemeDefaults[template.id].headerBgColor }}></div>
                      <div className="h-1/2" style={{ background: templateThemeDefaults[template.id].accentColor }}></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

             <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
             <div className="flex items-start justify-between mb-4">
               <div>
                 <h2 className="text-2xl font-bold text-slate-800 font-serif mb-1">3. Personaliza tu look</h2>
                  <p className="text-slate-600 text-sm">
                    La IA ajusta el tono, los colores y la estructura por ti. Si necesitas cambios, vuelve a pedirlos en el
                    prompt; aquí solo eliges la tipografía que refleje tu voz.
                  </p>
               </div>
               {isAiLayoutActive && (
                 <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">Activa “Aplicar plantillas editables” para modificar estas opciones</span>
               )}
               <button
                 type="button"
                 onClick={() => setThemeOverrides(templateThemeDefaults[selectedTemplate])}
                className="text-xs font-semibold text-pr-blue hover:text-pr-dark-blue underline underline-offset-4 whitespace-nowrap ml-4"
               >
                 Restablecer
               </button>
             </div>

              <div className="mb-8">
                <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-100 bg-blue-50/70">
                  <div className="p-2 bg-white rounded-md text-pr-blue shadow-sm">
                    <HiOutlineSparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800">Edición guiada por IA</p>
                    <p className="text-sm text-slate-600">
                      Para cualquier ajuste de contenido o tono, escribe nuevas indicaciones en el panel de entrada. El sistema
                      regenerará la versión con tus cambios y mantendrá la coherencia visual.
                    </p>
                  </div>
                </div>
              </div>

             {/* Typography Section */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <HiOutlineSwatch className="w-4 h-4 text-pr-blue" />
                  Tipografía (tu única elección manual)
                </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setThemeOverrides((prev) => ({ ...prev, bodyFont: font.id }))}
                      className={`flex items-center justify-between gap-3 p-4 rounded-lg border-2 transition-all ${
                        themeOverrides.bodyFont === font.id
                          ? 'border-pr-blue bg-blue-50/50 shadow-md'
                          : 'border-slate-200 bg-white hover:border-pr-blue/30 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col text-left">
                        <span className={`${font.className} text-base font-semibold`}>{font.label}</span>
                        <span className="text-xs font-normal text-slate-500 mt-0.5">{font.description}</span>
                      </div>
                      {themeOverrides.bodyFont === font.id && (
                        <HiOutlineCheckCircle className="w-5 h-5 text-pr-blue flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
        </div>

        {/* Preview Side (Right) */}
        <div className={`flex-grow lg:w-1/2 flex flex-col items-center justify-start ${!showPreviewMobile ? 'hidden lg:flex' : 'flex'}`}>
          <div className="sticky top-24 w-full max-w-[21.59cm] transition-all duration-300 ease-in-out px-4 lg:px-0 pb-10">
            
            {/* Mobile Download Button (Visible only when preview is active on mobile) */}
            <div className="lg:hidden mb-6 w-full">
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className={`w-full flex justify-center items-center gap-2 px-5 py-3 rounded-xl text-white font-medium shadow-lg ${
                  isDownloading ? 'bg-slate-400' : 'bg-slate-900 active:scale-95'
                }`}
              >
                {isDownloading ? (
                  <>Generando PDF...</>
                ) : (
                  <>
                    <HiOutlineArrowDownTray className="w-5 h-5" />
                    Descargar PDF
                  </>
                )}
              </button>
            </div>

            {/* Preview Container */}
            <div className="relative group">
              {isDownloading && (
                <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-sm text-slate-800">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800 mb-3"></div>
                  <p className="font-semibold animate-pulse">Preparando tu documento...</p>
                </div>
              )}

              {/* Resume Render - ID is crucial for html2canvas */}
              <div
                id="resume-preview"
                className="bg-white shadow-2xl transition-shadow duration-300 min-h-[27.94cm] w-full"
              >
                <ResumePreview
                  data={previewData}
                  template={selectedTemplate}
                  themeOverrides={themeOverrides}
                />
              </div>
            </div>
            
            <p className="text-center text-slate-400 text-xs mt-6 lg:mb-0 mb-10 no-print">
              Vista previa en tiempo real. El PDF final tendrá calidad de impresión (300 DPI).
            </p>
          </div>
        </div>
      </main>

      {/* Footer / Team Section */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-auto no-print relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                   <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="text-xl font-bold text-white tracking-tight">Resume Builder</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Herramienta de código abierto diseñada para simplificar la creación de currículums ATS-friendly. 
                Sin registros forzosos, sin marcas de agua y enfocado en la privacidad de tus datos.
              </p>
              <div className="flex gap-4">
                {/* Social placeholders */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 cursor-pointer transition"></div>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <TeamList />
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} Resume Builder Project. Open Source.</p>
            <div className="flex gap-6">
              <span className="hover:text-slate-300 cursor-pointer">Privacidad</span>
              <span className="hover:text-slate-300 cursor-pointer">Términos</span>
              <span className="hover:text-slate-300 cursor-pointer">GitHub</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResumeBuilder;