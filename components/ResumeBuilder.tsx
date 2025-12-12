'use client';

import React, { useState, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';
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

const TeamList = () => {
  const teamMembers = [
    { id: 1, firstName: 'Cristian', lastName: 'Martínez' },
    { id: 2, firstName: 'Pablo', lastName: 'Gutiérrez' },
    { id: 3, firstName: 'Yashira', lastName: 'Rivera' },
    { id: 4, firstName: 'Melissa', lastName: 'Pérez' },
    { id: 5, firstName: 'Víctor', lastName: 'González' },
    { id: 6, firstName: 'Elizabeth', lastName: 'Crespo' },
    { id: 7, firstName: 'Alfredo', lastName: 'Colón' },
  ];

  return (
    <div className="max-w-xl mx-auto my-8 p-6 text-white shadow-xl rounded-lg">
      <ul className="space-y-4">
        {teamMembers.map((member) => (
          <li
            key={member.id}
            className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition duration-150 ease-in-out rounded-md border-l-4 border-indigo-500"
          >
            <span className="text-lg font-medium text-gray-700">
              {member.firstName} {member.lastName}
            </span>
          
          </li>
        ))}
      </ul>
    </div>
  );
};

const ResumeBuilder: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME_DATA);
  const [isLoading, setIsLoading] = useState(false);
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
      setResumeData(newData);
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
    const shouldRevealPreview = isMobile && !showPreviewMobile;

    if (shouldRevealPreview) {
      setShowPreviewMobile(true);
    }

    const waitForRender = shouldRevealPreview ? 450 : 150;

    setTimeout(async () => {
      const previewElement = document.getElementById('resume-preview');

      if (!previewElement) {
        alert('No se encontró la vista previa para generar el PDF.');
        return;
      }

      previewElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

      setTimeout(async () => {
        try {
          const canvas = await html2canvas(previewElement as HTMLElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
          const imgData = canvas.toDataURL('image/png');

          const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

          let heightLeft = pdfHeight;
          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pdf.internal.pageSize.getHeight();

          while (heightLeft > 0) {
            position = heightLeft - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
          }

          pdf.save(`${(new Date()).toISOString().slice(0,10)}-resume.pdf`);
        } catch (err) {
          console.error('Error generating PDF', err);
          alert('No se pudo generar el PDF. Intenta nuevamente.');
        }
      }, 150);
    }, waitForRender);
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
                className="hidden md:flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg transform active:scale-95"
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
                className="w-full flex justify-center items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-4 py-4 rounded-xl font-bold transition-colors shadow-lg"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                 Descargar PDF
               </button>
             <p className="text-xs text-center text-slate-500 mt-2">
               Se abrirá el diálogo de impresión. Selecciona <strong>"Guardar como PDF"</strong>.
             </p>
          </div>
          
          <div className="no-print mb-4 hidden lg:flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
             <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             Para guardar: Clic en Descargar → Destino: <strong>Guardar como PDF</strong>
          </div>

          <ResumePreview data={resumeData} template={selectedTemplate} themeOverrides={themeOverrides} />
        </div>

      </main>

      {/* Donation & Credits Section */}
      <section className="bg-slate-900 text-white py-12 px-4 no-print mt-auto border-t-8 border-pr-blue">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-10">
            
            {/* Logo Code Gym - Recreated via SVG for fidelity */}
            

            {/* Copy & Team */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-serif font-bold mb-3 text-white">Impulsa el Talento de Puerto Rico</h2>
              <p className="text-blue-100 mb-4 leading-relaxed">
                Esta herramienta gratuita fue creada con pasión por el equipo de <strong>Code Gym</strong>: 
                <TeamList />
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Tu donación nos permite seguir construyendo tecnología accesible y gratuita para nuestra comunidad. 
                Si este CV te ayudó a conseguir una entrevista, ¡invítanos a un café! ☕️
              </p>

              {/* Donation Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a href="#" className="pointer-events-none group bg-white hover:bg-gray-100 text-slate-900 rounded-lg px-2 py-2 flex items-center justify-between min-w-[200px] transition-all relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#FF5500] group-hover:bg-[#e04b00] transition-colors flex items-center px-4">
                        <span className="font-bold text-white text-lg">ATH Móvil</span>
                    </div>
                    <div className="ml-auto pl-28 pr-4 py-1">
                        <span className="font-mono text-white font-bold text-slate-900">/codegympr</span>
                    </div>
                </a>

                <a 
                  href="https://www.paypal.com/paypalme/codegym" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#003087] hover:bg-[#00256b] text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.076 21.337l.756-4.728H9.77a5.626 5.626 0 002.266-.35c1.33-.497 2.21-1.385 2.585-2.712.17-.604.22-1.25.127-1.895-.444-2.813-2.682-3.88-5.753-3.88h-3.32a.965.965 0 00-.955.845l-2.43 15.228a.482.482 0 00.476.558h3.31l-.478 3.123a.625.625 0 00.617.72h2.515c.376 0 .67-.327.728-.698l.018-.11z"/></svg>
                  Donar con PayPal
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
