'use client';

import React, { useState, useRef } from 'react';
import { Spinner } from './Spinner';
import * as mammoth from 'mammoth';

interface InputSectionProps {
  onGenerate: (text: string) => Promise<void>;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onGenerate, isLoading }) => {
  const [inputText, setInputText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError("Por favor ingresa información o sube un archivo.");
      return;
    }
    setError(null);
    await onGenerate(inputText);
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
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 font-serif mb-2">1. Ingresa tus datos</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Sube tu currículum actual (Word/Txt) o copia y pega el texto. Nuestra IA organizará y mejorará el contenido profesionalmente.
        </p>
      </div>

      <div className="flex-grow flex flex-col gap-4">
        <div 
          className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors duration-200 ${dragActive ? 'border-pr-blue bg-blue-50' : 'border-gray-300 bg-slate-50'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
             <div className="text-center">
               <svg className="mx-auto h-10 w-10 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                 <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
               <div className="mt-2 flex text-sm text-slate-600 justify-center">
                 <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-pr-blue hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pr-blue">
                   <span>Sube un archivo</span>
                   <input id="file-upload" name="file-upload" type="file" ref={fileInputRef} className="sr-only" accept=".txt,.md,.docx" onChange={handleFileUpload} />
                 </label>
                 <p className="pl-1">o arrastra y suelta</p>
               </div>
               <p className="text-xs text-slate-500">
                 DOCX, TXT hasta 5MB
               </p>
             </div>
        </div>

        <textarea
          className="w-full flex-grow min-h-[200px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pr-blue focus:border-transparent resize-none font-mono text-sm bg-white text-slate-800 placeholder-slate-400 shadow-inner"
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
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-center gap-2 animate-pulse">
           <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="mt-6 w-full py-4 px-6 bg-gradient-to-r from-pr-blue to-pr-dark-blue text-white rounded-lg font-bold shadow-md hover:shadow-lg transform active:scale-[0.99] transition-all duration-200 flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Spinner />
            <span>Optimizando con IA...</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            <span className="text-lg">Generar CV Profesional</span>
          </>
        )}
      </button>
    </div>
  );
};