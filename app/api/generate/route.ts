import { NextResponse } from 'next/server';
import { generateResumeFromText } from '@/services/geminiService';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Se requiere un texto válido para generar el currículum.' },
        { status: 400 }
      );
    }

    const resume = await generateResumeFromText(text);
    return NextResponse.json(resume, { status: 200 });
  } catch (error) {
    console.error('Error generando el currículum', error);
    return NextResponse.json(
      { error: 'No se pudo generar el currículum. Inténtalo nuevamente más tarde.' },
      { status: 500 }
    );
  }
}
