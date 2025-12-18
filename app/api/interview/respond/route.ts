import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { runLiveInterviewTurn } from '@/services/liveInterview';

interface InterviewMessage {
  role: 'user' | 'ai';
  text: string;
}

export const runtime = 'nodejs';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const buildHistoryContext = (history: InterviewMessage[]): string => {
  if (!history?.length) return '';
  const condensed = history
    .map((entry) => `${entry.role === 'user' ? 'Candidate' : 'Gemini'}: ${entry.text}`)
    .join('\n');
  return `\n\nConversation so far (keep style consistent):\n${condensed}`;
};

export async function POST(request: Request) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API Key is missing. Configure GEMINI_API_KEY or API_KEY in the environment.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const prompt: string = (body?.prompt ?? '').toString().trim();
    const history: InterviewMessage[] = Array.isArray(body?.history) ? body.history : [];

    if (!prompt) {
      return NextResponse.json({ error: 'Comparte tu pregunta para continuar la entrevista.' }, { status: 400 });
    }

    const historyContext = buildHistoryContext(history);
    const basePrompt = `Actúa como un entrevistador técnico bilingüe (Español neutro) que realiza entrevistas simuladas en vivo.

Mantén un tono cálido y directo, ofrece seguimiento breve y una pregunta a la vez.
Prioriza temas de experiencia laboral, proyectos y logro medibles. ${historyContext}\n\nÚltima entrada del candidato: ${prompt}`;

    const liveResult = await runLiveInterviewTurn(ai, basePrompt);

    if (!liveResult.reply && !liveResult.audioBase64) {
      return NextResponse.json({ error: 'No se pudo generar una respuesta.' }, { status: 500 });
    }

    return NextResponse.json({
      reply: liveResult.reply || 'Listo para continuar la entrevista.',
      audioBase64: liveResult.audioBase64,
      mimeType: liveResult.mimeType,
      voice: 'Zephyr',
    });
  } catch (error) {
    console.error('Interview mode error', error);
    return NextResponse.json(
      { error: 'No se pudo completar la interacción. Intenta nuevamente en unos segundos.' },
      { status: 500 }
    );
  }
}
