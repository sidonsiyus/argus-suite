import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MENTOR OS · Flight Mentorship & Career Console",
  description: "Production Aviation Student Development and Mentorship System",
};

// Applies the persisted theme class before paint so dark-mode mentors don't see
// a light flash on load/navigation. Mirrors ThemeProvider (key + resolution),
// which then takes over on hydration.
const themeInitScript = `(function(){try{var t=localStorage.getItem('mentor_os_theme');var d=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;if(d)r.classList.add('dark');else r.classList.remove('dark');}catch(e){}})();`;

export default function MentorOSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      <ThemeProvider>
        <ToastProvider>
          <div className="min-h-screen bg-workspace text-ink antialiased">
            {children}
          </div>
        </ToastProvider>
      </ThemeProvider>
    </>
  );
}
