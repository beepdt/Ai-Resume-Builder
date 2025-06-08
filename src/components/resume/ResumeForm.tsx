"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createResume } from "@/lib/supabase_crud";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  Resume,
  Experience,
  Education,
  Project,
  Certification,
  Skill,
} from "@/lib/supabase";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  FileText,
  Code,
  Loader2,
  Briefcase,
  GraduationCap,
  Award,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Plus,
  X,
  Save,
  Eye,
  Calendar,
  Building,
  ExternalLink,
  AlertCircle,
  Star,
  Trash2,
  Edit3,
  BookOpen,
  Target,
  Wrench,
} from "lucide-react";

interface ValidationErrors {
  [key: string]: string;
}

export function ResumeForm() {
  const { user } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentSkill, setCurrentSkill] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPreview, setShowPreview] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<
    "saving" | "saved" | "error" | null
  >(null);

  const [resume, setResume] = useState<
    Omit<Resume, "id" | "user_id" | "created_at" | "updated_at">
  >({
    title: "",
    personal_info: {
      full_name: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      websiteUrl: "",
      summary: "",
    },
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
  });

  // Experience form state
  const [experienceForm, setExperienceForm] = useState<Partial<Experience>>({});
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState<string | null>(
    null
  );

  // Education form state
  const [educationForm, setEducationForm] = useState<Partial<Education>>({});
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(
    null
  );

  // Project form state
  const [projectForm, setProjectForm] = useState<Partial<Project>>({});
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Certification form state
  const [certificationForm, setCertificationForm] = useState<
    Partial<Certification>
  >({});
  const [showCertificationForm, setShowCertificationForm] = useState(false);
  const [editingCertification, setEditingCertification] =
    useState<Certification | null>(null);

  // Validation
  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};

    switch (step) {
      case 1:
        if (!resume.title.trim()) {
          newErrors.title = "Resume title is required";
        }
        break;
      case 1:
        if (!resume.personal_info.full_name.trim()) {
          newErrors.full_name = "Full name is required";
        }
        if (!resume.personal_info.email.trim()) {
          newErrors.email = "Email is required";
        } else if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.personal_info.email)
        ) {
          newErrors.email = "Valid email is required";
        }
        if (!resume.personal_info.phone.trim()) {
          newErrors.phone = "Phone number is required";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-save functionality
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (resume.title.trim()) {
        setAutosaveStatus("saving");
        try {
          localStorage.setItem("resumeDraft", JSON.stringify(resume));
          setAutosaveStatus("saved");
          setTimeout(() => setAutosaveStatus(null), 2000);
        } catch (error) {
          setAutosaveStatus("error");
          setTimeout(() => setAutosaveStatus(null), 3000);
        }
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [resume]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem("resumeDraft");
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        setResume(parsedDraft);
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, []);

  const handleChange = (
    field: keyof typeof resume.personal_info,
    value: string
  ) => {
    setResume((prev) => ({
      ...prev,
      personal_info: {
        ...prev.personal_info,
        [field]: value,
      },
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Skills management
  const addSkill = () => {
    if (currentSkill.trim()) {
      const newSkill: Skill = {
        id: Date.now().toString(),
        name: currentSkill.trim(),
      };
      setResume((prev) => ({ ...prev, skills: [...prev.skills, newSkill] }));
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillId: string) => {
    setResume((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill.id !== skillId),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  // Experience management
  const handleExperienceSubmit = () => {
    if (experienceForm.company && experienceForm.position) {
      const newExperience: Experience = {
        id: editingExperience || Date.now().toString(),
        company: experienceForm.company,
        position: experienceForm.position,
        start_date: experienceForm.start_date || "",
        end_date: experienceForm.end_date || "",
        description: Array.isArray(experienceForm.description)
          ? experienceForm.description
          : experienceForm.description
          ? [experienceForm.description]
          : [],
        location: experienceForm.location || "",
        current: experienceForm.current || false,
      };

      if (editingExperience) {
        setResume((prev) => ({
          ...prev,
          experience: prev.experience.map((exp) =>
            exp.id === editingExperience ? newExperience : exp
          ),
        }));
      } else {
        setResume((prev) => ({
          ...prev,
          experience: [...prev.experience, newExperience],
        }));
      }

      setExperienceForm({});
      setShowExperienceForm(false);
      setEditingExperience(null);
    }
  };
  const editExperience = (exp: Experience) => {
    setExperienceForm(exp);
    setEditingExperience(exp.id);
    setShowExperienceForm(true);
  };
  const removeExperience = (id: string) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  // Similar handlers for education
  const handleEducationSubmit = () => {
    if (
      !educationForm.institution ||
      !educationForm.degree ||
      !educationForm.start_date ||
      !educationForm.end_date
    )
      return;

    if (editingEducation) {
      // Update existing education
      setResume((prev) => ({
        ...prev,
        education: prev.education.map((edu) =>
          edu.id === editingEducation.id
            ? { ...editingEducation, ...educationForm }
            : edu
        ),
      }));
    } else {
      // Add new education
      setResume((prev) => ({
        ...prev,
        education: [
          ...prev.education,
          {
            ...educationForm,
            id: Date.now().toString(), // temporary ID
          } as Education,
        ],
      }));
    }

    // Reset form and modal state
    setEducationForm({});
    setEditingEducation(null);
    setShowEducationForm(false);
  };

  const editEducation = (edu: Education) => {
    setEducationForm(edu);
    setEditingEducation(edu);
    setShowEducationForm(true);
  };
  const removeEducation = (id: string) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  //Project management
  const handleProjectSubmit = () => {
    if (!projectForm.name || !projectForm.description || !projectForm.startDate)
      return;

    if (editingProject) {
      setResume((prev) => ({
        ...prev,
        projects: prev.projects.map((proj) =>
          proj.id === editingProject.id
            ? { ...editingProject, ...projectForm }
            : proj
        ),
      }));
    } else {
      setResume((prev) => ({
        ...prev,
        projects: [
          ...prev.projects,
          {
            ...projectForm,
            id: Date.now().toString(),
          } as Project,
        ],
      }));
    }

    setProjectForm({});
    setEditingProject(null);
    setShowProjectForm(false);
  };
  const editProject = (proj: Project) => {
    setProjectForm(proj);
    setEditingProject(proj);
    setShowProjectForm(true);
  };
  const removeProject = (id: string) => {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects.filter((proj) => proj.id !== id),
    }));
  };

  // Certification management
  const handleCertificationSubmit = () => {
    if (
      !certificationForm.name ||
      !certificationForm.issuer ||
      !certificationForm.dateObtained
    )
      return;

    if (editingCertification) {
      setResume((prev) => ({
        ...prev,
        certifications: prev.certifications.map((cert) =>
          cert.id === editingCertification.id
            ? { ...editingCertification, ...certificationForm }
            : cert
        ),
      }));
    } else {
      setResume((prev) => ({
        ...prev,
        certifications: [
          ...prev.certifications,
          {
            ...certificationForm,
            id: Date.now().toString(),
          } as Certification,
        ],
      }));
    }

    setCertificationForm({});
    setEditingCertification(null);
    setShowCertificationForm(false);
  };
  const editCertification = (cert: Certification) => {
    setCertificationForm(cert);
    setEditingCertification(cert);
    setShowCertificationForm(true);
  };
  const removeCertification = (id: string) => {
    setResume((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((cert) => cert.id !== id),
    }));
  };

  const next = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(s + 1, totalSteps));
    }
  };

  const prev = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const saved = await createResume(resume);
      if (saved) {
        localStorage.removeItem("resumeDraft");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error saving resume:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return "Personal Details";
      case 2:
        return "Experience";
      case 3:
        return "Education";
      case 4:
        return "Skills ";
      case 5:
        return "Projects";
      case 6:
        return "Certifications";
      case 7:
        return "Review & Submit";
      default:
        return "Step";
    }
  };

  const getProgressPercentage = () => {
    return (currentStep / totalSteps) * 100;
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Create Your Resume
          </h1>
          <p className="text-slate-600 text-lg">
            Build a professional resume that stands out
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-slate-600">
              Step {currentStep} of {totalSteps}: {getStepTitle(currentStep)}
            </span>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              {autosaveStatus === "saving" && (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </>
              )}
              {autosaveStatus === "saved" && (
                <>
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Saved
                </>
              )}
              {autosaveStatus === "error" && (
                <>
                  <AlertCircle className="h-3 w-3 text-red-600" />
                  Save failed
                </>
              )}
            </div>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Resume Title */}
          {currentStep === 1 && (
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl text-slate-800">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  Resume Title
                </CardTitle>
                <CardDescription className="text-base">
                  Give your resume a descriptive title that reflects your target
                  role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    value={resume.title}
                    onChange={(e) => {
                      setResume({ ...resume, title: e.target.value });
                      if (errors.title)
                        setErrors((prev) => ({ ...prev, title: "" }));
                    }}
                    placeholder="e.g., Senior Software Engineer Resume"
                    className={cn(
                      "text-lg h-14 border-2 transition-all duration-200",
                      errors.title
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    )}
                  />
                  {errors.title && (
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.title}
                    </p>
                  )}
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    💡 Pro Tips:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Include your target job title</li>
                    <li>• Be specific about your specialization</li>
                    <li>• Keep it professional and clear</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 1 && (
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
                          value={
                            resume.personal_info[
                              key as keyof typeof resume.personal_info
                            ]
                          }
                          onChange={(e) =>
                            handleChange(
                              key as keyof typeof resume.personal_info,
                              e.target.value
                            )
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
                    value={resume.personal_info.summary}
                    onChange={(e) => handleChange("summary", e.target.value)}
                    placeholder="Write a compelling 2-3 sentence summary highlighting your key qualifications and career objectives..."
                    className="min-h-[120px] border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none text-base leading-relaxed"
                  />
                  <p className="text-xs text-slate-500">
                    {resume.personal_info.summary.length}/300 characters
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Experience */}
          {currentStep === 2 && (
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl text-slate-800">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Briefcase className="h-6 w-6 text-orange-600" />
                  </div>
                  Work Experience
                </CardTitle>
                <CardDescription className="text-base">
                  Add your professional work experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Experience List */}
                {resume.experience.length > 0 && (
                  <div className="space-y-4">
                    {resume.experience.map((exp) => (
                      <div
                        key={exp.id}
                        className="p-4 border-2 border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900">
                              {exp.position}
                            </h4>
                            <p className="text-slate-600 flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {exp.company}
                            </p>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {exp.start_date} -{" "}
                              {exp.current ? "Present" : exp.end_date}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => editExperience(exp)}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeExperience(exp.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Experience Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowExperienceForm(true)}
                  className="w-full h-12 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Work Experience
                </Button>

                {/* Experience Form Modal/Inline */}
                {showExperienceForm && (
                  <div className="p-6 border-2 border-blue-200 rounded-lg bg-blue-50 space-y-4">
                    <h4 className="font-semibold text-blue-900">
                      {editingExperience ? "Edit" : "Add"} Work Experience
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Position Title *</Label>
                        <Input
                          value={experienceForm.position || ""}
                          onChange={(e) =>
                            setExperienceForm((prev) => ({
                              ...prev,
                              position: e.target.value,
                            }))
                          }
                          placeholder="Software Engineer"
                        />
                      </div>
                      <div>
                        <Label>Company *</Label>
                        <Input
                          value={experienceForm.company || ""}
                          onChange={(e) =>
                            setExperienceForm((prev) => ({
                              ...prev,
                              company: e.target.value,
                            }))
                          }
                          placeholder="Tech Corp Inc."
                        />
                      </div>
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="month"
                          value={experienceForm.start_date || ""}
                          onChange={(e) =>
                            setExperienceForm((prev) => ({
                              ...prev,
                              start_date: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="month"
                          value={experienceForm.end_date || ""}
                          onChange={(e) =>
                            setExperienceForm((prev) => ({
                              ...prev,
                              end_date: e.target.value,
                            }))
                          }
                          disabled={experienceForm.current}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>
                        <input
                          type="checkbox"
                          checked={experienceForm.current || false}
                          onChange={(e) =>
                            setExperienceForm((prev) => ({
                              ...prev,
                              is_current: e.target.checked,
                              end_date: e.target.checked ? "" : prev.end_date,
                            }))
                          }
                          className="mr-2"
                        />
                        Currently working here
                      </Label>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={experienceForm.description || ""}
                        onChange={(e) =>
                          setExperienceForm((prev) => ({
                            ...prev,
                            description: [e.target.value],
                          }))
                        }
                        placeholder="Describe your key responsibilities and achievements..."
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleExperienceSubmit}
                        disabled={
                          !experienceForm.position || !experienceForm.company
                        }
                      >
                        {editingExperience ? "Update" : "Add"} Experience
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowExperienceForm(false);
                          setExperienceForm({});
                          setEditingExperience(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Education - Similar structure to Experience */}
          {currentStep === 3 && (
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl text-slate-800">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                  </div>
                  Education
                </CardTitle>
                <CardDescription className="text-base">
                  Add your academic qualifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Education List */}
                {resume.education.length > 0 && (
                  <div className="space-y-4">
                    {resume.education.map((edu) => (
                      <div
                        key={edu.id}
                        className="p-4 border-2 border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900">
                              {edu.degree}
                            </h4>
                            <p className="text-slate-600 flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {edu.institution}
                            </p>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {edu.start_date} - {edu.end_date}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => editEducation(edu)}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeEducation(edu.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Education Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEducationForm(true)}
                  className="w-full h-12 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>

                {/* Education Form Modal/Inline */}
                {showEducationForm && (
                  <div className="p-6 border-2 border-blue-200 rounded-lg bg-blue-50 space-y-4">
                    <h4 className="font-semibold text-blue-900">
                      {editingEducation ? "Edit" : "Add"} Education
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Institution *</Label>
                        <Input
                          value={educationForm.institution || ""}
                          onChange={(e) =>
                            setEducationForm((prev) => ({
                              ...prev,
                              institution: e.target.value,
                            }))
                          }
                          placeholder="University of Example"
                        />
                      </div>
                      <div>
                        <Label>Degree *</Label>
                        <Input
                          value={educationForm.degree || ""}
                          onChange={(e) =>
                            setEducationForm((prev) => ({
                              ...prev,
                              degree: e.target.value,
                            }))
                          }
                          placeholder="Bachelor of Science"
                        />
                      </div>
                      <div>
                        <Label>Field of Study</Label>
                        <Input
                          value={educationForm.field || ""}
                          onChange={(e) =>
                            setEducationForm((prev) => ({
                              ...prev,
                              field: e.target.value,
                            }))
                          }
                          placeholder="Computer Science"
                        />
                      </div>
                      <div>
                        <Label>Grade (optional)</Label>
                        <Input
                          value={educationForm.gpa || ""}
                          onChange={(e) =>
                            setEducationForm((prev) => ({
                              ...prev,
                              gpa: e.target.value,
                            }))
                          }
                          placeholder="8.5 CGPA"
                        />
                      </div>
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="month"
                          value={educationForm.start_date || ""}
                          onChange={(e) =>
                            setEducationForm((prev) => ({
                              ...prev,
                              start_date: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="month"
                          value={educationForm.end_date || ""}
                          onChange={(e) =>
                            setEducationForm((prev) => ({
                              ...prev,
                              end_date: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleEducationSubmit}
                        disabled={
                          !educationForm.institution || !educationForm.degree
                        }
                      >
                        {editingEducation ? "Update" : "Add"} Education
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowEducationForm(false);
                          setEducationForm({});
                          setEditingEducation(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Skills & Projects - Enhanced skills section plus projects */}

          {/* Step 4: Skills  */}
          {currentStep === 4 && (
            <div className="space-y-8">
              {/* Skills */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl text-slate-800">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Code className="h-6 w-6 text-purple-600" />
                    </div>
                    Skills
                  </CardTitle>
                  <CardDescription className="text-base">
                    Add your technical and professional skills
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-2">
                    <Input
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a skill and press Enter"
                      className="flex-1 h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Button
                      type="button"
                      onClick={addSkill}
                      disabled={!currentSkill.trim()}
                      className="h-12 px-6 bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {resume.skills.length > 0 && (
                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-slate-700">
                        Your Skills ({resume.skills.length}):
                      </Label>
                      <div className="flex flex-wrap gap-3">
                        {resume.skills.map((skill) => (
                          <Badge
                            key={skill.id}
                            variant="secondary"
                            className="px-4 py-2 text-sm bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 hover:from-blue-100 hover:to-purple-100 transition-all duration-200 group"
                          >
                            {skill.name}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill.id)}
                              className="ml-2 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {resume.skills.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Code className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>
                        No skills added yet. Start by adding your first skill
                        above.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          {/* Step 5: Projects */}
          {currentStep === 5 && (
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl text-slate-800">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Wrench className="h-6 w-6 text-purple-600" />
                  </div>
                  Projects
                </CardTitle>
                <CardDescription className="text-base">
                  Showcase projects you've worked on
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Existing Projects */}

                {resume.projects.length > 0 && (
                  <div className="space-y-4">
                    {resume.projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-4 border border-slate-300 rounded-lg bg-slate-50"
                      >
                        <h4 className="font-semibold text-slate-800">
                          {proj.name}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {proj.description}
                        </p>
                        <p className="text-xs text-slate-500">
                          {proj.startDate} - {proj.endDate || "Ongoing"}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editProject(proj)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeProject(proj.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowProjectForm(true)}
                  className="w-full border-dashed border-2 border-slate-300 hover:border-purple-400 hover:bg-purple-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>

                {/* Project Form */}
                {showProjectForm && (
                  <div className="space-y-4 border border-purple-300 bg-purple-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-purple-800">
                      {editingProject ? "Edit" : "Add"} Project
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Project Name</Label>
                        <Input
                          value={projectForm.name || ""}
                          onChange={(e) =>
                            setProjectForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Technologies (comma-separated)</Label>
                        <Input
                          value={projectForm.technologies?.join(", ") || ""}
                          onChange={(e) =>
                            setProjectForm((prev) => ({
                              ...prev,
                              technologies: e.target.value
                                .split(",")
                                .map((t) => t.trim()),
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="month"
                          value={projectForm.startDate || ""}
                          onChange={(e) =>
                            setProjectForm((prev) => ({
                              ...prev,
                              startDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="month"
                          value={projectForm.endDate || ""}
                          onChange={(e) =>
                            setProjectForm((prev) => ({
                              ...prev,
                              endDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>GitHub URL</Label>
                        <Input
                          value={projectForm.githubUrl || ""}
                          onChange={(e) =>
                            setProjectForm((prev) => ({
                              ...prev,
                              githubUrl: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Live URL</Label>
                        <Input
                          value={projectForm.liveUrl || ""}
                          onChange={(e) =>
                            setProjectForm((prev) => ({
                              ...prev,
                              liveUrl: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={projectForm.description || ""}
                        onChange={(e) =>
                          setProjectForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" onClick={handleProjectSubmit}>
                        {editingProject ? "Update" : "Add"} Project
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowProjectForm(false);
                          setProjectForm({});
                          setEditingProject(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5*/}
          {currentStep === 6 && (
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl text-slate-800">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  Certifications
                </CardTitle>
                <CardDescription className="text-base">
                  Add your certifications and credentials
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Existing Certifications */}
                {resume.certifications.length > 0 && (
                  <div className="space-y-4">
                    {resume.certifications.map((cert) => (
                      <div
                        key={cert.id}
                        className="p-4 border border-slate-300 rounded-lg bg-slate-50"
                      >
                        <h4 className="font-semibold text-slate-800">
                          {cert.name}
                        </h4>
                        <p className="text-sm text-slate-600">{cert.issuer}</p>
                        <p className="text-xs text-slate-500">
                          {cert.dateObtained}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editCertification(cert)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeCertification(cert.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCertificationForm(true)}
                  className="w-full border-dashed border-2 border-slate-300 hover:border-green-400 hover:bg-green-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Certification
                </Button>

                {/* Certification Form */}
                {showCertificationForm && (
                  <div className="space-y-4 border border-green-300 bg-green-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-green-800">
                      {editingCertification ? "Edit" : "Add"} Certification
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Certification Name</Label>
                        <Input
                          value={certificationForm.name || ""}
                          onChange={(e) =>
                            setCertificationForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Issuer</Label>
                        <Input
                          value={certificationForm.issuer || ""}
                          onChange={(e) =>
                            setCertificationForm((prev) => ({
                              ...prev,
                              issuer: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Date Obtained</Label>
                        <Input
                          type="date"
                          value={certificationForm.dateObtained || ""}
                          onChange={(e) =>
                            setCertificationForm((prev) => ({
                              ...prev,
                              dateObtained: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Expiry Date</Label>
                        <Input
                          type="date"
                          value={certificationForm.expiryDate || ""}
                          onChange={(e) =>
                            setCertificationForm((prev) => ({
                              ...prev,
                              expiryDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Credential ID</Label>
                        <Input
                          value={certificationForm.credentialId || ""}
                          onChange={(e) =>
                            setCertificationForm((prev) => ({
                              ...prev,
                              credentialId: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Credential URL</Label>
                        <Input
                          value={certificationForm.credentialUrl || ""}
                          onChange={(e) =>
                            setCertificationForm((prev) => ({
                              ...prev,
                              credentialUrl: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" onClick={handleCertificationSubmit}>
                        {editingCertification ? "Update" : "Add"} Certification
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowCertificationForm(false);
                          setCertificationForm({});
                          setEditingCertification(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 6: Review & Save */}
          {currentStep === 7 && (
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl text-slate-800">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  Review Your Resume
                </CardTitle>
                <CardDescription className="text-base">
                  Review all sections before saving your resume
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Resume Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {resume.experience.length}
                    </div>
                    <div className="text-sm text-blue-800">Work Experience</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {resume.education.length}
                    </div>
                    <div className="text-sm text-green-800">Education</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {resume.skills.length}
                    </div>
                    <div className="text-sm text-purple-800">Skills</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {resume.projects.length}
                    </div>
                    <div className="text-sm text-orange-800">Projects</div>
                  </div>
                </div>

                {/* Quick Preview */}
                <div className="bg-slate-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-4">
                    Resume Preview
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-slate-800">
                        {resume.title}
                      </h4>
                      <p className="text-slate-600">
                        {resume.personal_info.full_name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {resume.personal_info.email} •{" "}
                        {resume.personal_info.phone}
                      </p>
                    </div>
                    {resume.personal_info.summary && (
                      <div>
                        <h5 className="font-medium text-slate-700 mb-1">
                          Summary
                        </h5>
                        <p className="text-sm text-slate-600 line-clamp-3">
                          {resume.personal_info.summary}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Validation Checklist */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-4">
                    Completeness Check
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {resume.title.trim() ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={
                          resume.title.trim()
                            ? "text-green-800"
                            : "text-red-800"
                        }
                      >
                        Resume title added
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {resume.personal_info.full_name &&
                      resume.personal_info.email ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={
                          resume.personal_info.full_name &&
                          resume.personal_info.email
                            ? "text-green-800"
                            : "text-red-800"
                        }
                      >
                        Contact information complete
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {resume.experience.length > 0 ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                      )}
                      <span
                        className={
                          resume.experience.length > 0
                            ? "text-green-800"
                            : "text-amber-800"
                        }
                      >
                        Work experience added{" "}
                        {resume.experience.length === 0 && "(recommended)"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {resume.skills.length > 0 ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                      )}
                      <span
                        className={
                          resume.skills.length > 0
                            ? "text-green-800"
                            : "text-amber-800"
                        }
                      >
                        Skills added{" "}
                        {resume.skills.length === 0 && "(recommended)"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prev}
              disabled={currentStep === 1}
              className="h-12 px-6 border-2"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentStep(i + 1)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-200",
                    currentStep === i + 1
                      ? "bg-blue-600 scale-125"
                      : currentStep > i + 1
                      ? "bg-green-500"
                      : "bg-slate-300 hover:bg-slate-400"
                  )}
                />
              ))}
            </div>

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={next}
                className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={
                  loading ||
                  !resume.title.trim() ||
                  !resume.personal_info.full_name ||
                  !resume.personal_info.email
                }
                className="h-12 px-8 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Saving Resume...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Resume
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSaving(true)}
              disabled={saving}
              className="h-10 px-4 border-dashed"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Draft
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="h-10 px-4"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? "Hide" : "Preview"}
            </Button>
          </div>

          {/* Error Display */}
          {Object.keys(errors).length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Please fix the following errors:
                <ul className="mt-2 list-disc list-inside">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </form>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">Resume Preview</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="p-6 h-[60vh]">
                <div className="space-y-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold">
                      {resume.personal_info.full_name}
                    </h1>
                    <p className="text-slate-600">
                      {resume.personal_info.email} •{" "}
                      {resume.personal_info.phone}
                    </p>
                    <p className="text-slate-600">
                      {resume.personal_info.location}
                    </p>
                  </div>

                  {resume.personal_info.summary && (
                    <div>
                      <h2 className="text-lg font-semibold border-b pb-1 mb-2">
                        Summary
                      </h2>
                      <p className="text-slate-700">
                        {resume.personal_info.summary}
                      </p>
                    </div>
                  )}

                  {resume.experience.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold border-b pb-1 mb-3">
                        Experience
                      </h2>
                      {resume.experience.map((exp) => (
                        <div key={exp.id} className="mb-4">
                          <h3 className="font-medium">{exp.position}</h3>
                          <p className="text-slate-600">{exp.company}</p>
                          <p className="text-sm text-slate-500">
                            {exp.start_date} -{" "}
                            {exp.current ? "Present" : exp.end_date}
                          </p>
                          {exp.description && (
                            <p className="text-sm text-slate-700 mt-1">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {resume.skills.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold border-b pb-1 mb-2">
                        Skills
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {resume.skills.map((skill) => (
                          <Badge key={skill.id} variant="secondary">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
