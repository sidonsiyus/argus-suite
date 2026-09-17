import React from "react";
import Link from "next/link";
import { PlusCircle, Calendar, BookOpen, Users, Award, Briefcase, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function QuickActionsBar() {
  const actions = [
    {
      label: "Schedule Session",
      href: "/sessions?action=new",
      icon: PlusCircle,
      variant: "primary" as const,
      className: "bg-emerald-800 hover:bg-emerald-900 text-white",
    },
    {
      label: "Calendar View",
      href: "/calendar",
      icon: Calendar,
      variant: "outline" as const,
    },
    {
      label: "Institutional Resources",
      href: "/resources",
      icon: BookOpen,
      variant: "outline" as const,
    },
    {
      label: "Intervention Groups",
      href: "/groups",
      icon: Users,
      variant: "outline" as const,
    },
    {
      label: "Internship Opportunities",
      href: "/internships",
      icon: Briefcase,
      variant: "outline" as const,
    },
  ];

  return (
    <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs font-semibold text-ink uppercase tracking-wider">
          Quick Faculty Shortcuts
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <Link key={act.label} href={act.href}>
                <Button
                  variant={act.variant}
                  size="sm"
                  className={`text-xs gap-1.5 h-8 font-medium ${act.className || ""}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {act.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
