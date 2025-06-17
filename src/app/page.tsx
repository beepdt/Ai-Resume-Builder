"use client"
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import "./globals.css"
import { Card } from "@/components/ui/card";
import image from "./../../public/Frame 1.svg"
export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen ">
      <img src="/Frame 1.svg" alt="Frame" className="absolute inset-0 w-full h-full object-cover -z-10" />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold  mb-6">
            AI-Powered Resume Builder
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create ATS-friendly resumes with AI assistance. Get personalized
            suggestions, keyword optimization, and professional templates.
          </p>

          <div className="space-x-4">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-block bg-[#2C1320] text-white px-8 py-3 rounded-lg font-semibold  transition duration-200"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="inline-block bg-[#2C1320] text-white px-8 py-3 rounded-lg font-semibold  transition duration-200"
                >
                  Build My Resume
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-block border-2 border-[#2C1320] text-[#2C1320] px-8 py-3 rounded-lg font-semibold transition duration-200"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <Card className="bg-gradient-to-br from-purple-400/20 via-gray-100 to-pink-900/20 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-4">ATS-Friendly</h3>
            <p className="text-gray-600">
              Our templates are optimized to pass Applicant Tracking Systems
              used by employers.
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-400/20 via-gray-100 to-pink-900/20 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-4">AI-Powered</h3>
            <p className="text-gray-600">
              Get intelligent suggestions for bullet points, summaries, and
              keyword optimization.
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-400/20 via-gray-100 to-pink-900/20 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
            <p className="text-gray-600">
              See your resume update in real-time as you make changes with our
              live preview.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
