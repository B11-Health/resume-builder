'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { INITIAL_RESUME_DATA, ResumeData, ResumeGenerationRequest } from '../types';
import { InputSection } from './InputSection';
import { ResumePreview, TemplateStyle, ThemeOverrides } from './ResumePreview';

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
    bodyFont: 'sans',
  },
  minimal: {
    accentColor: '#1f2937',
    headerBgColor: '#ffffff',
    headerTextColor: '#2563eb',
    bodyFont: 'serif',
  },
  contrast: {
    accentColor: '#fef08a',
    headerBgColor: '#0f172a',
    headerTextColor: '#fef08a',
    bodyFont: 'sans',
  },
  elegant: {
    accentColor: '#be123c',
    headerBgColor: '#f8fafc',
    headerTextColor: '#9d174d',
    bodyFont: 'serif',
  },
  vibrant: {
    accentColor: '#22d3ee',
    headerBgColor: '#0f172a',
    headerTextColor: '#cffafe',
    bodyFont: 'sans',
  },
  technical: {
    accentColor: '#7c3aed',
    headerBgColor: '#0a0f1f',
    headerTextColor: '#7dd3fc',
    bodyFont: 'sans',
  },
};

const themePresets: { id: string; name: string; accentColor: string; headerBgColor: string; headerTextColor: string; bodyFont: 'sans' | 'serif'; }[] = [
  {
    id: 'atlantic',
    name: 'Atlántico',
    accentColor: '#0ea5e9',
    headerBgColor: '#0f172a',
    headerTextColor: '#bae6fd',
    bodyFont: 'sans',
  },
  {
    id: 'sunset',
    name: 'Atardecer',
    accentColor: '#fb923c',
    headerBgColor: '#1c1917',
    headerTextColor: '#fed7aa',
    bodyFont: 'serif',
  },
  {
    id: 'forest',
    name: 'Bosque',
    accentColor: '#22c55e',
    headerBgColor: '#0b1725',
    headerTextColor: '#bbf7d0',
    bodyFont: 'sans',
  },
  {
    id: 'sand',
    name: 'Arena',
    accentColor: '#d97706',
    headerBgColor: '#fffbeb',
    headerTextColor: '#92400e',
    bodyFont: 'serif',
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
    htmlResume: undefined,
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
  const [isMobile, setIsMobile] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateStyle>('modern');
  const [themeOverrides, setThemeOverrides] = useState<Required<ThemeOverrides>>(templateThemeDefaults.modern);

  useEffect(() => {
    const handleResize = () => {
        setIsMobile(window.innerWidth < 1024);
    };
    // Set initial
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    const shouldRevealPreview = isMobile && !showPreviewMobile;
    const previousMobileState = showPreviewMobile;

    if (shouldRevealPreview) {
      setShowPreviewMobile(true);
      await wait(450);
    }

    await (document.fonts?.ready ?? Promise.resolve());
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

    const previewElement = document.getElementById('resume-preview');

    if (!(previewElement instanceof HTMLElement)) {
      alert('No se encontró la vista previa para generar el PDF.');
      if (!previousMobileState) {
        setShowPreviewMobile(previousMobileState);
      }
      setIsDownloading(false);
      return;
    }

    const { width: rectWidth, height: rectHeight } =
      previewElement.getBoundingClientRect();
    const computedWidth = Math.max(
      previewElement.scrollWidth,
      Math.round(rectWidth)
    );
    const computedHeight = Math.max(
      previewElement.scrollHeight,
      Math.round(rectHeight)
    );

    if (!computedWidth || !computedHeight) {
      alert('No se pudo preparar la vista previa para generar el PDF.');
      if (!previousMobileState) {
        setShowPreviewMobile(previousMobileState);
      }
      setIsDownloading(false);
      return;
    }

    previewElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await wait(250);

    try {
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(previewElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        width: computedWidth,
        height: computedHeight,
        windowWidth: Math.max(computedWidth, window.innerWidth),
        windowHeight: Math.max(computedHeight, window.innerHeight),
      });

      const pdf = new jsPDF('p', 'pt', 'letter');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 0;

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      if (!imgWidth || !imgHeight) {
        throw new Error('No se pudo capturar la vista previa del CV.');
      }

      const renderWidth = pageWidth - margin * 2;
      const ratio = renderWidth / imgWidth;
      const pageContentHeight = pageHeight - margin * 2;

      if ([renderWidth, ratio, pageContentHeight].some((value) => !Number.isFinite(value))) {
        throw new Error('Dimensiones inválidas al generar el PDF.');
      }

      const pageSliceHeight = Math.floor(pageContentHeight / ratio);
      const overlap = 12; // small overlap to avoid cutting lines between pages
      let remainingHeight = imgHeight;
      let positionY = 0;
      let pageIndex = 0;

      while (remainingHeight > 0) {
        const sliceHeight = Math.min(pageSliceHeight, remainingHeight);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = imgWidth;
        sliceCanvas.height = sliceHeight;

        const ctx = sliceCanvas.getContext('2d');
        if (!ctx) {
          throw new Error('No se pudo preparar el lienzo para el PDF.');
        }

        ctx.drawImage(canvas, 0, positionY, imgWidth, sliceHeight, 0, 0, imgWidth, sliceHeight);

        const imgData = sliceCanvas.toDataURL('image/png');

        if (pageIndex > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'PNG', margin, margin, renderWidth, sliceHeight * ratio, undefined, 'FAST');

        const step = Math.max(sliceHeight - overlap, sliceHeight * 0.5);
        remainingHeight -= step;
        positionY += step;
        pageIndex += 1;
      }

      pdf.save(`${resumeData.personalInfo.fullName || 'resume'}.pdf`);
    } catch (error) {
      console.error('Error generando el PDF', error);
      alert('No se pudo generar el PDF. Intenta nuevamente o utiliza la opción de imprimir como PDF de tu navegador.');
    } finally {
      if (!previousMobileState) {
        setShowPreviewMobile(previousMobileState);
      }
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-pr-blue to-pr-dark-blue p-2 rounded-xl shadow-lg">
                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
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
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                   onClick={() => {
                     setSelectedTemplate(template.id);
                     setThemeOverrides(templateThemeDefaults[template.id]);
                   }}
                    className={`text-left p-4 rounded-lg border transition-all duration-200 flex justify-between items-center gap-3 hover:-translate-y-[2px] ${selectedTemplate === template.id ? 'border-pr-blue bg-blue-50 shadow-md' : 'border-gray-200 bg-slate-50 hover:border-pr-blue/50'}`}
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
                 <p className="text-slate-600 text-sm">Ajusta colores y tipografía para que el CV refleje tu marca personal.</p>
               </div>
               <button
                 type="button"
                 onClick={() => setThemeOverrides(templateThemeDefaults[selectedTemplate])}
                 className="text-xs font-semibold text-pr-blue hover:text-pr-dark-blue underline underline-offset-4"
               >
                 Restablecer
               </button>
             </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Color de acento
                  <input
                   type="color"
                   value={themeOverrides.accentColor}
                   onChange={(e) => setThemeOverrides((prev) => ({ ...prev, accentColor: e.target.value }))}
                   className="h-10 w-full rounded border border-gray-200 cursor-pointer"
                 />
               </label>

               <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                 Fondo del encabezado
                 <input
                   type="color"
                   value={themeOverrides.headerBgColor}
                   onChange={(e) => setThemeOverrides((prev) => ({ ...prev, headerBgColor: e.target.value }))}
                   className="h-10 w-full rounded border border-gray-200 cursor-pointer"
                 />
               </label>

               <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                 Texto del encabezado
                 <input
                   type="color"
                   value={themeOverrides.headerTextColor}
                   onChange={(e) => setThemeOverrides((prev) => ({ ...prev, headerTextColor: e.target.value }))}
                   className="h-10 w-full rounded border border-gray-200 cursor-pointer"
                 />
               </label>

                <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Tipografía principal
                  <div className="flex gap-2">
                   <button
                     type="button"
                     onClick={() => setThemeOverrides((prev) => ({ ...prev, bodyFont: 'sans' }))}
                     className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${themeOverrides.bodyFont === 'sans' ? 'border-pr-blue bg-blue-50 text-pr-blue' : 'border-gray-200 bg-white hover:border-pr-blue/40'}`}
                   >
                     Sans
                   </button>
                   <button
                     type="button"
                     onClick={() => setThemeOverrides((prev) => ({ ...prev, bodyFont: 'serif' }))}
                     className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${themeOverrides.bodyFont === 'serif' ? 'border-pr-blue bg-blue-50 text-pr-blue' : 'border-gray-200 bg-white hover:border-pr-blue/40'}`}
                   >
                     Serif
                   </button>
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Temas rápidos</h3>
                    <p className="text-xs text-slate-500">Aplica una combinación curada en un click.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {themePresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setThemeOverrides(preset)}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 hover:border-pr-blue/60 hover:-translate-y-[1px] transition shadow-sm bg-white"
                    >
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-bold text-slate-800">{preset.name}</span>
                        <span className="text-xs text-slate-500">{preset.bodyFont === 'serif' ? 'Tipografía Serif' : 'Tipografía Sans'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-8 h-8 rounded-full border" style={{ backgroundColor: preset.headerBgColor }}></span>
                        <span className="w-8 h-8 rounded-full border" style={{ backgroundColor: preset.accentColor }}></span>
                        <span className="w-8 h-8 rounded-full border" style={{ backgroundColor: preset.headerTextColor }}></span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 text-sm text-slate-700 shadow-sm">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-pr-blue">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Tips para el Mercado de PR
              </h3>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <span className="text-pr-blue font-bold">•</span>
                  <span><strong>Formato USA:</strong> En PR usamos el formato estándar de EE.UU. (Letter, no A4).</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-pr-blue font-bold">•</span>
                  <span><strong>Bilingüismo:</strong> Si dominas inglés y español, ponlo visible en "Idiomas".</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-pr-blue font-bold">•</span>
                  <span><strong>Foto:</strong> Evita fotos a menos que sea para servicio al cliente o modelaje.</span>
                </li>
              </ul>
           </div>
        </div>

        {/* Preview Side (Right) */}
        <div className={`flex-grow flex flex-col items-center ${!showPreviewMobile ? 'hidden lg:flex' : 'flex'}`}>
          {/* Mobile Print Button */}
          <div className="lg:hidden w-full mb-4 no-print">
             <button
               onClick={handleDownloadPDF}
               disabled={isDownloading}
               className={`w-full flex justify-center items-center gap-2 px-4 py-4 rounded-xl font-bold transition-colors shadow-lg ${isDownloading ? 'bg-slate-400 cursor-not-allowed opacity-80' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                 Descargar PDF
               </button>
          </div>



          <div className="w-full flex justify-center lg:sticky lg:top-28">
            <ResumePreview data={resumeData} template={selectedTemplate} themeOverrides={themeOverrides} />
          </div>
        </div>

      </main>

      {/* Donation & Credits Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-14 px-4 no-print mt-auto border-t-8 border-pr-blue">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),transparent_45%)]" aria-hidden="true"></div>
        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs uppercase tracking-[0.3em] text-blue-100 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                Comunidad activa
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-black leading-tight text-white">Impulsa el talento tech de Puerto Rico</h2>
              <p className="text-blue-100 text-lg leading-relaxed max-w-3xl">
                Cada currículum generado aquí es gratis y abierto. Con tu aporte mantenemos los servidores, creamos nuevas plantillas y organizamos mentorías para que más boricuas consigan su próxima oportunidad laboral.
              </p>
              <TeamList />
            </div>

            <div className="space-y-4">
              <div className="bg-white/10 border border-white/10 rounded-2xl shadow-2xl p-6 backdrop-blur-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-blue-100 font-semibold">Apoya el proyecto</p>
                    <h3 className="text-2xl font-bold text-white">Tu donación se convierte en becas y talleres</h3>
                    <p className="text-sm text-blue-100 mt-2">Si este CV te acercó a tu próxima entrevista, considera compartir una taza de café ☕️</p>
                  </div>
                  <span className="rounded-full bg-emerald-400/20 text-emerald-100 text-xs font-semibold px-3 py-1 border border-emerald-200/30">Transparente</span>
                </div>

                <div className="space-y-3">
                  <a
                    href="https://www.paypal.com/paypalme/codegym"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 bg-[#003087] hover:bg-[#00256b] text-white px-5 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 group-hover:bg-white/20">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.076 21.337l.756-4.728H9.77a5.626 5.626 0 002.266-.35c1.33-.497 2.21-1.385 2.585-2.712.17-.604.22-1.25.127-1.895-.444-2.813-2.682-3.88-5.753-3.88h-3.32a.965.965 0 00-.955.845l-2.43 15.228a.482.482 0 00.476.558h3.31l-.478 3.123a.625.625 0 00.617.72h2.515c.376 0 .67-.327.728-.698l.018-.11z"/></svg>
                      </span>
                      <div className="text-left">
                        <p className="text-lg leading-tight">PayPal</p>
                        <p className="text-xs font-normal text-blue-100">Contribuye con tarjeta o balance.</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">paypal.me/codegym</span>
                  </a>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      className="group flex-1 flex items-center justify-between gap-4 bg-white text-slate-900 px-4 py-4 rounded-xl font-semibold transition-all shadow-lg hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF8A50] to-[#FF5500] text-white">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18"/></svg>
                        </span>
                        <div className="text-left">
                          <p className="text-lg leading-tight">ATH Móvil</p>
                          <p className="text-xs text-slate-600">Busca nuestro handle y envía al instante.</p>
                        </div>
                      </div>
                      <span className="text-sm font-mono bg-slate-900 text-white px-3 py-1 rounded-full">/codegympr</span>
                    </button>

                    <a
                      href="https://github.com/sponsors"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-between gap-4 bg-slate-800/70 hover:bg-slate-800 text-white px-4 py-4 rounded-xl font-semibold transition-all shadow-lg border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 3.99 4 6.5 4c1.54 0 3.04.99 3.57 2.36h.87C13.46 4.99 14.96 4 16.5 4 19.01 4 21 6 21 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        </span>
                        <div className="text-left">
                          <p className="text-lg leading-tight">GitHub Sponsors</p>
                          <p className="text-xs text-blue-100">Apoya el código abierto de Code Gym.</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold bg-white/10 px-3 py-1 rounded-full">Pronto</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">Prefieres apoyar de otra manera?</p>
                  <p className="text-sm text-blue-100">Escríbenos para voluntariado, mentoría o colaboraciones con tu empresa.</p>
                </div>
                <a
                  href="mailto:hola@codegympr.com"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-900 font-semibold shadow-lg hover:-translate-y-0.5 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>
                  hola@codegympr.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Small Copyright Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-6 no-print">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} CodeGym, Inc. Todos los derechos reservados.<br/>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ResumeBuilder;
