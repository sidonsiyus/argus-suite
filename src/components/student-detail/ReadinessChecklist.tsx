import React from "react";
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText, 
  Globe, 
  CreditCard, 
  Car, 
  ShieldCheck, 
  HelpCircle 
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Student360Data } from "@/lib/data/student-detail";
import { cn } from "@/lib/utils";

interface ReadinessChecklistProps {
  readiness: Student360Data["readiness"];
}

interface ChecklistItem {
  id: string;
  label: string;
  icon: React.ElementType;
  status: string;
  rawResponse?: string;
}

export function ReadinessChecklist({ readiness }: ReadinessChecklistProps) {
  const items: ChecklistItem[] = [
    {
      id: "resume",
      label: "Professional Resume / CV",
      icon: FileText,
      status: readiness.resume_status,
      rawResponse: readiness.raw_responses?.["Resume Available?"] || readiness.raw_responses?.resume,
    },
    {
      id: "linkedin",
      label: "LinkedIn Profile / Presence",
      icon: Globe,
      status: readiness.linkedin_status,
      rawResponse: readiness.raw_responses?.["LinkedIn Profile Available?"] || readiness.raw_responses?.linkedin,
    },
    {
      id: "passport",
      label: "Valid Passport",
      icon: ShieldCheck,
      status: readiness.passport_status,
      rawResponse: readiness.raw_responses?.["Passport Available?"] || readiness.raw_responses?.passport,
    },
    {
      id: "driving_license",
      label: "Driving License",
      icon: Car,
      status: readiness.driving_license_status,
      rawResponse: readiness.raw_responses?.["Driving License Available?"] || readiness.raw_responses?.driving_license,
    },
    {
      id: "pan_card",
      label: "PAN Card",
      icon: CreditCard,
      status: readiness.pan_card_status,
      rawResponse: readiness.raw_responses?.["PAN Card Available?"] || readiness.raw_responses?.pan_card,
    },
    {
      id: "aadhaar_card",
      label: "Aadhaar Card",
      icon: CreditCard,
      status: readiness.aadhaar_card_status,
      rawResponse: readiness.raw_responses?.["Aadhaar Card Available?"] || readiness.raw_responses?.aadhaar_card,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
      case "VERIFIED":
        return (
          <Badge variant="emerald" size="sm" className="gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Available</span>
          </Badge>
        );
      case "IN_PROGRESS":
      case "APPLIED":
        return (
          <Badge variant="amber" size="sm" className="gap-1 font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>In Progress</span>
          </Badge>
        );
      case "UNAVAILABLE":
      case "NOT_AVAILABLE":
        return (
          <Badge variant="rose" size="sm" className="gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Not Available</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="stone" size="sm" className="gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
            <span>Not Reported</span>
          </Badge>
        );
    }
  };

  return (
    <Card className="border-border bg-surface">
      <CardHeader
        title="Career Readiness & Credentials (6 Core Verification Items)"
        subtitle={`${readiness.available_count} of 6 essential career items available`}
        action={
          <Badge
            variant={readiness.available_count >= 5 ? "emerald" : readiness.available_count >= 3 ? "amber" : "stone"}
            size="md"
            className="font-semibold"
          >
            {readiness.available_count} / 6 Verified
          </Badge>
        }
      />
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => {
            const Icon = item.icon;
            const isAvailable = item.status === "AVAILABLE" || item.status === "VERIFIED";

            return (
              <div
                key={item.id}
                className={cn(
                  "p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2",
                  isAvailable
                    ? "bg-stone-50/60 border-border"
                    : "bg-workspace border-border"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-stone-600" />
                    </div>
                    <span className="text-xs font-semibold text-ink">
                      {item.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <div className="text-[11px] text-stone-500 truncate max-w-[120px]">
                    {item.rawResponse ? `"${item.rawResponse}"` : "—"}
                  </div>
                  {getStatusBadge(item.status)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
