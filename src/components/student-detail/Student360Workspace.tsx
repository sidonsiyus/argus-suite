"use client";

import React, { useState } from "react";
import {
  User,
  GraduationCap,
  CalendarCheck,
  Briefcase,
  Layers,
  FileText,
} from "lucide-react";

interface Student360WorkspaceProps {
  overviewContent: React.ReactNode;
  developmentContent: React.ReactNode;
  sessionsContent: React.ReactNode;
  careerContent: React.ReactNode;
  documentsContent?: React.ReactNode;
  copilotContent: React.ReactNode;
  milestonesCount?: number;
  sessionsCount?: number;
  careerItemsCount?: number;
  documentsCount?: number;
}

type WorkspaceTab = "overview" | "development" | "sessions" | "career" | "documents" | "all";

export function Student360Workspace({
  overviewContent,
  developmentContent,
  sessionsContent,
  careerContent,
  documentsContent,
  copilotContent,
  milestonesCount = 0,
  sessionsCount = 0,
  careerItemsCount = 0,
  documentsCount = 0,
}: Student360WorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");
  const [docCount, setDocCount] = useState(documentsCount);

  React.useEffect(() => {
    setDocCount(documentsCount);
  }, [documentsCount]);

  const tabs: Array<{ id: WorkspaceTab; label: string; icon: React.ElementType; badge?: number }> = [
    { id: "overview", label: "Overview & Profile", icon: User },
    { id: "development", label: "Skills & Action Plans", icon: GraduationCap, badge: milestonesCount },
    { id: "sessions", label: "Mentoring Sessions", icon: CalendarCheck, badge: sessionsCount },
    { id: "career", label: "Career & Industry", icon: Briefcase, badge: careerItemsCount },
    { id: "documents", label: "Documents", icon: FileText, badge: docCount },
    { id: "all", label: "All Sections", icon: Layers },
  ];

  return (
    <div className="space-y-6">
      {/* Tabbed Navigation Bar */}
      <div className="bg-surface border border-border rounded-xl p-1.5 shadow-card">
        <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Student 360 Workspace Tabs">
          {tabs.map((t) => {
            const isSelected = activeTab === t.id;
            const Icon = t.icon;

            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-900 text-white shadow-sm"
                    : "text-ink-secondary hover:text-ink hover:bg-surface-subtle"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-300" : "text-ink-muted"}`} />
                <span>{t.label}</span>
                {t.badge !== undefined && t.badge > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? "bg-emerald-800 text-emerald-100"
                        : "bg-surface-subtle text-ink-muted border border-border"
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab: Overview & Profile */}
      {(activeTab === "overview" || activeTab === "all") && (
        <div className="space-y-6 animate-in fade-in duration-100">
          {overviewContent}
        </div>
      )}

      {/* Tab: Skills & Action Plans (Development) */}
      {(activeTab === "development" || activeTab === "all") && (
        <div className="space-y-6 animate-in fade-in duration-100">
          {developmentContent}
        </div>
      )}

      {/* Tab: Mentoring Sessions */}
      {(activeTab === "sessions" || activeTab === "all") && (
        <div className="space-y-6 animate-in fade-in duration-100">
          {sessionsContent}
        </div>
      )}

      {/* Tab: Career & Industry */}
      {(activeTab === "career" || activeTab === "all") && (
        <div className="space-y-6 animate-in fade-in duration-100">
          {careerContent}
        </div>
      )}

      {/* Tab: Documents */}
      {documentsContent && (activeTab === "documents" || activeTab === "all") && (
        <div className="space-y-6 animate-in fade-in duration-100">
          {React.isValidElement(documentsContent)
            ? React.cloneElement(documentsContent as React.ReactElement<{ onCountChange?: (count: number) => void }>, {
                onCountChange: setDocCount,
              })
            : documentsContent}
        </div>
      )}

      {/* AI Mentor Copilot - Always accessible as Advisory Panel */}
      <div className="pt-2 border-t border-border">
        {copilotContent}
      </div>
    </div>
  );
}
