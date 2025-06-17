"use client";

import { useRouter } from "next/navigation";
import { Pencil, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ResumeCardProps = {
  resume: {
    id: string;
    full_name?: string;
    title?: string;
    summary?: string;
    updated_at?: string;
  };
};

export const ResumeCard = ({ resume }: ResumeCardProps) => {
  const router = useRouter();

  const handleEdit = () => {
    console.log("Editing resume:", resume.id);
    router.push(`/dashboard/${resume.id}`); // Will load ResumeForm in edit mode
  };

  const handleView = () => {
    router.push(`/dashboard/view/${resume.id}`); // Public view (optional)
  };

  const formattedDate = resume.updated_at
    ? new Date(resume.updated_at).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <Card className="bg-white rounded-[36px] shadow-sm border border-gray-200 pl-4 pb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          {resume.title || "Untitled Resume"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {resume.title && (
          <p className="text-md text-gray-800">{resume.full_name}</p>
        )}


        {formattedDate && (
          <p className="text-xs text-gray-400">Last updated: {formattedDate}</p>
        )}

        <div className="flex justify-between items-center mt-4">
          <Button onClick={handleEdit} type="button" variant="outline" className="text-sm">
            <Pencil className="w-4 h-4 mr-2" />
             Edit
          </Button>
          <Button
            onClick={handleView}
            variant="ghost"
            className="text-sm text-blue-600 hover:underline"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
