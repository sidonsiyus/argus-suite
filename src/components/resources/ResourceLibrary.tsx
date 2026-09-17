"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Plus,
  ExternalLink,
  Building,
  Target,
  Filter,
  Eye,
  Edit,
  Archive,
  RotateCcw,
  Sparkles,
  Layers,
  UploadCloud,
  FileText,
  Download,
  Trash2,
} from "lucide-react";
import {
  ResourceItem,
  ResourceType,
  RESOURCE_TYPES,
  RESOURCE_CATEGORIES,
} from "@/lib/resources/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ResourceFormDialog } from "./ResourceFormDialog";
import { ResourceDetailDrawer } from "./ResourceDetailDrawer";
import { LinkMilestoneDialog } from "./LinkMilestoneDialog";
import { UploadResourceModal } from "./UploadResourceModal";
import {
  archiveResourceAction,
  deleteResourceAction,
  getResourceFileUrlAction,
} from "@/app/actions/resources";

interface CadetSummary {
  id: string;
  full_name: string;
  reg_no: string;
  career_goal?: string;
}

interface ResourceLibraryProps {
  initialResources: ResourceItem[];
  studentsIndex: CadetSummary[];
}

export function ResourceLibrary({
  initialResources,
  studentsIndex,
}: ResourceLibraryProps) {
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"active" | "archived" | "all">("active");

  // Modal / Drawer States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<ResourceItem | null>(null);
  const [detailResource, setDetailResource] = useState<ResourceItem | null>(null);
  const [linkingResource, setLinkingResource] = useState<ResourceItem | null>(null);

  // Filter logic
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      // Status filter
      if (statusFilter === "active" && !res.is_active) return false;
      if (statusFilter === "archived" && res.is_active) return false;

      // Category filter
      if (selectedCategory !== "all" && res.category !== selectedCategory) return false;

      // Type filter
      if (selectedType !== "all" && res.resource_type !== selectedType) return false;

      // Search query (title, provider, description, tags)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = res.title.toLowerCase().includes(q);
        const matchesProvider = res.provider?.toLowerCase().includes(q) || false;
        const matchesDesc = res.description?.toLowerCase().includes(q) || false;
        const matchesTags = res.tags?.some((t) => t.toLowerCase().includes(q)) || false;
        if (!matchesTitle && !matchesProvider && !matchesDesc && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [resources, searchQuery, selectedCategory, selectedType, statusFilter]);

  const handleOpenCreate = () => {
    setResourceToEdit(null);
    setIsFormOpen(true);
  };

  const handleUploadSuccess = (newRes?: ResourceItem) => {
    if (newRes) {
      setResources((prev) => [newRes, ...prev.filter((r) => r.id !== newRes.id)]);
    }
  };

  const handleViewFile = async (resourceId: string) => {
    try {
      const res = await getResourceFileUrlAction(resourceId, false);
      if (res.success && res.url) {
        window.open(res.url, "_blank", "noopener,noreferrer");
      } else {
        alert(res.error || "Failed to retrieve view link");
      }
    } catch {
      alert("Error opening resource document preview.");
    }
  };

  const handleDownloadFile = async (resourceId: string, title?: string) => {
    try {
      const res = await getResourceFileUrlAction(resourceId, true);
      if (res.success && res.url) {
        const link = document.createElement("a");
        link.href = res.url;
        link.download = title || "resource-document";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert(res.error || "Failed to retrieve download link");
      }
    } catch {
      alert("Error downloading resource document.");
    }
  };

  const handleDeleteResource = async (resourceId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }
    try {
      const res = await deleteResourceAction(resourceId);
      if (res.success) {
        setResources((prev) => prev.filter((r) => r.id !== resourceId));
      } else {
        alert(res.error || "Failed to delete resource");
      }
    } catch {
      alert("Error deleting resource");
    }
  };

  const handleOpenEdit = (res: ResourceItem) => {
    setResourceToEdit(res);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (res: ResourceItem) => {
    setDetailResource(res);
  };

  const handleOpenLinkModal = (res: ResourceItem) => {
    setLinkingResource(res);
  };

  const handleToggleArchive = async (res: ResourceItem) => {
    try {
      const resp = await archiveResourceAction(res.id, !res.is_active);
      if (resp.success) {
        setResources((prev) =>
          prev.map((r) => (r.id === res.id ? { ...r, is_active: !r.is_active } : r))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            <h1 className="text-xl font-bold text-ink tracking-tight">Resource Library</h1>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Curated aviation knowledge assets, DGCA exam manuals, and interview preparation materials.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-accent-emerald bg-accent-emerald/10 hover:bg-accent-emerald/20 border border-accent-emerald/30 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Resource</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-accent-emerald hover:bg-accent-emerald/90 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by resource title, provider, or competency tag..."
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
            />
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-52">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
            >
              <option value="all">All Categories</option>
              {RESOURCE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Resource Type Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-border bg-workspace text-ink focus:outline-none focus:ring-2 focus:ring-accent-emerald/20 focus:border-accent-emerald"
            >
              <option value="all">All Types</option>
              {RESOURCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === "active"
                  ? "bg-accent-emerald text-white"
                  : "text-ink-muted hover:text-ink hover:bg-surface-subtle"
              }`}
            >
              Active Catalog
            </button>
            <button
              onClick={() => setStatusFilter("archived")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === "archived"
                  ? "bg-accent-emerald text-white"
                  : "text-ink-muted hover:text-ink hover:bg-surface-subtle"
              }`}
            >
              Archived
            </button>
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-accent-emerald text-white"
                  : "text-ink-muted hover:text-ink hover:bg-surface-subtle"
              }`}
            >
              All Records
            </button>
          </div>

          <div className="text-xs text-ink-muted font-mono">
            Showing {filteredResources.length} of {resources.length} resources
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      {filteredResources.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={resources.length === 0 ? "No resources in library yet." : "No matching resources."}
          description={
            resources.length === 0
              ? "Start by adding your first verified learning resource or study guide to prescribe across cadet milestones."
              : "Try clearing search filters or changing the category."
          }
          action={
            resources.length === 0 ? (
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-accent-emerald rounded-xl hover:bg-accent-emerald/90 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Resource</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedType("all");
                  setStatusFilter("active");
                }}
                className="px-3.5 py-1.5 text-xs font-medium text-ink bg-surface border border-border rounded-xl hover:bg-surface-subtle transition-colors"
              >
                Clear Filters
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => {
            const categoryLabel =
              RESOURCE_CATEGORIES.find((c) => c.value === res.category)?.label || res.category;
            const typeLabel =
              RESOURCE_TYPES.find((t) => t.value === res.resource_type)?.label || res.resource_type;

            return (
              <Card
                key={res.id}
                className={`flex flex-col justify-between p-5 hover:border-border-strong transition-all duration-150 ${
                  !res.is_active ? "opacity-75 bg-surface-subtle/30" : ""
                }`}
              >
                <div className="space-y-3">
                  {/* Category and Type Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="stone" size="sm">
                      {typeLabel}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      {!res.is_active && (
                        <Badge variant="stone" size="sm" className="bg-stone-200/80 text-stone-600">
                          Archived
                        </Badge>
                      )}
                      <Badge variant="stone" size="sm" className="font-mono text-[10px]">
                        {res.provenance}
                      </Badge>
                    </div>
                  </div>

                  {/* Title & Provider */}
                  <div>
                    <h3
                      onClick={() => handleOpenDetail(res)}
                      className="font-semibold text-sm text-ink hover:text-accent-emerald cursor-pointer transition-colors line-clamp-2 leading-snug"
                    >
                      {res.title}
                    </h3>
                    {res.provider && (
                      <div className="flex items-center gap-1.5 text-xs text-ink-muted mt-1">
                        <Building className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{res.provider}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {res.description && (
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>
                  )}

                  {/* Tags */}
                  {res.tags && res.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {res.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200/60 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                      {res.tags.length > 3 && (
                        <span className="text-[10px] text-ink-muted">
                          +{res.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer and Quick Actions */}
                <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[11px] text-accent-emerald font-semibold font-mono">
                    <Target className="w-3.5 h-3.5" />
                    <span>{res.usage_count || 0} prescribed</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {res.url && (
                      res.url.startsWith("resources/") ? (
                        <>
                          <button
                            onClick={() => handleViewFile(res.id)}
                            className="p-1.5 rounded-lg hover:bg-surface-subtle text-ink-muted hover:text-accent-emerald transition-colors cursor-pointer"
                            title="View Document"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownloadFile(res.id, res.title)}
                            className="p-1.5 rounded-lg hover:bg-surface-subtle text-ink-muted hover:text-accent-emerald transition-colors cursor-pointer"
                            title="Download Document"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-surface-subtle text-ink-muted hover:text-accent-emerald transition-colors"
                          title="Open External Resource Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )
                    )}

                    <button
                      onClick={() => handleOpenLinkModal(res)}
                      className="px-2.5 py-1 text-[11px] font-medium text-accent-emerald bg-accent-emerald/10 hover:bg-accent-emerald/20 rounded-lg transition-colors cursor-pointer"
                      title="Prescribe resource to a cadet's active milestone"
                    >
                      Prescribe
                    </button>

                    <button
                      onClick={() => handleOpenDetail(res)}
                      className="p-1.5 rounded-lg hover:bg-surface-subtle text-ink-muted hover:text-ink transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteResource(res.id, res.title)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-ink-muted hover:text-rose-500 transition-colors cursor-pointer"
                      title="Delete Resource"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals & Drawers */}
      <ResourceFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        resourceToEdit={resourceToEdit}
        onSuccess={handleRefresh}
      />

      <UploadResourceModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      <ResourceDetailDrawer
        resource={detailResource}
        isOpen={Boolean(detailResource)}
        onClose={() => setDetailResource(null)}
        onEdit={handleOpenEdit}
        onOpenLinkModal={handleOpenLinkModal}
        onResourceUpdated={handleRefresh}
        studentsIndex={studentsIndex}
      />

      <LinkMilestoneDialog
        isOpen={Boolean(linkingResource)}
        onClose={() => setLinkingResource(null)}
        resource={linkingResource}
        studentsIndex={studentsIndex}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
