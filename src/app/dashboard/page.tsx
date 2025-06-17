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
import { ResumeCard } from "@/components/resume/ResumeCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, PlusIcon } from "lucide-react";
import image from "./../../../public/Frame 1.svg";

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
    <div className="min-h-screen bg-[#f5f5f5]">
      
      <nav className="  px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/*User Image and name and logout */}
          <div className="flex items-center space-x-4 h-16">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 hover:bg-transparent cursor-pointer"
                >
                  <div className="flex items-center space-x-2 bg-white pl-2 pt-2 pb-2 sm:pr-4 rounded-full">
                    {user.user_metadata?.avatar_url && (
                      <Image
                        src={user.user_metadata.avatar_url}
                        alt="User Avatar"
                        width={36}
                        height={36}
                        className="rounded-full"
                      />
                    )}
                    <h2 className="hidden text-md font-bold sm:inline">
                      {user.user_metadata?.full_name || user.email || "User"}
                    </h2>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              {/*Logout Button */}
              <DropdownMenuContent align="end" className="w-56 ml-6 mt-2">
                <DropdownMenuItem
                  onClick={signOut}
                  className="text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2" />
                  <h1 className="font-medium text-[16px]">Logout</h1>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/*Create Button */}
          <Link href="/dashboard/new">
            <Button className="cursor-pointer h-12 rounded-full">
              <PlusIcon />
              <span className="hidden sm:inline mr-2">Create Resume</span>
              <span className="sm:hidden mr-2">Create</span>
            </Button>
          </Link>
        </div>
      </nav>
      <main className="p-6">
        {loadingResumes ? (
          <p>Loading resumes...</p>
        ) : resumes.length === 0 ? (
          <p className="items-center text-center justify-center text-gray-500">
            No resumes yet. Click{" "}
            <span className="text-black font-bold p-1">Create New Resume</span>{" "}
            to get started.
          </p>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={{
                  id: resume.id,
                  full_name:
                    resume.personal_info.full_name || "Untitled Resume",
                  title: resume.title || "No Title",
                  summary:
                    resume.personal_info.summary || "No summary provided.",
                  updated_at: resume.updated_at,
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
