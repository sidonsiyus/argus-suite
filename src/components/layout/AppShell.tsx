"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar, BreadcrumbItem } from "./TopBar";

interface AppShellProps {
  title: string;
  subtitle?: string;
  attentionCount?: number;
  studentsIndex?: Array<{
    id: string;
    full_name: string;
    reg_no: string;
    career_goal?: string;
  }>;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
}

export function AppShell({
  title,
  subtitle,
  attentionCount,
  studentsIndex,
  breadcrumbs,
  children,
}: AppShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-workspace">
      {/* Sidebar (Desktop Persistent + Mobile Drawer) */}
      <Sidebar
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          title={title}
          subtitle={subtitle}
          attentionCount={attentionCount}
          studentsIndex={studentsIndex}
          breadcrumbs={breadcrumbs}
          onMenuClick={() => setIsMobileNavOpen(true)}
        />
        <main key={pathname} className="mos-enter flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
