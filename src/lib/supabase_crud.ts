import {
  Resume,
  transformDbRowToResumeData,
  transformResumeDataToDbRow,
} from "./supabase";
import { supabase } from "./supabase";

// Function to get all resumes for the authenticated user
export async function getUserResumes(): Promise<Resume[]> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userData.user.id)
      .eq("is_active", true) // Ensure we only fetch active resumes
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching resumes:", error);
      throw error;
    }
    return data.map(transformDbRowToResumeData);
  } catch (e) {
    console.error("Error fetching resumes:", e);
    throw e;
  }
}

// Function to get a specific resume by its ID
export async function getResumeById(resumeId: string): Promise<Resume | null> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", userData.user.id)
      .eq("is_active", true) // Ensure we only fetch active resumes
      .single();

    if (error) {
      console.error("Error fetching resume by ID:", error);
      throw error;
    }
    return data ? transformDbRowToResumeData(data) : null;
  } catch (e) {
    console.error("Error fetching resume by ID:", e);
    throw e;
  }
}

// Function to create a new resume
export async function createResume(
  resumeData: Omit<Resume, "id" | "user_id" | "created_at" | "updated_at">
): Promise<Resume> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const dbRow = {
      ...transformResumeDataToDbRow(resumeData as Resume),
      user_id: userData.user.id,
    };
    const { data, error } = await supabase
      .from("resumes")
      .insert([dbRow])
      .select("*")
      .single();
    if (error) {
      console.error("Error creating resume:", error);
      throw error;
    }
    return transformDbRowToResumeData(data);
  } catch (e) {
    console.error("Error creating resume:", e);
    throw e;
  }
}

// Function to update an existing resume
export async function updateResume(
  resumeId: string,
  resumeData: Partial<Resume>
): Promise<Resume> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const dbRow = transformResumeDataToDbRow(resumeData as Resume);
    const cleanDbRow = Object.fromEntries(
      Object.entries(dbRow).filter(([_, value]) => value !== undefined)
    );
    const { data, error } = await supabase
      .from("resumes")
      .update(cleanDbRow)
      .eq("id", resumeId)
      .eq("user_id", userData.user.id)
      .select("*")
      .single();
    if (error) {
      console.error("Error updating resume:", error);
      throw error;
    }
    return transformDbRowToResumeData(data);
  } catch (e) {
    console.error("Error updating resume:", e);
    throw e;
  }
}

//Function to soft delete a resume
export async function deleteResume(resumeId: string): Promise<void> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from("resumes")
      .update({ is_active: false })
      .eq("id", resumeId)
      .eq("user_id", userData.user.id);

    if (error) {
      console.error("Error deleting resume:", error);
      throw error;
    }
  } catch (e) {
    console.error("Error deleting resume:", e);
    throw e;
  }
}
