"use client";

import { ResumeForm } from "@/components/resume/ResumeForm";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function NewResumePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [[loading, user, router]]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ResumeForm mode="create" />
    </div>
  );
}
