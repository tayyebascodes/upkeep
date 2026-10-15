import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { OnboardingGuide } from "@/components/OnboardingGuide";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Upkeep | AI Maintenance Agent for Real Estate",
  description: "Voice and chat maintenance triage for property managers and tenants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">
        {children}
        <OnboardingGuide />
      </body>
    </html>
  );
}
