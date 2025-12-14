'use server';

import { GoogleGenAI, Type } from "@google/genai";
import { INITIAL_RESUME_DATA, ResumeData, ResumeGenerationRequest } from "../types";

// Initialize API Key securely on the server
const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const resumeSchema = {
  type: Type.OBJECT,
  properties: {
    personalInfo: {
      type: Type.OBJECT,
      properties: {
        fullName: { type: Type.STRING },
        jobTitle: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        location: { type: Type.STRING },
        linkedin: { type: Type.STRING },
        website: { type: Type.STRING },
      },
      required: ["fullName"],
    },
    summary: { type: Type.STRING },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING },
          role: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          description: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["company", "role", "description"],
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          institution: { type: Type.STRING },
          degree: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
        },
        required: ["institution"],
      },
    },
    skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    languages: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    htmlResume: { type: Type.STRING },
  },
  required: ["personalInfo", "summary", "experience", "education", "skills"],
};

const sanitizeHtmlSnippet = (html?: string) => {
  if (!html) return undefined;

  const withoutScripts = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  const withoutEvents = withoutScripts.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, "");
  const trimmed = withoutEvents.trim();

  return trimmed.length > 0 ? trimmed : undefined;
};

const sanitizeAiResume = (payload: ResumeData): ResumeData => {
  const cleanList = (list?: (string | undefined | null)[]) =>
    (list || []).map((item) => item?.trim()).filter((item): item is string => Boolean(item && item.length > 0));

  const cleanExperience = payload.experience?.map((exp) => ({
    company: exp.company?.trim() || "",
    role: exp.role?.trim() || "",
    startDate: exp.startDate?.trim() || "",
    endDate: exp.endDate?.trim() || "",
    description: cleanList(exp.description),
  })) || [];

  const cleanEducation = payload.education?.map((edu) => ({
    institution: edu.institution?.trim() || "",
    degree: edu.degree?.trim() || "",
    startDate: edu.startDate?.trim() || "",
    endDate: edu.endDate?.trim() || "",
  })) || [];

  return {
    ...INITIAL_RESUME_DATA,
    ...payload,
    personalInfo: {
      ...INITIAL_RESUME_DATA.personalInfo,
      ...payload.personalInfo,
    },
    summary: payload.summary?.trim() || INITIAL_RESUME_DATA.summary,
    experience: cleanExperience,
    education: cleanEducation,
    skills: cleanList(payload.skills) || INITIAL_RESUME_DATA.skills,
    languages: cleanList(payload.languages) || INITIAL_RESUME_DATA.languages,
    htmlResume: sanitizeHtmlSnippet(payload.htmlResume),
  };
};

export const generateResumeFromText = async ({ text, jobDescription, jobLink }: ResumeGenerationRequest): Promise<ResumeData> => {
  if (!GEMINI_API_KEY) {
    throw new Error("API Key is missing. Check your environment configuration.");
  }

  const systemInstruction = `
    You are an expert professional resume writer specializing in the Puerto Rico and US job markets.
    Your goal is to transform unstructured text into a high-quality, professional resume JSON structure **and** a polished HTML resume layout built with TailwindCSS utility classes that will fit neatly within an 8.5x11in preview container.

    CONTEXT:
    - Target audience: Recruiters in Puerto Rico and USA.
    - Standard Format: Chronological, clean, professional.

    INSTRUCTIONS:
    1. **Language**: Output primarily in Spanish (Neutral/Puerto Rico). If the input is heavily English, maintain English for proper nouns but format descriptions in Spanish unless the user seems to want an English resume. Default to Spanish.
    2. **Contact Info**: Extract phone (format: (XXX) XXX-XXXX), email, LinkedIn. If location is missing but context implies PR, suggest "Puerto Rico".
    3. **Experience**:
       - Rewrite bullet points to start with strong action verbs (e.g., "Implementé", "Dirigí", "Aumenté").
       - Quantify achievements where possible (e.g., "aumentó ventas un 20%").
       - If dates are missing, use "Presente" or estimate based on context, or leave blank if unknown.
    4. **Skills**: Extract hard skills (software, tools) and soft skills relevant to the role.
    5. **Education**: Format nicely (e.g., "Universidad de Puerto Rico" instead of "UPR").
    6. **Tone**: Professional, confident, concise.
    7. **HTML Layout**: Always populate "htmlResume" with a single self-contained HTML/JSX snippet. Use Tailwind utility classes only (no <html> or <head> tags). Respect an 8.5x11in canvas by using wrappers like <div class="max-w-[8.5in] min-h-[11in] mx-auto p-10"> and balanced spacing to avoid overflow. Ensure headings, contact info, sections, and bullet points are neatly arranged and readable when printed.

    INPUT HANDLING:
    - The input might be raw text, una lista de empleos o un PDF de LinkedIn.
    - Ignore irrelevant text (like "References available upon request").
    - If the input is very short, creatively expand on implied duties for that specific job title to provide a good starting draft.
    - Si se comparte una descripción de puesto, adapta el resumen y los logros para enfatizar competencias solicitadas (sin inventar información no presente).
    - Si se incluye un enlace de vacante, úsalo solo como referencia contextual. No inventes detalles ni nombres de empresa que no aparezcan en el texto proporcionado.
  `;

  try {
    const roleContext = jobDescription
      ? `\n\nTARGET JOB DESCRIPTION PROVIDED BY USER:\n${jobDescription}\n`
      : '';
    const linkContext = jobLink ? `\n\nJOB POSTING LINK (reference only, do not fabricate unseen details): ${jobLink}` : '';

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Please create a professional resume from the following text:\n\n${text || 'User did not provide resume text.'}${roleContext}${linkContext}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: resumeSchema,
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text) as ResumeData;
      return sanitizeAiResume(parsed);
    } else {
      throw new Error("No content generated.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate resume.");
  }
};