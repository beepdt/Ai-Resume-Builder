"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Input } from "../ui/input";
import { AlertCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  error?: string;
  onChange: (value: string) => void;
};

export const TitleForm = ({ title, error, onChange }: Props) => {
  return (
    <Card className="shadow-none border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-2xl text-slate-800">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          Resume Title
        </CardTitle>
        <CardDescription className="text-base">
          Give your resume a descriptive title that reflects your target role
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            value={title}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g., Senior Software Engineer Resume"
            className={cn(
              "text-lg h-14 border-2 transition-all duration-200",
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            )}
          />
          {error && (
            <p className="text-red-600 text-sm flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {error}
            </p>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Include your target job title</li>
            <li>• Be specific about your specialization</li>
            <li>• Keep it professional and clear</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
