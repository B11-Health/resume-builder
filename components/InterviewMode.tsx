'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  HiOutlineMicrophone,
  HiOutlineMicrophoneOff,
  HiOutlinePlayCircle,
  HiOutlineCheckCircle,
  HiOutlineStopCircle,
  HiOutlineVideoCamera,
  HiOutlineSparkles,
} from 'react-icons/hi2';

interface InterviewMessage {
  role: 'user' | 'ai';
  text: string;
}

type AiStatus = 'idle' | 'thinking' | 'speaking';

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
  if (!base64) return null;
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(decodeBase64ToArrayBuffer(base64));
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();

  const duration = source.buffer?.duration ?? null;
  source.onended = () => audioContext.close?.();
  return duration;
};

const InterviewMode: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<InterviewMessage[]>([
    {
      role: 'ai',
      text: 'Activa la entrevista para simular un panel en vivo con audio generado por IA en tiempo real.',
    },
  ]);
  const [manualPrompt, setManualPrompt] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [micSupported, setMicSupported] = useState(false);
  const [aiStatus, setAiStatus] = useState<AiStatus>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const speechEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const hasSpeechSupport =
      typeof window !== 'undefined' &&
      (!!(window as any).webkitSpeechRecognition || !!(window as any).SpeechRecognition);
    setMicSupported(hasSpeechSupport);
  }, []);

  const stopSpeechTimer = useCallback(() => {
    if (speechEndTimeoutRef.current) {
      clearTimeout(speechEndTimeoutRef.current);
      speechEndTimeoutRef.current = null;
    }
  }, []);

  const stopInterview = useCallback(() => {
    stopSpeechTimer();
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    mediaStreamRef.current?.getTracks()?.forEach((track) => track.stop());
    mediaStreamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setLiveTranscript('');
    setAiStatus('idle');
  }, [stopSpeechTimer]);

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
      setAiStatus('thinking');

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
        const duration = await playAudioFromBase64(data.audioBase64);
        if (duration) {
          setAiStatus('speaking');
          stopSpeechTimer();
          speechEndTimeoutRef.current = setTimeout(() => setAiStatus('idle'), duration * 1000 + 400);
        } else {
          stopSpeechTimer();
          speechEndTimeoutRef.current = setTimeout(() => setAiStatus('idle'), 400);
        }
      } catch (err) {
        console.error(err);
        setError('No pudimos procesar la entrevista en este momento.');
        setAiStatus('idle');
      } finally {
        setIsProcessing(false);
        if (!fromMic) {
          setLiveTranscript('');
        }
      }
    },
    [messages, stopSpeechTimer]
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
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-pr-blue rounded-2xl shadow-sm">
            <HiOutlineSparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs uppercase font-bold text-pr-blue">
              <span className="relative inline-flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                En vivo con IA
              </span>
              <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Modo virtual</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight">Entrevista simulada en tiempo real</h3>
            <p className="text-sm text-slate-600">
              Practica respuestas, recibe follow-ups generados por IA y escucha el audio como si fuera un panel real.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-3 py-2">
            <HiOutlineCheckCircle className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>{isActive ? 'Sesión estable' : 'Listo para conectar'}</span>
          </div>
          {isActive ? (
            <button
              onClick={stopInterview}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all"
            >
              <HiOutlineStopCircle className="w-5 h-5" />
              Detener
            </button>
          ) : (
            <button
              onClick={startInterview}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all"
            >
              <HiOutlinePlayCircle className="w-5 h-5" />
              Iniciar sesión
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="relative aspect-video bg-gradient-to-br from-slate-50 via-white to-indigo-50 border border-dashed border-indigo-100 rounded-2xl overflow-hidden flex items-center justify-center">
          {isActive && <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />}
          {!isActive && (
            <div className="text-center text-slate-500 text-sm flex flex-col items-center gap-2 px-6">
              <HiOutlineVideoCamera className="w-9 h-9" />
              <p>Activa la cámara y el micrófono para ver y escuchar la simulación.</p>
            </div>
          )}
          <div className="absolute top-3 left-3 inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 border border-indigo-100 shadow-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
            {isActive ? 'Cámara encendida' : 'Cámara en espera'}
          </div>
          {!micSupported && (
            <span className="absolute bottom-3 right-3 text-[11px] bg-white/95 px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 shadow-sm">
              Dictado no disponible en este navegador
            </span>
          )}
          {liveTranscript && (
            <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 shadow-sm">
              <p className="text-[11px] uppercase font-semibold text-slate-500 tracking-wide mb-1">Escuchando</p>
              <p className="italic">“{liveTranscript}”</p>
            </div>
          )}
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 h-full flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            {isActive ? <HiOutlineMicrophone className="w-4 h-4 text-emerald-600" /> : <HiOutlineMicrophoneOff className="w-4 h-4 text-slate-400" />}
            <span className="font-semibold">{isActive ? 'Grabando y escuchando' : 'Micrófono en espera'}</span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="px-2 py-1 rounded-full bg-white border border-slate-200 text-[11px] uppercase tracking-wide font-semibold">
              {aiStatus === 'speaking' ? 'IA respondiendo en audio' : aiStatus === 'thinking' ? 'IA pensando' : 'IA lista'}
            </span>
            {isProcessing && <span className="text-emerald-600 font-semibold animate-pulse">Enviando...</span>}
          </div>

          <div className="flex items-center gap-2 text-[11px] uppercase font-semibold text-slate-500 tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Simulación continua — las preguntas y repreguntas se sienten en vivo.
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-56 pr-1" aria-live="polite">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl text-sm leading-relaxed shadow-sm border ${
                  msg.role === 'ai'
                    ? 'bg-white border-indigo-100 text-slate-800'
                    : 'bg-emerald-50 border-emerald-100 text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] uppercase font-semibold tracking-wide text-slate-500">
                    {msg.role === 'ai' ? 'Entrevistador' : 'Tú'}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="text-[11px] text-slate-400">{msg.role === 'ai' ? 'Respuesta en vivo' : 'Intervención'}</span>
                </div>
                {msg.text}
              </div>
            ))}
            {(aiStatus === 'thinking' || isProcessing) && (
              <div className="p-4 rounded-xl bg-white border border-indigo-100 text-slate-600 shadow-sm flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="h-2 w-2 rounded-full bg-indigo-300 animate-pulse delay-100" />
                  <span className="h-2 w-2 rounded-full bg-indigo-200 animate-pulse delay-200" />
                </div>
                <p className="text-sm">La IA está formulando la próxima respuesta...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">¿Prefieres escribir tu respuesta?</p>
            <p className="text-xs text-slate-500">Lo que escribas se enviará como si lo hubieras dicho en la sala virtual.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">Atajo: Enter para enviar</span>
            <span className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">Audio + Texto</span>
          </div>
        </div>
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
            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pr-blue bg-white shadow-sm"
          />
          <button
            onClick={() => handlePrompt(manualPrompt)}
            disabled={isProcessing}
            className="px-4 py-3 rounded-lg bg-pr-blue text-white font-semibold hover:bg-pr-dark-blue disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
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
