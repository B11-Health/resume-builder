'use client';

import React, { useState, useRef } from 'react';
import { Spinner } from './Spinner';
import * as mammoth from 'mammoth';
import { ResumeGenerationRequest } from '../types';
import { HiOutlineArrowUpTray, HiOutlineExclamationCircle, HiOutlineSparkles } from 'react-icons/hi2';

interface InputSectionProps {
  onGenerate: (payload: ResumeGenerationRequest) => Promise<void>;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onGenerate, isLoading }) => {
  const [inputText, setInputText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobLink, setJobLink] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim() && !jobDescription.trim() && !jobLink.trim()) {
      setError("Comparte tu CV, descripción del puesto o enlace para personalizar el resultado.");
      return;
    }
    setError(null);
    await onGenerate({
      text: inputText.trim(),
      jobDescription: jobDescription.trim() || undefined,
      jobLink: jobLink.trim() || undefined,
    });
  };

  const processFile = (file: File) => {
    setError(null);
    
    if (file.name.endsWith('.docx')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        mammoth.extractRawText({ arrayBuffer: arrayBuffer })
          .then((result: any) => {
             const text = result.value; 
             setInputText(prev => prev + "\n\n" + text);
          })
          .catch((err: any) => {
            console.error(err);
            setError("Error al leer el archivo Word. Intenta copiar y pegar el texto.");
          });
      };
      reader.readAsArrayBuffer(file);
    } else if (file.type === "text/plain" || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInputText(prev => prev + "\n\n" + content);
      };
      reader.onerror = () => {
        setError("Error al leer el archivo. Intenta copiar y pegar el texto.");
      };
      reader.readAsText(file);
    } else {
      setError("Formato no soportado directamente. Por favor copia y pega el contenido de tu PDF aquí.");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700 flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white font-serif mb-2">1. Ingresa tus datos</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Sube tu currículum actual (Word/Txt) o copia y pega el texto. Nuestra IA pule solo el contenido clave (resumen, logros y habilidades) y el diseño se mantiene con plantillas consistentes.
        </p>
      </div>

      <div className="flex-grow flex flex-col gap-4">
        <div
          className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors duration-200 ${dragActive ? 'border-blue-500 bg-gray-700' : 'border-gray-600 bg-gray-900'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
            <div className="text-center">
              <HiOutlineArrowUpTray className="mx-auto h-10 w-10 text-gray-500" aria-hidden="true" />
              <div className="mt-2 flex text-sm text-gray-400 justify-center">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-900 rounded-md font-medium text-blue-500 hover:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Sube un archivo</span>
                   <input id="file-upload" name="file-upload" type="file" ref={fileInputRef} className="sr-only" accept=".txt,.md,.docx" onChange={handleFileUpload} />
                 </label>
                 <p className="pl-1">o arrastra y suelta</p>
               </div>
               <p className="text-xs text-gray-500">
                 DOCX, TXT hasta 5MB
               </p>
             </div>
        </div>

        <textarea
          className="w-full flex-grow min-h-[200px] p-4 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm bg-gray-900 text-white placeholder-gray-500 shadow-inner"
          placeholder="O pega tu texto aquí...
Ejemplo:
Juan Pérez
Gerente de Ventas
Experiencia:
- 2019-2023: Lideré equipo de 10 personas en San Juan...
Educación:
- UPR Mayagüez, Ingeniería..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        <div className="bg-gray-900 border border-blue-500/30 rounded-lg p-4 space-y-3 shadow-inner">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase font-bold text-blue-500 tracking-wide">Opcional</p>
              <h3 className="text-lg font-bold text-white">Personaliza para tu próximo empleo</h3>
              <p className="text-sm text-gray-400">Agrega la descripción del puesto o el enlace de la vacante para adaptar el CV a esa oportunidad.</p>
            </div>
            <span className="text-[10px] uppercase bg-gray-800 text-orange-500 border border-orange-500/30 rounded-full px-2 py-1 font-semibold">Mejor coincidencia</span>
          </div>

          <label className="block">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-white">Descripción del puesto</span>
              <span className="text-[11px] text-gray-500">Pega el perfil completo</span>
            </div>
            <textarea
              className="w-full min-h-[110px] p-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-white bg-gray-800"
              placeholder="Ej. Buscamos un Gerente de Ventas con experiencia en SaaS, manejo de KPIs y liderazgo de equipos..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </label>

          <label className="block">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-white">Enlace de la vacante</span>
              <span className="text-[11px] text-gray-500">LinkedIn, Indeed, etc.</span>
            </div>
            <input
              type="url"
              className="w-full p-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-white bg-gray-800"
              placeholder="https://www.linkedin.com/jobs/view/..."
              value={jobLink}
              onChange={(e) => setJobLink(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Usaremos esta referencia para resaltar palabras clave; no inventaremos detalles que no compartas.</p>
          </label>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-900/40 text-red-400 text-sm rounded-lg border border-red-700 flex items-center gap-2 animate-pulse">
          <HiOutlineExclamationCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="mt-6 w-full py-4 px-6 bg-orange-500 text-white rounded-lg font-bold shadow-orange-500/50 shadow-md hover:shadow-orange-500/70 hover:shadow-lg transform active:scale-[0.99] transition-all duration-200 flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Spinner />
            <span>Optimizando con IA...</span>
          </>
        ) : (
          <>
            <HiOutlineSparkles className="w-5 h-5" />
            <span>Generar Currículum Optimizado con IA</span>
          </>
        )}
      </button>
    </div>
  );
};