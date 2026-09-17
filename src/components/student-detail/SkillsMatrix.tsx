import React from "react";
import { Star, ShieldAlert, Layers } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Student360Data } from "@/lib/data/student-detail";
import { cn } from "@/lib/utils";

interface SkillsMatrixProps {
  skills: Student360Data["skills"];
}

export function SkillsMatrix({ skills }: SkillsMatrixProps) {
  // Sort or group skills
  return (
    <Card className="border-border bg-surface">
      <CardHeader
        title="Universal Skills Matrix (10 Core Competencies)"
        subtitle="Append-only assessment baseline"
        action={
          <div className="flex items-center gap-1.5">
            <Badge variant="stone" size="sm" className="font-mono text-[10px]">
              SELF_REPORTED
            </Badge>
            <Badge variant="stone" size="sm" className="font-mono text-[10px]">
              STUDENT_REPORTED
            </Badge>
          </div>
        }
      />
      <CardContent>
        {skills.length === 0 ? (
          <p className="text-sm text-stone-400 italic">No skill assessments recorded.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {skills.map((skill) => {
              const rating = skill.rating || 0;
              const percent = Math.round((rating / 5) * 100);

              return (
                <div
                  key={skill.id}
                  className="p-3.5 rounded-xl bg-workspace border border-border flex flex-col justify-between space-y-2 hover:border-emerald-800/30 transition-colors"
                >
                  {/* Skill Title & Category */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-ink">
                        {skill.name}
                      </h4>
                      <span className="text-[11px] text-stone-400 capitalize">
                        {skill.category.toLowerCase().replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-surface px-2 py-0.5 rounded-md border border-border shrink-0">
                      <Star className={cn("w-3.5 h-3.5", rating > 0 ? "text-amber-500 fill-amber-500" : "text-stone-300 dark:text-stone-600")} />
                      <span className="font-bold text-xs text-ink">{rating}</span>
                      <span className="text-[10px] text-stone-400 dark:text-ink-muted">/5</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-surface-subtle overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          rating >= 4
                            ? "bg-emerald-600"
                            : rating >= 3
                            ? "bg-blue-600"
                            : rating >= 2
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        )}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Provenance footer */}
                  <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-border/50">
                    <span className="font-mono">{skill.assessment_type}</span>
                    <span>Source: {skill.provenance}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
