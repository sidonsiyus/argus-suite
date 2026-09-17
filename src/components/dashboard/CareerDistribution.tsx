import React from "react";
import Link from "next/link";
import { Compass } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { CareerDistributionItem } from "@/lib/data/dashboard";

interface CareerDistributionProps {
  items: CareerDistributionItem[];
  totalStudents: number;
}

export function CareerDistribution({ items, totalStudents }: CareerDistributionProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-800">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Career Pathways</h3>
            <p className="text-xs text-ink-muted">
              Cadet distribution across 8 aviation tracks
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 flex-1 space-y-3.5">
        {items.length === 0 ? (
          <div className="py-6 text-center text-xs text-ink-muted">
            <p className="font-medium text-ink">No Career Tracks Recorded</p>
            <p className="mt-1">Career pathway distributions will appear once assigned.</p>
          </div>
        ) : (
          items.map((item) => {
            const percent = totalStudents > 0 ? Math.round((item.count / totalStudents) * 100) : 0;
            return (
              <div key={item.role_id || item.slug} className="group">
                <div className="flex items-center justify-between text-xs mb-1">
                  <Link
                    href={`/students?career=${encodeURIComponent(item.title)}`}
                    className="font-medium text-ink group-hover:text-emerald-800 transition-colors"
                  >
                    {item.title}
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-ink-secondary">{item.count}</span>
                    <span className="text-[11px] text-ink-muted font-mono w-9 text-right">
                      {percent}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-surface-subtle rounded-full overflow-hidden border border-border/40">
                  <div
                    className="h-full bg-emerald-700/90 rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
