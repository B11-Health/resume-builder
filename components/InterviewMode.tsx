'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  HiOutlineMicrophone,
  HiOutlineMicrophoneOff,
  HiOutlinePlayCircle,
  HiOutlineStopCircle,
  HiOutlineVideoCamera,
  HiOutlineSparkles,
} from 'react-icons/hi2';

interface InterviewMessage {
  role: 'user' | 'ai';
  text: string;
}

const decodeBase64ToArrayBuffer = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const playAudioFromBase64 = async (base64?: string) => {
  if (!base64) return;
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(decodeBase64ToArrayBuffer(base64));
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
};

const InterviewMode: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<InterviewMessage[]>([
    {
      role: 'ai',
      text: 'Activa la entrevista para simular un panel en vivo. Puedes hablar y escuchar respuestas generadas con Gemini Native Audio.',
    },
  ]);
  const [manualPrompt, setManualPrompt] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [micSupported, setMicSupported] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const hasSpeechSupport =
      typeof window !== 'undefined' &&
      (!!(window as any).webkitSpeechRecognition || !!(window as any).SpeechRecognition);
    setMicSupported(hasSpeechSupport);
  }, []);

  const stopInterview = useCallback(() => {
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    mediaStreamRef.current?.getTracks()?.forEach((track) => track.stop());
    mediaStreamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setLiveTranscript('');
  }, []);

  useEffect(() => {
    return () => stopInterview();
  }, [stopInterview]);

  const handlePrompt = useCallback(
    async (prompt: string, fromMic = false) => {
      if (!prompt.trim()) return;
      setError(null);
      const nextHistory: InterviewMessage[] = [...messages, { role: 'user', text: prompt }];
      setMessages(nextHistory);
      setManualPrompt('');
      setIsProcessing(true);

      try {
        const response = await fetch('/api/interview/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, history: nextHistory }),
        });

        if (!response.ok) {
          const { error: message } = await response.json();
          throw new Error(message || 'No se pudo obtener respuesta.');
        }

        const data = (await response.json()) as { reply: string; audioBase64?: string };
        setMessages((prev) => [...prev, { role: 'ai', text: data.reply }]);
        await playAudioFromBase64(data.audioBase64);
      } catch (err) {
        console.error(err);
        setError('No pudimos procesar la entrevista en este momento.');
      } finally {
        setIsProcessing(false);
        if (!fromMic) {
          setLiveTranscript('');
        }
      }
    },
    [messages]
  );

  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      (typeof window !== 'undefined' && (window as any).SpeechRecognition) ||
      (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition);

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-PR';

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      if (result.isFinal) {
        setLiveTranscript('');
        handlePrompt(transcript.trim(), true);
      } else {
        setLiveTranscript(transcript);
      }
    };

    recognition.onerror = (e: any) => {
      console.error('Speech recognition error', e);
      setError('No pudimos escuchar tu audio. Intenta de nuevo o escribe tu pregunta.');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [handlePrompt]);

  const startInterview = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      mediaStreamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsActive(true);
      setError(null);
      startSpeechRecognition();
    } catch (err) {
      console.error(err);
      setError('Necesitamos acceso a tu micrófono y cámara para iniciar la simulación.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-pr-blue rounded-xl">
            <HiOutlineSparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-pr-blue">Nuevo</p>
            <h3 className="text-lg font-bold text-slate-800">Entrevista en vivo (Gemini Native Audio)</h3>
            <p className="text-sm text-slate-600">Simula una entrevista con audio generado en tiempo real y vista previa de cámara.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 hidden lg:inline">Modo beta</span>
          {isActive ? (
            <button
              onClick={stopInterview}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
            >
              <HiOutlineStopCircle className="w-5 h-5" />
              Detener
            </button>
          ) : (
            <button
              onClick={startInterview}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
            >
              <HiOutlinePlayCircle className="w-5 h-5" />
              Iniciar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="relative aspect-video bg-slate-50 border border-dashed border-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
          {isActive && <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />}
          {!isActive && (
            <div className="text-center text-slate-500 text-sm flex flex-col items-center gap-2">
              <HiOutlineVideoCamera className="w-8 h-8" />
              <p>Activa la cámara para ver la entrevista en vivo.</p>
            </div>
          )}
          {!micSupported && (
            <span className="absolute bottom-2 right-2 text-[11px] bg-white/90 px-2 py-1 rounded-full border border-slate-200 text-slate-600">
              Dictado no disponible en este navegador
            </span>
          )}
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 h-full flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-600 text-xs">
            {isActive ? <HiOutlineMicrophone className="w-4 h-4 text-emerald-600" /> : <HiOutlineMicrophoneOff className="w-4 h-4 text-slate-400" />}
            <span>{isActive ? 'Grabando. Haz tu pregunta en voz alta o escribe abajo.' : 'Micrófono en espera.'}</span>
          </div>
          {liveTranscript && <p className="text-sm text-slate-800 italic">Escuchando: “{liveTranscript}”</p>}
          <div className="flex flex-col gap-2 overflow-y-auto max-h-52 pr-1">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg text-sm leading-relaxed ${
                  msg.role === 'ai'
                    ? 'bg-white border border-indigo-100 text-slate-800 shadow-sm'
                    : 'bg-emerald-50 border border-emerald-100 text-emerald-800'
                }`}
              >
                <span className="block text-[11px] uppercase font-semibold tracking-wide mb-1 text-slate-500">
                  {msg.role === 'ai' ? 'Entrevistador' : 'Tú'}
                </span>
                {msg.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-800">¿Prefieres escribir tu respuesta?</label>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            value={manualPrompt}
            onChange={(e) => setManualPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handlePrompt(manualPrompt);
              }
            }}
            placeholder="Ej. Cuéntame sobre tu proyecto más retador..."
            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pr-blue"
          />
          <button
            onClick={() => handlePrompt(manualPrompt)}
            disabled={isProcessing}
            className="px-4 py-3 rounded-lg bg-pr-blue text-white font-semibold hover:bg-pr-dark-blue disabled:opacity-50"
          >
            {isProcessing ? 'Generando...' : 'Enviar'}
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default InterviewMode;
