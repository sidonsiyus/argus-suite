"use client";

import React, { useState } from "react";
import {
  X,
  UserCheck,
  Compass,
  GraduationCap,
  HeartHandshake,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Save,
} from "lucide-react";
import { Student360Data } from "@/lib/data/student-detail";
import { updateStudentProfileAction } from "@/app/actions/profile";
import { useToast } from "@/components/ui/ToastProvider";

interface EditStudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  regNo: string;
  initialProfile: Student360Data["profile"];
  initialCareerGoal: Student360Data["careerGoal"];
  initialReadiness: Student360Data["readiness"];
  onSuccess?: () => void;
}

type TabType = "career" | "personal" | "mentoring" | "readiness";

export function EditStudentProfileModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  regNo,
  initialProfile,
  initialCareerGoal,
  initialReadiness,
  onSuccess,
}: EditStudentProfileModalProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("career");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State - Non-Sensitive Fields Only
  const [customRoleTitle, setCustomRoleTitle] = useState(
    initialCareerGoal?.custom_role_title || initialCareerGoal?.title || ""
  );
  const [dreamOrgs, setDreamOrgs] = useState(
    (initialProfile?.dream_organizations || []).join(", ")
  );
  const [afterGradPlan, setAfterGradPlan] = useState(
    initialProfile?.after_graduation_plan || ""
  );
  const [fiveYearVision, setFiveYearVision] = useState(
    initialProfile?.five_year_vision || ""
  );
  const [dgcaStatus, setDgcaStatus] = useState(
    initialProfile?.dgca_status || ""
  );

  const [whyAviation, setWhyAviation] = useState(
    initialProfile?.why_aviation || ""
  );
  const [inspiredBy, setInspiredBy] = useState(
    initialProfile?.inspired_by || ""
  );
  const [languages, setLanguages] = useState(
    (initialProfile?.languages || []).join(", ")
  );
  const [technicalExpertise, setTechnicalExpertise] = useState(
    initialProfile?.technical_expertise || ""
  );
  const [learningStyles, setLearningStyles] = useState(
    (initialProfile?.learning_styles || []).join(", ")
  );
  const [preferredCommunication, setPreferredCommunication] = useState(
    (initialProfile?.preferred_communication || []).join(", ")
  );
  const [sports, setSports] = useState(
    (initialProfile?.sports || []).join(", ")
  );
  const [hobbies, setHobbies] = useState(
    (initialProfile?.hobbies || []).join(", ")
  );

  const [biggestChallenge, setBiggestChallenge] = useState(
    initialProfile?.biggest_challenge || ""
  );
  const [mentorHelpNeeded, setMentorHelpNeeded] = useState(
    initialProfile?.mentor_help_needed || ""
  );

  // Readiness Statuses
  const [resumeStatus, setResumeStatus] = useState(
    initialReadiness?.resume_status || "NOT_REPORTED"
  );
  const [linkedinStatus, setLinkedinStatus] = useState(
    initialReadiness?.linkedin_status || "NOT_REPORTED"
  );
  const [passportStatus, setPassportStatus] = useState(
    initialReadiness?.passport_status || "NOT_REPORTED"
  );
  const [drivingLicenseStatus, setDrivingLicenseStatus] = useState(
    initialReadiness?.driving_license_status || "NOT_REPORTED"
  );
  const [panCardStatus, setPanCardStatus] = useState(
    initialReadiness?.pan_card_status || "NOT_REPORTED"
  );
  const [aadhaarCardStatus, setAadhaarCardStatus] = useState(
    initialReadiness?.aadhaar_card_status || "NOT_REPORTED"
  );

  if (!isOpen) return null;

  const splitComma = (val: string) =>
    val
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await updateStudentProfileAction({
        studentId,
        customRoleTitle: customRoleTitle.trim() || undefined,
        dreamOrganizations: splitComma(dreamOrgs),
        afterGraduationPlan: afterGradPlan.trim() || undefined,
        fiveYearVision: fiveYearVision.trim() || undefined,
        dgcaStatus: dgcaStatus.trim() || undefined,

        whyAviation: whyAviation.trim() || undefined,
        inspiredBy: inspiredBy.trim() || undefined,
        languages: splitComma(languages),
        technicalExpertise: technicalExpertise.trim() || undefined,
        learningStyles: splitComma(learningStyles),
        preferredCommunication: splitComma(preferredCommunication),
        sports: splitComma(sports),
        hobbies: splitComma(hobbies),

        biggestChallenge: biggestChallenge.trim() || undefined,
        mentorHelpNeeded: mentorHelpNeeded.trim() || undefined,

        readiness: {
          resume_status: resumeStatus as any,
          linkedin_status: linkedinStatus as any,
          passport_status: passportStatus as any,
          driving_license_status: drivingLicenseStatus as any,
          pan_card_status: panCardStatus as any,
          aadhaar_card_status: aadhaarCardStatus as any,
        },
      });

      if (res.success) {
        toast.success("Cadet profile updated successfully with verified mentor provenance.");
        onSuccess?.();
        onClose();
      } else {
        setError(res.error || "Failed to update profile.");
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusOptions = [
    { value: "AVAILABLE", label: "Available / Ready" },
    { value: "VERIFIED", label: "Verified by Faculty" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "APPLIED", label: "Applied / Pending Issuance" },
    { value: "NOT_AVAILABLE", label: "Not Available" },
    { value: "NOT_REPORTED", label: "Not Reported" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        className="bg-surface rounded-2xl border border-border max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-workspace">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="edit-profile-title" className="text-base font-semibold text-ink">
                Edit Cadet Mentoring Profile
              </h2>
              <p className="text-xs text-ink-muted">
                {studentName} · <span className="font-mono">{regNo}</span> · Provenance: MENTOR_ENTERED
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-subtle text-ink-muted hover:text-ink transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-surface px-6 pt-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("career")}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "career"
                ? "border-accent-emerald text-accent-emerald"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Career Aspirations</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "personal"
                ? "border-accent-emerald text-accent-emerald"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Academic & Profile</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("mentoring")}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "mentoring"
                ? "border-accent-emerald text-accent-emerald"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Mentoring Needs</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("readiness")}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "readiness"
                ? "border-accent-emerald text-accent-emerald"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Readiness Verification</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tab 1: Career Aspirations */}
          {activeTab === "career" && (
            <div className="space-y-3 animate-in fade-in duration-100">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">Primary Career Track / Target Role</label>
                <input
                  type="text"
                  value={customRoleTitle}
                  onChange={(e) => setCustomRoleTitle(e.target.value)}
                  placeholder="e.g. Flight Operations Officer, Airline Pilot, ATC"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">Target / Dream Organizations (comma-separated)</label>
                <input
                  type="text"
                  value={dreamOrgs}
                  onChange={(e) => setDreamOrgs(e.target.value)}
                  placeholder="e.g. IndiGo, Air India, Boeing, Emirates"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">Immediate Post-Graduation Plan</label>
                <textarea
                  rows={2}
                  value={afterGradPlan}
                  onChange={(e) => setAfterGradPlan(e.target.value)}
                  placeholder="e.g. Commercial Pilot License ground school, Flight Dispatcher certification exam"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">5-Year Career Vision</label>
                <textarea
                  rows={2}
                  value={fiveYearVision}
                  onChange={(e) => setFiveYearVision(e.target.value)}
                  placeholder="e.g. Senior Flight Dispatcher at international scheduled carrier"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">DGCA Exam / Licensing Status</label>
                <input
                  type="text"
                  value={dgcaStatus}
                  onChange={(e) => setDgcaStatus(e.target.value)}
                  placeholder="e.g. Preparing for Air Navigation & Met exams (Session 1 2026)"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Personal & Academic Profile */}
          {activeTab === "personal" && (
            <div className="space-y-3 animate-in fade-in duration-100">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">Why Aviation? (Student Motivation)</label>
                <textarea
                  rows={2}
                  value={whyAviation}
                  onChange={(e) => setWhyAviation(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">Inspired By</label>
                <input
                  type="text"
                  value={inspiredBy}
                  onChange={(e) => setInspiredBy(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">Technical Expertise & Certifications</label>
                <textarea
                  rows={2}
                  value={technicalExpertise}
                  onChange={(e) => setTechnicalExpertise(e.target.value)}
                  placeholder="e.g. Flight simulator proficiency, basic avionics troubleshooting, RT license"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">Languages Known (comma-separated)</label>
                  <input
                    type="text"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    placeholder="e.g. English, Tamil, Hindi"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">Learning Styles</label>
                  <input
                    type="text"
                    value={learningStyles}
                    onChange={(e) => setLearningStyles(e.target.value)}
                    placeholder="e.g. Visual, Hands-on, Simulation"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">Sports / Athletics</label>
                  <input
                    type="text"
                    value={sports}
                    onChange={(e) => setSports(e.target.value)}
                    placeholder="e.g. Badminton, Athletics, Swimming"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">Hobbies & Extracurriculars</label>
                  <input
                    type="text"
                    value={hobbies}
                    onChange={(e) => setHobbies(e.target.value)}
                    placeholder="e.g. Aeromodelling, Flight Sim, Drone Building"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Mentoring Needs */}
          {activeTab === "mentoring" && (
            <div className="space-y-3 animate-in fade-in duration-100">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">Cadet Stated Challenge</label>
                <textarea
                  rows={3}
                  value={biggestChallenge}
                  onChange={(e) => setBiggestChallenge(e.target.value)}
                  placeholder="e.g. Aviation Meteorology formulas, RT phraseology confidence"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">Mentor Support Requested</label>
                <textarea
                  rows={3}
                  value={mentorHelpNeeded}
                  onChange={(e) => setMentorHelpNeeded(e.target.value)}
                  placeholder="e.g. Recommendation letters, 1-on-1 mock interview preparation"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald resize-none"
                />
              </div>
            </div>
          )}

          {/* Tab 4: Readiness Verification */}
          {activeTab === "readiness" && (
            <div className="space-y-3 animate-in fade-in duration-100">
              <div className="p-3 bg-stone-50/70 border border-border rounded-xl text-xs text-ink-muted">
                Faculty mentors can update institutional verification status for core career credentials.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">Professional Resume / CV</label>
                  <select
                    value={resumeStatus}
                    onChange={(e) => setResumeStatus(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">LinkedIn Profile</label>
                  <select
                    value={linkedinStatus}
                    onChange={(e) => setLinkedinStatus(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">Valid Passport</label>
                  <select
                    value={passportStatus}
                    onChange={(e) => setPassportStatus(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">Driving License</label>
                  <select
                    value={drivingLicenseStatus}
                    onChange={(e) => setDrivingLicenseStatus(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">PAN Card Verification</label>
                  <select
                    value={panCardStatus}
                    onChange={(e) => setPanCardStatus(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">Aadhaar Card Verification</label>
                  <select
                    value={aadhaarCardStatus}
                    onChange={(e) => setAadhaarCardStatus(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface-subtle rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
