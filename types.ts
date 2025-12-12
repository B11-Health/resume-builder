export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  languages: string[];
  /**
   * Optional HTML representation of the résumé when the AI wants full design control.
   * The HTML should be Tailwind-first, self contained (no <html> or <head>), and fit inside
   * the preview container.
   */
  htmlResume?: string;
}

export interface ResumeGenerationRequest {
  text: string;
  jobDescription?: string;
  jobLink?: string;
}

export const INITIAL_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: "Nombre Apellido",
    jobTitle: "Título Profesional",
    email: "correo@ejemplo.com",
    phone: "(787) 555-0123",
    location: "San Juan, PR"
  },
  summary: "Resumen profesional generado por IA aparecerá aquí...",
  experience: [],
  education: [],
  skills: ["Habilidad 1", "Habilidad 2"],
  languages: ["Español (Nativo)", "Inglés (Fluido)"],
  htmlResume: undefined,
};