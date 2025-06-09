// app/resume/edit/[id].tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getResumeById } from "@/lib/supabase_crud";
import { Resume } from "@/lib/supabase";
import { ResumeForm } from "@/components/resume/ResumeForm";
// import your form steps here...

type Props = {
    params: {id: string};
}
export default function EditResumePage({ params }: Props) {
    const { id } = params;
  const router = useRouter();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getResumeById(id)
        .then((res) => {
          setResume(res);
        })
        .catch((err) => console.error("Failed to fetch resume:", err))
        .finally(() => setLoading(false));
    }
  }, [id]);
  if (loading) return <div className="p-6">Loading...</div>;

  if (!resume)
    return (
      <div className="p-6 text-red-500 font-medium">
        Resume not found or access denied.
      </div>
    );

  return (
    <div>
      {/* Pass `resume` to your form component */}
      
      <ResumeForm mode="edit" initialData={resume} resumeId={id as string} />
    </div>
  );
}
