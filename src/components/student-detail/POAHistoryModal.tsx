"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  History,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  PlusCircle,
  Edit,
  ArrowRight,
} from "lucide-react";
import { getPOAHistoryAction } from "@/app/actions/poa";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface POAHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  poaId: string;
  studentId: string;
  poaTitle: string;
}

export function POAHistoryModal({
  isOpen,
  onClose,
  poaId,
  studentId,
  poaTitle,
}: POAHistoryModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    poa?: any;
    statusHistory: any[];
    auditLogs: any[];
  }>({
    statusHistory: [],
    auditLogs: [],
  });

  useEffect(() => {
    if (isOpen && poaId) {
      setLoading(true);
      getPOAHistoryAction(poaId, studentId).then((res) => {
        if (res.success) {
          setData({
            poa: res.poa,
            statusHistory: res.statusHistory || [],
            auditLogs: res.auditLogs || [],
          });
        }
        setLoading(false);
      });
    }
  }, [isOpen, poaId, studentId]);

  if (!isOpen) return null;

  // Combine and sort events chronologically
  const events: any[] = [];

  // 1. Initial Creation Event
  if (data.poa?.created_at) {
    events.push({
      id: "creation",
      type: "CREATION",
      title: "Plan of Action Created",
      timestamp: data.poa.created_at,
      details: `Initialized as ${data.poa.status} with provenance ${data.poa.provenance || "MENTOR_ENTERED"}.`,
      badgeText: "Created",
      badgeVariant: "emerald",
    });
  }

  // 2. Status Transitions from milestone_status_history
  data.statusHistory.forEach((sh) => {
    events.push({
      id: `sh-${sh.id}`,
      type: "STATUS_CHANGE",
      title: `Status Changed: ${sh.from_status || "INITIAL"} → ${sh.to_status}`,
      timestamp: sh.created_at,
      details: sh.reason || "Status updated by faculty mentor.",
      badgeText: sh.to_status,
      badgeVariant: sh.to_status === "COMPLETED" ? "emerald" : sh.to_status === "ACTIVE" ? "blue" : "stone",
    });
  });

  // 3. Audit Logs
  data.auditLogs.forEach((al) => {
    const isTask = al.entity_table === "milestone_tasks";
    const newVals = al.new_values || {};
    const oldVals = al.old_values || {};

    let title = "Milestone Updated";
    let details = "";
    let badgeText = al.action;
    let badgeVariant: "stone" | "emerald" | "blue" | "rose" = "stone";

    if (newVals.action === "REOPEN_POA") {
      title = "Plan of Action Reopened";
      details = newVals.reason || "Moved back to ACTIVE for additional work.";
      badgeText = "Reopened";
      badgeVariant = "blue";
    } else if (isTask) {
      if (al.action === "INSERT") {
        title = `Task Added: "${newVals.title || "New Task"}"`;
        details = newVals.description || "Added to actionable subtasks.";
        badgeText = "Task Added";
        badgeVariant = "emerald";
      } else if (newVals.completed !== undefined) {
        title = newVals.completed
          ? `Task Completed: "${newVals.task_id || "Task"}"`
          : `Task Reopened: "${newVals.task_id || "Task"}"`;
        details = newVals.parent_completion_percentage !== undefined
          ? `Parent POA progress updated to ${newVals.parent_completion_percentage}%.`
          : "Completion status toggled.";
        badgeText = newVals.completed ? "Completed" : "Reopened";
        badgeVariant = newVals.completed ? "emerald" : "stone";
      } else {
        title = `Task Updated: "${newVals.title || oldVals.title || "Task"}"`;
        details = "Task title or details modified by mentor.";
        badgeText = "Task Edited";
      }
    } else {
      if (newVals.mentor_feedback && newVals.mentor_feedback !== oldVals.mentor_feedback) {
        title = "Mentor Guidance Updated";
        details = `New feedback: "${newVals.mentor_feedback}"`;
        badgeText = "Feedback";
        badgeVariant = "blue";
      } else {
        title = "POA Details Modified";
        const changedKeys = Object.keys(newVals).filter(
          (k) => newVals[k] !== undefined && oldVals[k] !== undefined && newVals[k] !== oldVals[k]
        );
        details = changedKeys.length > 0
          ? `Fields changed: ${changedKeys.join(", ")}`
          : "Descriptive attributes updated by mentor.";
        badgeText = "Edited";
      }
    }

    events.push({
      id: `audit-${al.id}`,
      type: "AUDIT",
      title,
      timestamp: al.created_at,
      details,
      badgeText,
      badgeVariant,
      actor: al.actor_role === "faculty" ? "Faculty Mentor" : al.actor_role,
      oldVals,
      newVals,
    });
  });

  // Sort newest first
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="poa-history-modal-title"
        className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-workspace/40 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 id="poa-history-modal-title" className="text-base font-bold text-ink">
                POA Lifecycle History
              </h2>
              <p className="text-xs text-ink-muted truncate max-w-md">
                Audit trail for: <strong className="text-ink">{poaTitle}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-ink-muted hover:text-ink rounded-lg hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {loading ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-6 h-6 border-2 border-accent-emerald border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-ink-muted">Loading complete audit history...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-xs text-ink-muted">
              No audit logs recorded for this Plan of Action yet.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {events.map((evt) => (
                <div key={evt.id} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border-2 border-surface bg-accent-emerald group-hover:scale-125 transition-transform" />

                  <div className="p-3.5 rounded-xl border border-border bg-workspace/50 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold text-ink">{evt.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={evt.badgeVariant} size="sm" className="text-[10px]">
                          {evt.badgeText}
                        </Badge>
                        <span className="text-[10px] text-ink-muted font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(evt.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {evt.details && (
                      <p className="text-xs text-ink-secondary leading-relaxed">
                        {evt.details}
                      </p>
                    )}

                    {evt.actor && (
                      <div className="pt-1 flex items-center gap-1 text-[10px] text-ink-muted">
                        <User className="w-3 h-3" />
                        <span>Actor: <strong className="text-ink">{evt.actor}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between bg-workspace/30 text-[11px] text-ink-muted">
          <span>Immutable audit records verified by MENTOR OS</span>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
