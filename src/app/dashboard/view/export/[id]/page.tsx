"use client";

import { Resume } from "@/lib/supabase";
import { getResumeById } from "@/lib/supabase_crud";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import { useEffect, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { useParams } from "next/navigation";
type Props = {
  params: { id: string };
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 24,
    lineHeight: 1.4,
    color: "#333333",
  },

  // Header styles
  header: {
    textAlign: "center",

    paddingBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
    textTransform: "uppercase",
  },
  contactInfo: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 15,
    fontSize: 10,
    color: "#2563eb",
  },
  contactItem: {
    marginRight: 15,
  },

  // Section styles
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    paddingBottom: 4,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Content styles
  subsectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 4,
  },
  companyPosition: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  dateRange: {
    fontSize: 10,
    color: "#6b7280",
    fontStyle: "italic",
  },

  // Text styles
  bodyText: {
    fontSize: 11,
    lineHeight: 1.4,

    color: "#4b5563",
  },
  summaryText: {
    fontSize: 11,
    lineHeight: 1.5,
    color: "#374151",
    textAlign: "justify",
  },

  // List styles
  bulletPoint: {
    fontSize: 10,
    marginBottom: 3,
    color: "#1f2937",
  },

  // Skills styles
  skillsContainer: {
    flexDirection: "column",
    width: "100%",
    marginBottom: 8,
  },
  skillCategory: {},
  categoryTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
  },
  skillsList: {
    fontSize: 10,
    color: "#1f2937",
    lineHeight: 1.3,
  },

  // Project styles
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  projectName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
  },
  projectUrl: {
    fontSize: 9,
    color: "#2563eb",
    textDecoration: "none",
  },
  technologies: {
    fontSize: 10,
    color: "#1f2937",
    fontStyle: "italic",
    marginBottom: 4,
  },

  // Education styles
  educationItem: {
    marginBottom: 12,
  },
  institutionDegree: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  institution: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
  },
  degree: {
    fontSize: 11,
    color: "#1f2937",
  },
  field: {
    fontSize: 10,
    color: "#1f2937",
    fontStyle: "italic",
  },

  // Certification styles
  certificationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  certificationName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
  },
  issuer: {
    fontSize: 10,
    color: "#6b7280",
  },
});

function MyDocument({ resume }: { resume: Resume }) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const groupSkillsByCategory = (skills: any[]) => {
    return skills.reduce((acc, skill) => {
      const category = skill.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    }, {} as Record<string, any[]>);
  };

  const groupedSkills = groupSkillsByCategory(resume.skills || []);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {resume.personal_info.full_name || "Your Name"}
          </Text>
          <View style={styles.contactInfo}>
            {resume.personal_info.email && (
              <Text style={styles.contactItem}>
                {resume.personal_info.email}
              </Text>
            )}
            {resume.personal_info.phone && (
              <Text style={styles.contactItem}>
                {resume.personal_info.phone}
              </Text>
            )}
            {resume.personal_info.location && (
              <Text style={styles.contactItem}>
                {resume.personal_info.location}
              </Text>
            )}
            {resume.personal_info.linkedin && (
              <Link
                src={resume.personal_info.linkedin}
                style={[styles.contactItem, styles.projectUrl]}
              >
                LinkedIn
              </Link>
            )}
            {resume.personal_info.websiteUrl && (
              <Link
                src={resume.personal_info.websiteUrl}
                style={[styles.contactItem, styles.projectUrl]}
              >
                Portfolio
              </Link>
            )}
          </View>
        </View>

        {/* Summary */}
        {/* Education */}
        {resume.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((edu, i) => (
              <View key={i} style={styles.educationItem}>
                <View style={styles.institutionDegree}>
                  <View>
                    <Text style={styles.institution}>{edu.institution}</Text>
                    <Text style={styles.degree}>{edu.degree}</Text>
                    {edu.field && <Text style={styles.field}>{edu.field}</Text>}
                  </View>
                  <Text style={styles.dateRange}>
                    {edu.end_date
                      ? `Graduated ${formatDate(edu.end_date)}`
                      : "In Progress"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {Object.entries(groupedSkills).map(([category, skills], i) => (
                <View key={i} style={styles.skillCategory}>
                  <Text style={styles.skillsList}>
                    {(skills as any[]).map((skill) => skill.name).join(" • ")}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {resume.experience.map((exp, i) => (
              <View key={i} style={{ marginBottom: 12 }}>
                <View style={styles.companyPosition}>
                  <View>
                    <Text style={styles.subsectionTitle}>{exp.company}</Text>
                    <Text style={styles.bodyText}>{exp.position}</Text>
                  </View>
                  <Text style={styles.dateRange}>
                    {formatDate(exp.start_date || "")} -{" "}
                    {exp.current ? "Present" : formatDate(exp.end_date || "")}
                  </Text>
                </View>
                {exp.description && (
                  <Text style={styles.bulletPoint}>{exp.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {resume.projects.map((project, i) => (
              <View key={i} style={{ marginBottom: 12 }}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  <View>
                    {project.githubUrl && (
                      <Link src={project.githubUrl} style={styles.projectUrl}>
                        {project.githubUrl.replace("https://", "")}
                      </Link>
                    )}
                    {project.startDate && project.endDate && (
                      <Text style={styles.dateRange}>
                        {formatDate(project.startDate)} -{" "}
                        {formatDate(project.endDate)}
                      </Text>
                    )}
                  </View>
                </View>

                {project.technologies && project.technologies.length > 0 && (
                  <Text style={styles.technologies}>
                    Technologies: {project.technologies.join(", ")}
                  </Text>
                )}

                {project.description && (
                  <Text style={styles.bodyText}>{project.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {resume.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {resume.certifications.map((cert, i) => (
              <View key={i} style={styles.certificationItem}>
                <View>
                  <Text style={styles.certificationName}>{cert.name}</Text>
                  <Text style={styles.issuer}>{cert.issuer}</Text>
                </View>
                <Text style={styles.dateRange}>
                  {formatDate(cert.dateObtained)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}

export default function PDFRenderer() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (id && typeof id === "string") {
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

  return (
    <PDFViewer className="w-full min-h-screen">
      <MyDocument resume={resume} />
    </PDFViewer>
  );
}
