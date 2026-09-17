import React from "react";
import { 
  History, 
  Sparkles, 
  Compass, 
  BookOpen, 
  Languages, 
  Activity, 
  HelpCircle,
  Award,
  HeartHandshake
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Student360Data } from "@/lib/data/student-detail";

interface HistoricalProfileCardProps {
  profile: Student360Data["profile"];
  historicalStrengths: string[];
  historicalWeaknesses: string[];
}

export function HistoricalProfileCard({
  profile,
  historicalStrengths,
  historicalWeaknesses,
}: HistoricalProfileCardProps) {
  const hasHistoricalNotes =
    historicalStrengths.length > 0 || historicalWeaknesses.length > 0;

  return (
    <Card className="border-border bg-surface">
      <CardHeader
        title="Cadet Background & Historical Profile"
        subtitle="Qualitative baseline & student self-reported intake"
        action={
          <Badge variant="stone" size="sm" className="font-mono text-[10px]">
            HISTORICAL_PROFILE
          </Badge>
        }
      />
      <CardContent className="space-y-6">
        {/* Historical Strengths & Weaknesses (Preserved from Historical JSON) */}
        {hasHistoricalNotes && (
          <div className="p-4 rounded-xl bg-workspace border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-800 shrink-0" />
                <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">
                  Historical Observations (Pre-Migration Record)
                </h4>
              </div>
              <Badge variant="stone" size="sm" className="font-mono text-[10px]">
                PROVENANCE: HISTORICAL_PROFILE
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/70">
              {/* Strengths */}
              <div>
                <span className="text-xs font-semibold text-emerald-800 block mb-1.5">
                  Recorded Strengths:
                </span>
                {historicalStrengths.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {historicalStrengths.map((str, i) => (
                      <Badge key={i} variant="emerald" size="sm">
                        {str}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-stone-400 italic">None logged</span>
                )}
              </div>

              {/* Weaknesses / Growth Areas */}
              <div>
                <span className="text-xs font-semibold text-amber-800 block mb-1.5">
                  Growth Areas / Focus Needs:
                </span>
                {historicalWeaknesses.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {historicalWeaknesses.map((w, i) => (
                      <Badge key={i} variant="amber" size="sm">
                        {w}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-stone-400 italic">None logged</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Aviation Motivation & Inspiration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-surface-subtle/70 border border-border space-y-1">
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
              Why Aviation?
            </span>
            <p className="text-xs text-ink leading-relaxed">
              {profile?.why_aviation || "Not specified during onboarding"}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-subtle/70 border border-border space-y-1">
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
              Inspiration
            </span>
            <p className="text-xs text-ink leading-relaxed">
              {profile?.inspired_by || "Not specified during onboarding"}
            </p>
          </div>
        </div>

        {/* Dream Organizations & Languages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dream Organizations */}
          <div className="p-3.5 rounded-xl bg-workspace border border-border space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-secondary uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
              <span>Target / Dream Organizations</span>
            </div>
            {profile?.dream_organizations && profile.dream_organizations.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.dream_organizations.map((org, i) => (
                  <Badge key={i} variant="stone" size="sm">
                    {org}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 dark:text-ink-muted italic">No organizations selected</p>
            )}
          </div>

          {/* Languages Spoken */}
          <div className="p-3.5 rounded-xl bg-workspace border border-border space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-secondary uppercase tracking-wider">
              <Languages className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
              <span>Languages Known</span>
            </div>
            {profile?.languages && profile.languages.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.languages.map((lang, i) => (
                  <Badge key={i} variant="stone" size="sm">
                    {lang}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">Not specified</p>
            )}
          </div>
        </div>

        {/* Learning & Communication Styles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-stone-50/70 border border-border space-y-2">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Learning Styles
            </span>
            {profile?.learning_styles && profile.learning_styles.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.learning_styles.map((style, i) => (
                  <Badge key={i} variant="stone" size="sm">
                    {style}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">Not specified</p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50/70 border border-border space-y-2">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Preferred Communication
            </span>
            {profile?.preferred_communication && profile.preferred_communication.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.preferred_communication.map((comm, i) => (
                  <Badge key={i} variant="stone" size="sm">
                    {comm}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">Not specified</p>
            )}
          </div>
        </div>

        {/* Academic Baseline & Technical Expertise */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-workspace border border-border">
            <span className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">
              SSLC Score
            </span>
            <span className="text-sm font-bold text-ink">
              {profile?.sslc_score || "—"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-workspace border border-border">
            <span className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">
              HSC Score
            </span>
            <span className="text-sm font-bold text-ink">
              {profile?.hsc_score || "—"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-workspace border border-border">
            <span className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">
              Technical Expertise
            </span>
            <span className="text-xs font-semibold text-ink truncate block">
              {profile?.technical_expertise || "—"}
            </span>
          </div>
        </div>

        {/* Mentoring Needs & Challenges */}
        {(profile?.biggest_challenge || profile?.mentor_help_needed) && (
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4 text-amber-700" />
              <span>Mentoring Guidance & Self-Reported Challenges</span>
            </div>

            {profile.biggest_challenge && (
              <div className="text-xs text-amber-950">
                <strong className="font-semibold block mb-0.5">Biggest Challenge:</strong>
                <p className="leading-relaxed">{profile.biggest_challenge}</p>
              </div>
            )}

            {profile.mentor_help_needed && (
              <div className="text-xs text-amber-950 pt-2 border-t border-amber-200/60">
                <strong className="font-semibold block mb-0.5">Mentor Support Requested:</strong>
                <p className="leading-relaxed">{profile.mentor_help_needed}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
