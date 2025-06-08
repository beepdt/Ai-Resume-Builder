import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `$${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  if (error) throw error;
  return data;
};


export function transformDbRowToResumeData(row: any): Resume {
  const additionalSections =
    typeof row.additional_sections === "string"
      ? JSON.parse(row.additional_sections)
      : row.additional_sections || {};

  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    personal_info: {
      summary: row.personal_summary || "",
      full_name: row.full_name || "",
      email: row.email || "",
      phone: row.phone || "",
      location: row.location || "",
      linkedin: row.linkedin_url || "",
      websiteUrl: row.website_url || "",
    },
    experience: row.work_experience || [],
    education: row.education || [],
    skills: row.skills || [],
    projects: additionalSections.projects || [],
    certifications: additionalSections.certifications || [],
    created_at: row.created_at,
    updated_at: row.updated_at,
    
  };
}

export function transformResumeDataToDbRow(resumeData: Resume) {
  return {
    title: resumeData.title,
    full_name: resumeData.personal_info.full_name,
    email: resumeData.personal_info.email,
    phone: resumeData.personal_info.phone,
    location: resumeData.personal_info.location,
    linkedin_url: resumeData.personal_info.linkedin,
    website_url: resumeData.personal_info.websiteUrl,
    work_experience: resumeData.experience,
    education: resumeData.education,
    skills: resumeData.skills,
    additional_sections: {
      projects: resumeData.projects || [],
      certifications: resumeData.certifications || [],
    },
  };
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  personal_info: PersonalInfo;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
  certifications: Certification[];
  created_at: string;
  updated_at: string;
}

export interface PersonalInfo {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  websiteUrl?: string;
  summary: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  start_date: string;
  end_date: string | null;
  current: boolean;
  description: string[];
  location: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string;
  gpa?: string;
}

export interface Skill {
  id: string;
  name: string;
  
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  startDate: string;
  endDate?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  dateObtained: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface ResumeFormState {
  currentStep: number;
  totalSteps: number;
  isValid: boolean;
  errors: Record<string, string[]>;
  isDirty: boolean; // Has the form been modified since last save?
}

//ai
export interface JobDescription {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  keywords: string[];
}

export interface AIImprovementSuggestion {
  section: keyof Resume;
  originalText: string;
  suggestedText: string;
  reasoning: string;
  confidence: number; // 0-1 scale
}

export interface KeywordAnalysis {
  matchedKeywords: string[];
  missingKeywords: string[];
  matchScore: number; // Percentage match
  suggestions: string[];
}
