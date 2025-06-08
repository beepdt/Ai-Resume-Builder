"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getUserResumes } from "@/lib/supabase_crud";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Resume } from "@/lib/supabase";
import Image from "next/image";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { signOut } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  const fetchResumes = async () => {
    setLoadingResumes(true);
    const data = await getUserResumes();
    setResumes(data);
    setLoadingResumes(false);
  };

  useEffect(() => {
    fetchResumes();
  }, [user]);
  if (loading || !user) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <main className="p-6">
      <div className="flex justify-between items-center  mb-6 shadow-md rounded-xl p-4">
        <div className="flex items-center space-x-4">
          {user.user_metadata?.avatar_url && (
            <Image
              src={user.user_metadata.avatar_url}
              alt="User Avvatar"
              width={50}
              height={50}
              className="rounded-full"
            />
          )}
          <div>
            <h2 className="text-lg font-medium">
              {user.user_metadata?.full_name || user.email || "User"}
            </h2>
          </div>
          <Button className="rounded-lg cursor-pointer" onClick={signOut}>Log Out</Button>
        </div>
        <Link href="/dashboard/new">
          <Button className="cursor-pointer rounded-lg">
            Create New Resume
          </Button>
        </Link>
      </div>

      {loadingResumes ? (
        <p>Loading resumes...</p>
      ) : resumes.length === 0 ? (
        <p className="items-center text-center justify-center text-gray-500">
          No resumes yet. Click{" "}
          <span className="text-black font-bold p-1">Create New Resume</span> to
          get started.
        </p>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Card key={resume.id}>
              <CardHeader>
                <CardTitle>{resume.title || "Untitled Resume"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Last updated: {new Date(resume.updated_at).toLocaleString()}
                </p>
                <Link href={`/dashboard/${resume.id}`}>
                  <Button size="sm">Edit</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
