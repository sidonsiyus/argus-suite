"use client";

import { useEffect, useState } from "react";
import { X, Link2, Plus, Upload, Loader2, Search } from "lucide-react";
import { StageMaterial } from "@/lib/data/roadmaps";
import { attachStageResourceAction } from "@/app/actions/roadmaps";
import { getResourcesAction, createResourceAction, uploadResourceDocumentAction } from "@/app/actions/resources";
import { cn } from "@/lib/utils";

type Tab = "existing" | "link" | "upload";

export function AttachMaterialModal({
  trackSlug,
  stageKey,
  stageTitle,
  onClose,
  onAttached,
}: {
  trackSlug: string;
  stageKey: string;
  stageTitle: string;
  onClose: () => void;
  onAttached: (m: StageMaterial) => void;
}) {
  const [tab, setTab] = useState<Tab>("existing");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Link-existing
  const [resources, setResources] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loadingRes, setLoadingRes] = useState(false);

  // Add link
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  // Upload
  const [file, setFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");

  useEffect(() => {
    if (tab !== "existing" || resources.length > 0) return;
    setLoadingRes(true);
    getResourcesAction()
      .then((r: any) => setResources(Array.isArray(r) ? r : r?.data || []))
      .catch(() => setResources([]))
      .finally(() => setLoadingRes(false));
  }, [tab, resources.length]);

  async function attach(resourceId: string, m: Omit<StageMaterial, "linkId" | "resourceId">) {
    const res = await attachStageResourceAction({ trackSlug, stageKey, resourceId });
    if (res.success) {
      onAttached({ linkId: res.linkId || resourceId, resourceId, ...m });
      return true;
    }
    setError(res.error || "Couldn't attach. Is the roadmap_stage_resources table migrated?");
    return false;
  }

  async function pickExisting(r: any) {
    setBusy(true);
    setError(null);
    await attach(r.id, { title: r.title, url: r.url ?? null, resourceType: r.resource_type || "GUIDE" });
    setBusy(false);
  }

  async function addLink() {
    if (!title.trim() || !url.trim()) return;
    setBusy(true);
    setError(null);
    const created = await createResourceAction({ title: title.trim(), url: url.trim(), resource_type: "GUIDE", category: "Roadmap", is_public: true });
    if (!created.success || !("resourceId" in created) || !created.resourceId) {
      setBusy(false);
      setError(created.error || "Couldn't create the link.");
      return;
    }
    await attach(created.resourceId, { title: title.trim(), url: url.trim(), resourceType: "GUIDE" });
    setBusy(false);
  }

  async function upload() {
    if (!file || !uploadTitle.trim()) return;
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("title", uploadTitle.trim());
    fd.set("category", "Roadmap");
    const up = await uploadResourceDocumentAction(fd);
    if (!up.success || !("resourceId" in up) || !up.resourceId) {
      setBusy(false);
      setError(up.error || "Upload failed.");
      return;
    }
    await attach(up.resourceId, { title: uploadTitle.trim(), url: null, resourceType: "DOCUMENT" });
    setBusy(false);
  }

  const ql = q.trim().toLowerCase();
  const filtered = ql ? resources.filter((r) => (r.title || "").toLowerCase().includes(ql)) : resources;

  const TabBtn = ({ id, icon: Icon, label }: { id: Tab; icon: any; label: string }) => (
    <button
      onClick={() => setTab(id)}
      className={cn("flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors", tab === id ? "bg-emerald-900 text-white" : "text-ink-secondary hover:bg-surface-subtle")}
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-md max-h-[85vh] flex flex-col bg-surface border border-border-strong rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-ink">Attach material</h3>
            <p className="text-xs text-ink-muted">to “{stageTitle}”</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-subtle" aria-label="Close"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-5 pt-3">
          <div className="flex gap-1 p-1 bg-surface-subtle rounded-xl">
            <TabBtn id="existing" icon={Link2} label="Library" />
            <TabBtn id="link" icon={Plus} label="Add link" />
            <TabBtn id="upload" icon={Upload} label="Upload" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === "existing" && (
            <>
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search resources…" className="w-full text-sm bg-surface-subtle border border-border rounded-lg pl-8 pr-3 py-2 text-ink focus:outline-none focus:border-accent-emerald" />
              </div>
              {loadingRes ? (
                <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-ink-muted" /></div>
              ) : filtered.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-muted">No resources found.</p>
              ) : (
                <div className="space-y-1">
                  {filtered.slice(0, 40).map((r) => (
                    <button key={r.id} onClick={() => pickExisting(r)} disabled={busy} className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-surface-subtle text-left disabled:opacity-50">
                      <span className="text-sm text-ink truncate">{r.title}</span>
                      <span className="text-[10px] text-ink-muted shrink-0">{(r.resource_type || "").toLowerCase()}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "link" && (
            <div className="space-y-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full text-sm bg-surface-subtle border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-accent-emerald" />
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="w-full text-sm bg-surface-subtle border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-accent-emerald" />
              <button onClick={addLink} disabled={busy || !title.trim() || !url.trim()} className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg bg-accent-emerald text-white disabled:opacity-50">
                {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Add & attach
              </button>
            </div>
          )}

          {tab === "upload" && (
            <div className="space-y-3">
              <input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Title" className="w-full text-sm bg-surface-subtle border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-accent-emerald" />
              <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-xs text-ink-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-surface-subtle file:text-ink" />
              <p className="text-[10px] text-ink-muted">PDF / DOC / DOCX, up to 10 MB.</p>
              <button onClick={upload} disabled={busy || !file || !uploadTitle.trim()} className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg bg-accent-emerald text-white disabled:opacity-50">
                {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Upload & attach
              </button>
            </div>
          )}

          {error && <p className="mt-3 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
