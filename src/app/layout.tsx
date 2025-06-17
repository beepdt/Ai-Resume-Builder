import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext";
import { Nunito_Sans } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'], // choose what you need
  display: 'swap', // improves rendering
});

export const metadata: Metadata = {
  title: "Resume Builder",
  description: "Build ATS-friendly resumes with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={nunitoSans.className}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
