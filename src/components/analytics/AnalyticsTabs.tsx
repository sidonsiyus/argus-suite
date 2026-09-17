"use client";

import { useState } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AnalyticsTab {
  id: string;
  label: string;
  icon: LucideIcon;
  content: React.ReactNode;
}

export function AnalyticsTabs({ tabs, initial }: { tabs: AnalyticsTab[]; initial?: string }) {
  const [active, setActive] = useState(initial || tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) || tabs[0];

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border rounded-xl p-1.5 shadow-card">
        <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Analytics sections">
          {tabs.map((t) => {
            const on = t.id === active;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={on}
                onClick={() => setActive(t.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  on ? "bg-emerald-900 text-white shadow-sm" : "text-ink-secondary hover:text-ink hover:bg-surface-subtle"
                )}
              >
                <Icon className={cn("w-4 h-4", on ? "text-emerald-300" : "text-ink-muted")} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div key={active} className="mos-enter">
        {current?.content}
      </div>
    </div>
  );
}
