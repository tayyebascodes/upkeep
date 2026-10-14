import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Upkeep | AI Maintenance Agent for Real Estate",
  description: "Autonomous real-time voice call and chat maintenance triage for property management companies and tenants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
