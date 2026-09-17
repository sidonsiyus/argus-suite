import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MENTOR OS · Flight Mentorship & Career Console",
  description: "Production Aviation Student Development and Mentorship System",
};

export default function MentorOSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-workspace text-ink antialiased">
          {children}
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
