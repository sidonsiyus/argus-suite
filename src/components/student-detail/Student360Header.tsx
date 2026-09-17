"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  GraduationCap, 
  Building, 
  Calendar,
  Compass,
  Star,
  CheckCircle2,
  ListTodo,
  Edit3,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Student360Data } from "@/lib/data/student-detail";
import { EditStudentProfileModal } from "./EditStudentProfileModal";

interface Student360HeaderProps {
  data: Student360Data;
}

export function Student360Header({ data }: Student360HeaderProps) {
  const { student, careerGoal, metrics } = data;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Back to roster link and Edit button */}
      <div className="flex items-center justify-between">
        <Link
          href="/mentor-os/students"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cadet Roster</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border text-ink hover:bg-surface-subtle hover:border-accent-emerald transition-all shadow-xs cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5 text-accent-emerald" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Main Header Banner */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Cadet Identification */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-900 text-emerald-100 flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
              {student.full_name.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-ink">
                  {student.full_name}
                </h1>
                <Badge variant="stone" size="md" className="font-mono font-medium">
                  {student.reg_no}
                </Badge>
                <Badge variant="emerald" size="md">
                  Cadet #{student.sno}
                </Badge>
              </div>

              {/* Cohort & Academic Info */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-stone-500 mt-2">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-stone-400" />
                  <span>{student.cohort?.programme || "B.Sc. Aeronautical Science"}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-stone-400" />
                  <span>Section {student.cohort?.section || "A"} ({student.cohort?.current_year_of_study || "2nd Year"})</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>AY {student.cohort?.academic_year || "2025 - 2026"}</span>
                </span>
              </div>

              {/* Direct Contact Info (Authorized on Student 360 Detail View) */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 mt-3 pt-3 border-t border-border/70">
                {student.phone ? (
                  <a
                    href={`tel:${student.phone}`}
                    className="flex items-center gap-1.5 hover:text-emerald-800 transition-colors font-mono"
                  >
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>{student.phone}</span>
                  </a>
                ) : (
                  <span className="flex items-center gap-1.5 text-stone-400">
                    <Phone className="w-3.5 h-3.5" />
                    <span>No phone on file</span>
                  </span>
                )}

                {student.email ? (
                  <a
                    href={`mailto:${student.email}`}
                    className="flex items-center gap-1.5 hover:text-emerald-800 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>{student.email}</span>
                  </a>
                ) : (
                  <span className="flex items-center gap-1.5 text-stone-400">
                    <Mail className="w-3.5 h-3.5" />
                    <span>No email on file</span>
                  </span>
                )}

                {careerGoal && (
                  <span className="flex items-center gap-1.5 text-stone-700">
                    <Compass className="w-3.5 h-3.5 text-emerald-700" />
                    <strong className="text-ink font-semibold">Track:</strong> {careerGoal.title}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-workspace p-3.5 rounded-xl border border-border shrink-0">
            <div className="text-center px-3">
              <span className="text-[10px] font-medium uppercase tracking-wider text-stone-400 block mb-0.5">
                Skills Avg
              </span>
              <div className="flex items-center justify-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-base font-bold text-ink">
                  {metrics.skillAverage !== null ? metrics.skillAverage.toFixed(1) : "—"}
                </span>
                <span className="text-[10px] text-stone-400">/5</span>
              </div>
            </div>

            <div className="text-center px-3 border-l border-border/80">
              <span className="text-[10px] font-medium uppercase tracking-wider text-stone-400 block mb-0.5">
                Readiness
              </span>
              <div className="flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-base font-bold text-ink">
                  {data.readiness.available_count}/6
                </span>
              </div>
            </div>

            <div className="text-center px-3 border-l border-border/80">
              <span className="text-[10px] font-medium uppercase tracking-wider text-stone-400 block mb-0.5">
                Active POAs
              </span>
              <div className="flex items-center justify-center gap-1">
                <ListTodo className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-base font-bold text-ink">
                  {metrics.activeMilestonesCount}
                </span>
              </div>
            </div>

            <div className="text-center px-3 border-l border-border/80">
              <span className="text-[10px] font-medium uppercase tracking-wider text-stone-400 block mb-0.5">
                Sessions
              </span>
              <div className="flex items-center justify-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-base font-bold text-ink">
                  {metrics.totalSessionsCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Student Profile Modal */}
      <EditStudentProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        studentId={student.id}
        studentName={student.full_name}
        regNo={student.reg_no}
        initialProfile={data.profile}
        initialCareerGoal={data.careerGoal}
        initialReadiness={data.readiness}
      />
    </div>
  );
}
