"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Experience,
  Education,
  Project,
  Certification,
  Resume,
} from "@/lib/supabase";
import { getResumeById } from "@/lib/supabase_crud";
import { Mail, Linkedin, Github, Phone } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Props = {
  params: { id: string };
};
interface ValidationErrors {
  [key: string]: string;
}
export default function ResumeView() {
  const {id} = useParams();
  const { user } = useAuth();
  const router = useRouter();

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

  const [resume, setResume] = useState<Resume>({
    id: "",
    user_id: "",
    created_at: "",
    updated_at: "",
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

  const [loading, setLoading] = useState(true);

  const exportPDF = () => {
     router.push(`/dashboard/view/export/${resume.id}`);
  }

  useEffect(() => {
    if (id) {
      getResumeById(id)
        .then((res) => {
          if (res) {
            setResume(res);
          }
        })
        .catch((err) => console.error("Failed to fetch resume:", err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }
  const groupSkillsByCategory = (skills: any[]) => {
    return skills.reduce((acc, skill) => {
      const category = skill.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    }, {});
  };
  const groupedSkills = groupSkillsByCategory(resume.skills || []);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-sm leading-relaxed">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {resume.personal_info?.full_name || "Your Name"}
        </h1>

        <div className="flex flex-wrap justify-center items-center gap-4 text-blue-600">
          {resume.personal_info?.email && (
            <a
              href={`mailto:${resume.personal_info.email}`}
              className="flex items-center gap-1 hover:underline"
            >
              <Mail size={14} />
              {resume.personal_info.email}
            </a>
          )}
          {resume.personal_info?.linkedin && (
            <a
              href={resume.personal_info.linkedin}
              className="flex items-center gap-1 hover:underline"
            >
              <Linkedin size={14} />
              LinkedIn
            </a>
          )}
          {resume.personal_info?.websiteUrl && (
            <a
              href={resume.personal_info.websiteUrl}
              className="flex items-center gap-1 hover:underline"
            >
              <Github size={14} />
              GitHub
            </a>
          )}
          {resume.personal_info?.phone && (
            <span className="flex items-center gap-1">
              <Phone size={14} />
              {resume.personal_info.phone}
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {resume.personal_info?.summary && (
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed">
            {resume.personal_info.summary}
          </p>
        </div>
      )}

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            EDUCATION
          </h2>
          {resume.education.map((edu, index) => (
            <div key={edu.id || index} className="mb-3 flex justify-between">
              <div>
                <div className="font-semibold text-gray-900">
                  {edu.institution}
                </div>
                <div className="text-gray-700">{edu.degree}</div>
                {edu.degree && (
                  <div className="text-gray-600 italic">{edu.field}</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-gray-600">
                  {edu.end_date ? `Graduation ${edu.end_date}` : "In Progress"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {resume.skills && resume.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            SKILLS
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {(() => {
              const allSkills = Object.values(groupedSkills).flat();
              const skillsPerColumn = 5;
              const columns = [];

              for (let i = 0; i < allSkills.length; i += skillsPerColumn) {
                columns.push(allSkills.slice(i, i + skillsPerColumn));
              }

              return columns.map((columnSkills, columnIndex) => (
                <div key={columnIndex}>
                  <ul className="list-disc list-inside space-y-1">
                    {columnSkills.map((skill, index) => {
                      const typedSkill = skill as {
                        id?: string | number;
                        name: string;
                      };
                      return (
                        <li
                          key={typedSkill.id || `${columnIndex}-${index}`}
                          className="text-gray-700"
                        >
                          {typedSkill.name}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            PROJECTS
          </h2>
          {resume.projects.map((project, index) => (
            <div key={project.id || index} className="mb-4">
              <div className="flex items-start gap-2 mb-1 justify-between">
                <h2 className="font-semibold text-gray-900">{project.name}</h2>
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    className="text-blue-600 hover:underline text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {project.githubUrl}
                  </a>
                )}
                {project.startDate && project.endDate && (
                  <div className="text-gray-600  items-start">
                    {project.startDate} - {project.endDate}
                  </div>
                )}
              </div>

              {project.technologies && project.technologies.length > 0 && (
                <div className="italic items-start text-gray-600 mb-2">
                  {project.technologies.join(", ")}
                </div>
              )}

              {project.description && project.description.length > 0 && (
                <p className="text-gray-700 mb-2">{project.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {resume.experience && resume.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            EXPERIENCE
          </h2>
          {resume.experience.map((exp, index) => (
            <div key={exp.id || index} className="mb-4">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="font-semibold text-gray-900">{exp.company}</h3>
                  <div className="text-gray-700 italic">{exp.position}</div>
                </div>
                <div className="text-right text-gray-600">
                  {exp.start_date && exp.end_date
                    ? `${exp.start_date} - ${exp.end_date}`
                    : exp.current
                    ? `${exp.start_date} - Present`
                    : exp.start_date || "Present"}
                </div>
              </div>

              {exp.description && exp.description.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {exp.description.map((desc, descIndex) => (
                    <li key={descIndex}>{desc}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            CERTIFICATIONS
          </h2>
          {resume.certifications.map((cert, index) => (
            <div key={cert.id || index} className="mb-3 flex justify-between">
              <div>
                <div className="font-semibold text-gray-900">{cert.name}</div>
                <div className="text-gray-700">{cert.issuer}</div>
              </div>
              <div className="text-gray-600">{cert.dateObtained}</div>
            </div>
          ))}
        </div>
      )}
      <div className="px-56">
        <Button 
        onClick={()=> exportPDF()}
        className="w-full">Export PDF</Button>
      </div>
    </div>
  );
}
