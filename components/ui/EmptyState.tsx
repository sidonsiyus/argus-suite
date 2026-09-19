import React from 'react';
import { LucideIcon, Plus } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="p-12 text-center flex flex-col items-center justify-center border border-dashed border-surface-border rounded-xl bg-white/50">
      <div className="w-12 h-12 rounded-xl bg-aviation-50 text-aviation-800 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-aviation-700" />
      </div>
      <h3 className="text-sm font-bold text-aviation-950 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-aviation hover:bg-aviation-800 text-white text-xs font-semibold shadow-2xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
