import React from "react";
import { Compass, CheckSquare, Target, Clock, Award } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Student360Data } from "@/lib/data/student-detail";

interface CareerGoalCardProps {
  careerGoal: Student360Data["careerGoal"];
  profile: Student360Data["profile"];
}

export function CareerGoalCard({ careerGoal, profile }: CareerGoalCardProps) {
  if (!careerGoal && !profile?.after_graduation_plan && !profile?.five_year_vision) {
    return (
      <Card className="border-border bg-surface">
        <CardHeader title="Career Pathway & Aspirations" />
        <CardContent>
          <p className="text-sm text-stone-400 italic">No career goal recorded for this cadet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-surface">
      <CardHeader
        title="Career Pathway & Aspirations"
        action={
          careerGoal?.provenance && (
            <Badge variant="stone" size="sm" className="font-mono text-[10px]">
              {careerGoal.provenance}
            </Badge>
          )
        }
      />
      <CardContent className="space-y-4">
        {/* Primary Role & Category */}
        {careerGoal && (
          <div className="bg-workspace border border-border p-4 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-800 shrink-0" />
                <span className="font-semibold text-ink text-base">
                  {careerGoal.title}
                </span>
              </div>
              {careerGoal.category && (
                <Badge variant="emerald" size="sm">
                  {careerGoal.category}
                </Badge>
              )}
            </div>

            {/* Prerequisites */}
            {careerGoal.prerequisites && careerGoal.prerequisites.length > 0 && (
              <div className="pt-2 border-t border-border/70">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                  Role Prerequisites & Standard Qualifications:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {careerGoal.prerequisites.map((prereq, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-stone-600 bg-surface px-2.5 py-1.5 rounded-lg border border-border/60"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{prereq}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Immediate Post-Graduation Plan & 5-Year Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-surface-subtle/70 border border-border">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-1.5">
              <Target className="w-3.5 h-3.5 text-ink-muted" />
              <span>Immediate Post-Grad Plan</span>
            </div>
            <p className="text-xs text-ink leading-relaxed">
              {profile?.after_graduation_plan || "No post-graduation plan stated"}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-subtle/70 border border-border">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-1.5">
              <Clock className="w-3.5 h-3.5 text-ink-muted" />
              <span>5-Year Career Vision</span>
            </div>
            <p className="text-xs text-ink leading-relaxed">
              {profile?.five_year_vision || "No 5-year vision stated"}
            </p>
          </div>
        </div>

        {/* DGCA Status if present */}
        {profile?.dgca_status && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl text-xs text-emerald-900">
            <Award className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <strong className="font-semibold">DGCA / Licensing Status:</strong>{" "}
              <span>{profile.dgca_status}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
