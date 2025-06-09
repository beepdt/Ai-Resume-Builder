"use client";
import { PersonalInfo } from "@/lib/supabase";
import { Separator } from "@radix-ui/react-separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  AlertCircle,
  Target,
} from "lucide-react";

type ProfileInfo = {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  websiteUrl?: string;
  summary: string;
};
type Title = {
    title: string;
}

type Props = {
  personalInfo: ProfileInfo;
  errors: Record<string, string>;
  onChange: (field: keyof ProfileInfo, value: string) => void;
};

export const ProfileInfoForm = ({ personalInfo, errors, onChange }: Props) => {
  const personalInfoFields = [
    {
      key: "full_name",
      label: "Full Name",
      icon: User,
      placeholder: "John Doe",
      required: true,
    },
    {
      key: "email",
      label: "Email",
      icon: Mail,
      placeholder: "john@example.com",
      type: "email",
      required: true,
    },
    {
      key: "phone",
      label: "Phone",
      icon: Phone,
      placeholder: "+91 555 123-4567",
      type: "tel",
      required: true,
    },
    {
      key: "location",
      label: "Location",
      icon: MapPin,
      placeholder: "New York, NY",
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: Linkedin,
      placeholder: "linkedin.com/in/johndoe",
    },
    {
      key: "websiteUrl",
      label: "Website",
      icon: Globe,
      placeholder: "johndoe.com",
    },
  ];

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-2xl text-slate-800">
          <div className="p-2 bg-green-100 rounded-lg">
            <User className="h-6 w-6 text-green-600" />
          </div>
          Personal Information
        </CardTitle>
        <CardDescription className="text-base">
          Your contact details and professional summary
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {personalInfoFields.map(
            ({
              key,
              label,
              icon: Icon,
              placeholder,
              type = "text",
              required,
            }) => (
              <div key={key} className="space-y-2">
                <Label
                  htmlFor={key}
                  className="text-sm font-medium text-slate-700 flex items-center gap-2"
                >
                  <Icon className="h-4 w-4 text-slate-500" />
                  {label}
                  {required && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id={key}
                  type={type}
                  value={personalInfo[key as keyof PersonalInfo]}
                  onChange={(e) =>
                    onChange(key as keyof PersonalInfo, e.target.value)
                  }
                  placeholder={placeholder}
                  className={cn(
                    "h-12 border-2 transition-all duration-200",
                    errors[key]
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  )}
                />
                {errors[key] && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors[key]}
                  </p>
                )}
              </div>
            )
          )}
        </div>

        <Separator className="my-8" />

        <div className="space-y-3">
          <Label
            htmlFor="summary"
            className="text-sm font-medium text-slate-700 flex items-center gap-2"
          >
            <Target className="h-4 w-4 text-slate-500" />
            Professional Summary
          </Label>
          <Textarea
            id="summary"
            value={personalInfo.summary}
            onChange={(e) => onChange("summary", e.target.value)}
            placeholder="Write a compelling 2–3 sentence summary highlighting your key qualifications and career objectives..."
            className="min-h-[120px] border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none text-base leading-relaxed"
            maxLength={300}
          />
          <p className="text-xs text-slate-500">
            {personalInfo.summary.length}/300 characters
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
