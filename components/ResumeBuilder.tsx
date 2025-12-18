'use client';

import React, { useState, useCallback } from 'react';
import { HiOutlineArrowDownTray, HiOutlineDocumentText } from 'react-icons/hi2';
import { mergeResumeData } from '../services/resumeUtils';
import { INITIAL_RESUME_DATA, ResumeData, ResumeGenerationRequest } from '../types';
import { InputSection } from './InputSection';
import InterviewMode from './InterviewMode';
import TemplateSelector from './TemplateSelector';
import TeamList from './TeamList';
import ThemeCustomizer from './ThemeCustomizer';
import { FontFamilyId, ResumePreview, TemplateStyle, ThemeOverrides } from './ResumePreview';
import { templateThemeDefaults } from './resumeOptions';

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
        scale: 2.5,
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
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      let remainingHeight = imgHeight;

      while (remainingHeight > pageHeight) {
        position -= pageHeight;
        remainingHeight -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      }

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

  const handleTemplateSelect = useCallback(
    (templateId: TemplateStyle) => {
      const hasAiLayout = previewMode === 'ai' && Boolean(resumeData.htmlResume?.trim());

      if (resumeData.htmlResume) {
        setManualOverride(true);
      }

      if (hasAiLayout) {
        setPreviewMode('manual');
      }

      setSelectedTemplate(templateId);
      setThemeOverrides(templateThemeDefaults[templateId]);
    },
    [previewMode, resumeData.htmlResume]
  );

  const handleFontChange = useCallback((fontId: FontFamilyId) => {
    setThemeOverrides((prev) => ({ ...prev, bodyFont: fontId }));
  }, []);

  const handleThemeReset = useCallback(() => {
    setThemeOverrides(templateThemeDefaults[selectedTemplate]);
  }, [selectedTemplate]);

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

          <InterviewMode />

          {resumeData.htmlResume && (
            <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-white rounded-md text-pr-blue shadow-sm">
                  <HiOutlineDocumentText className="w-5 h-5" />
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

          <TemplateSelector
            selectedTemplate={selectedTemplate}
            isAiLayoutActive={isAiLayoutActive}
            onTemplateSelect={handleTemplateSelect}
          />

          <ThemeCustomizer
            themeOverrides={themeOverrides}
            isAiLayoutActive={isAiLayoutActive}
            onFontChange={handleFontChange}
            onResetTheme={handleThemeReset}
          />
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