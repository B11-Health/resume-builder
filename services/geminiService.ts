'use server';

import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData } from "../types";

// Initialize API Key securely on the server
const GEMINI_API_KEY = process.env.API_KEY || '';

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
  },
  required: ["personalInfo", "summary", "experience", "education", "skills"],
};

export const generateResumeFromText = async (text: string): Promise<ResumeData> => {
  if (!GEMINI_API_KEY) {
    throw new Error("API Key is missing. Check your environment configuration.");
  }

  const systemInstruction = `
    You are an expert professional resume writer specializing in the Puerto Rico and US job markets.
    Your goal is to transform unstructured text into a high-quality, professional resume JSON structure.

    CONTEXT:
    - Target audience: Recruiters in Puerto Rico and USA.
    - Standard Format: Chronological, clean, professional.

    INSTRUCTIONS:
    1.  **Language**: Output primarily in Spanish (Neutral/Puerto Rico). If the input is heavily English, maintain English for proper nouns but format descriptions in Spanish unless the user seems to want an English resume. Default to Spanish.
    2.  **Contact Info**: Extract phone (format: (XXX) XXX-XXXX), email, LinkedIn. If location is missing but context implies PR, suggest "Puerto Rico".
    3.  **Experience**:
        - Rewrite bullet points to start with strong action verbs (e.g., "Implementé", "Dirigí", "Aumenté").
        - Quantify achievements where possible (e.g., "aumentó ventas un 20%").
        - If dates are missing, use "Presente" or estimate based on context, or leave blank if unknown.
    4.  **Skills**: Extract hard skills (software, tools) and soft skills relevant to the role.
    5.  **Education**: Format nicely (e.g., "Universidad de Puerto Rico" instead of "UPR").
    6.  **Tone**: Professional, confident, concise.

    INPUT HANDLING:
    - The input might be raw text, a list of jobs, or a LinkedIn PDF dump.
    - Ignore irrelevant text (like "References available upon request").
    - If the input is very short, creatively expand on implied duties for that specific job title to provide a good starting draft.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Please create a professional resume from the following text:\n\n${text}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: resumeSchema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ResumeData;
    } else {
      throw new Error("No content generated.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate resume.");
  }
};