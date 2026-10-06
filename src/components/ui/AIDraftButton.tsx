"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Loader2, CornerDownLeft, X } from "lucide-react";
import { draftWithAIAction } from "@/app/actions/ai-copilot";
import { useToast } from "@/components/ui/ToastProvider";

export interface AIDraftButtonProps {
  mode:
    | "session_notes"
    | "session_outcome"
    | "session_agenda"
    | "session_follow_up"
    | "poa_field"
    | "poa_full_plan";
  currentText?: string;
  text?: string;
  onDraftApplied?: (draftText: string, details?: any) => void;
  onDraft?: (draftText: string, details?: any) => void;
  context?: {
    studentName?: string;
    careerGoal?: string;
    sessionType?: string;
    fieldLabel?: string;
    currentTitle?: string;
    focusArea?: string;
    observationsText?: string;
    outcomeText?: string;
    poaFieldName?: string;
    poaTitle?: string;
    targetOutcome?: string;
    [key: string]: any;
  };
  buttonLabel?: string;
  className?: string;
  compact?: boolean;
}

export function AIDraftButton({
  mode,
  currentText,
  text,
  onDraftApplied,
  onDraft,
  context,
  buttonLabel = "Draft with AI",
  className = "",
  compact = false,
}: AIDraftButtonProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [showPromptPopover, setShowPromptPopover] = useState(false);
  const [inlineKeywords, setInlineKeywords] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeText = currentText ?? text ?? "";
  const handleApplyDraft = onDraftApplied ?? onDraft ?? (() => {});

  useEffect(() => {
    if (showPromptPopover) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showPromptPopover]);

  // Click outside listener to close prompt popover
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPromptPopover(false);
      }
    }
    if (showPromptPopover) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPromptPopover]);

  const handleGenerate = async (keywordsToUse: string) => {
    const trimmed = keywordsToUse.trim();
    if (!trimmed) {
      toast.info("Please enter a few keywords or notes first.");
      return;
    }

    setLoading(true);
    try {
      const res = await draftWithAIAction({
        mode,
        text: trimmed,
        context,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to generate AI draft");
      } else {
        handleApplyDraft(res.draft, res.details);
        toast.success("✨ AI draft generated! Review and adjust as needed.");
        setShowPromptPopover(false);
        setInlineKeywords("");
      }
    } catch {
      toast.error("Network error while connecting to AI service.");
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If text is already entered in the field, draft from it directly
    if (activeText && activeText.trim().length > 0) {
      handleGenerate(activeText);
    } else {
      // If field is empty, open prompt popover so mentor can type keywords
      setShowPromptPopover((prev) => !prev);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={loading}
        title={
          text?.trim()
            ? "Expand/polish current text with AI"
            : "Enter keywords to draft with AI"
        }
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
          loading
            ? "bg-accent-emerald/15 text-accent-emerald opacity-80 cursor-wait border border-accent-emerald/30"
            : "bg-accent-emerald/10 hover:bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/25 hover:border-accent-emerald/40 active:scale-95 shadow-2xs"
        } ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin shrink-0" />
            <span className="hidden sm:inline">Drafting...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-3 h-3 text-accent-emerald shrink-0" />
            {!compact && <span>{buttonLabel}</span>}
          </>
        )}
      </button>

      {/* Inline Keywords Popover (shown if field was empty) */}
      {showPromptPopover && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-72 p-2.5 rounded-xl bg-surface border border-border shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between mb-1.5 text-[11px] font-semibold text-ink">
            <span className="flex items-center gap-1 text-accent-emerald">
              <Sparkles className="w-3 h-3" />
              <span>Draft from Keywords</span>
            </span>
            <button
              type="button"
              onClick={() => setShowPromptPopover(false)}
              className="text-ink-muted hover:text-ink cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[10px] text-ink-muted mb-2">
            Enter rough keywords or bullet points to generate a professional draft:
          </p>
          <div className="flex gap-1.5">
            <input
              ref={inputRef}
              type="text"
              value={inlineKeywords}
              onChange={(e) => setInlineKeywords(e.target.value)}
              placeholder="e.g. navigation weak, rtr exam discuss..."
              className="flex-1 text-xs px-2.5 py-1 rounded-lg border border-border bg-workspace text-ink focus:outline-none focus:border-accent-emerald"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleGenerate(inlineKeywords);
                }
              }}
            />
            <button
              type="button"
              disabled={loading || !inlineKeywords.trim()}
              onClick={() => handleGenerate(inlineKeywords)}
              className="px-2 py-1 rounded-lg bg-accent-emerald text-white text-[11px] font-semibold hover:bg-accent-emerald/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <CornerDownLeft className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
