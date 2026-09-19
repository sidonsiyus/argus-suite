'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Info,
  Filter,
} from 'lucide-react';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SAMPLE_CSV = `register_number,name,programme,year,section,email,phone
23BAS010,Kiran Varma,B.Sc Aeronautical Science,II,A,kiran.v@aviation.edu,+91 98401 11223
23BAS011,Deepa Nair,B.Sc Aeronautical Science,II,B,deepa.n@aviation.edu,+91 98402 22334
22BAM030,Abhishek Singh,B.Sc Aviation Management,III,A,abhishek.s@aviation.edu,+91 98403 33445`;

export function CSVImportModal({ isOpen, onClose, onSuccess }: CSVImportModalProps) {
  // Wizard steps: 'upload' -> 'preview' -> 'result'
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  // Preview data
  const [previewSummary, setPreviewSummary] = useState<any | null>(null);
  const [previewItems, setPreviewItems] = useState<any[]>([]);
  const [previewFilter, setPreviewFilter] = useState<'ALL' | 'NEW' | 'UPDATE' | 'NO_CHANGE' | 'DUPLICATE' | 'INVALID'>('ALL');

  // Final result
  const [resultSummary, setResultSummary] = useState<any | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
    };
    reader.readAsText(file);
  };

  const handleCopySample = () => {
    navigator.clipboard.writeText(SAMPLE_CSV);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  // Phase 1: Preview (ZERO database writes)
  const handlePreview = async () => {
    if (!csvText.trim()) {
      setErrorMessage('Please choose a CSV file or paste CSV content.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const res = await fetch('/api/coordinator/students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText, action: 'preview' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to preview CSV file.');
        setLoading(false);
        return;
      }

      setPreviewSummary(data.summary);
      setPreviewItems(data.items || []);
      setStep('preview');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while previewing CSV.');
    } finally {
      setLoading(false);
    }
  };

  // Phase 2: Confirmed Import
  const handleConfirmImport = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const res = await fetch('/api/coordinator/students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText, action: 'import' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'CSV import failed.');
        setLoading(false);
        return;
      }

      setResultSummary(data.summary);
      setStep('result');
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred during final import.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setCsvText('');
    setFileName(null);
    setPreviewSummary(null);
    setPreviewItems([]);
    setResultSummary(null);
    setErrorMessage(null);
  };

  // Filter preview items
  const filteredPreviewItems = previewItems.filter((item) => {
    if (previewFilter === 'ALL') return true;
    return item.classification === previewFilter;
  });

  const validActionableCount =
    (previewSummary?.newCount || 0) + (previewSummary?.existingUpdateCount || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Department of Aviation — Student Roster Import"
      subtitle="Safely validate, preview changes, and onboard student records into Supabase"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4 text-xs">
        {/* Step Indicator */}
        <div className="flex items-center justify-between px-3 py-2 bg-surface rounded-lg border border-surface-border text-[11px] font-semibold text-aviation-900">
          <div className={`flex items-center gap-1.5 ${step === 'upload' ? 'text-aviation-950 font-bold' : 'text-gray-400'}`}>
            <span className="w-5 h-5 rounded-full bg-aviation text-white flex items-center justify-center text-[10px]">1</span>
            Upload &amp; Parse
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <div className={`flex items-center gap-1.5 ${step === 'preview' ? 'text-aviation-950 font-bold' : 'text-gray-400'}`}>
            <span className="w-5 h-5 rounded-full bg-aviation text-white flex items-center justify-center text-[10px]">2</span>
            Database Match &amp; Preview
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <div className={`flex items-center gap-1.5 ${step === 'result' ? 'text-aviation-950 font-bold' : 'text-gray-400'}`}>
            <span className="w-5 h-5 rounded-full bg-aviation text-white flex items-center justify-center text-[10px]">3</span>
            Confirmation &amp; Summary
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 1: UPLOAD */}
        {/* ================================================================= */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div className="p-3 bg-surface rounded-xl border border-surface-border flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-aviation-950">
                  Required Format &bull; Department of Aviation Roster
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Required: <code>register_number, name, programme, year, section</code> | Optional: <code>email, phone</code>
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopySample}
                className="flex items-center gap-1 text-[11px] font-semibold text-aviation-800 hover:text-aviation-950 px-2.5 py-1 rounded bg-white border border-surface-border transition-colors"
              >
                {copiedTemplate ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy Sample
                  </>
                )}
              </button>
            </div>

            {/* File Upload Box */}
            <div className="border-2 border-dashed border-surface-border hover:border-aviation-300 rounded-xl p-6 text-center bg-white transition-colors">
              <input
                type="file"
                id="csvFileInput"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="csvFileInput"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-aviation-50 text-aviation-700 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-aviation-950 text-xs">
                    {fileName ? fileName : 'Choose official CSV file or drag and drop'}
                  </span>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Standard comma-separated format (.csv) &bull; Maximum 2MB / 5,000 rows
                  </p>
                </div>
              </label>
            </div>

            {/* Raw Text Box */}
            <div>
              <label className="block font-semibold text-aviation-950 mb-1 text-xs">
                Or Paste CSV Data Directly:
              </label>
              <textarea
                rows={4}
                placeholder="register_number,name,programme,year,section,email,phone..."
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full font-mono text-[11px] px-3 py-2 bg-surface border border-surface-border rounded-lg focus:outline-hidden focus:border-aviation"
              />
            </div>

            <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-surface hover:bg-aviation-50 text-aviation-950 rounded-lg text-xs font-semibold border border-surface-border transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading || !csvText.trim()}
                onClick={handlePreview}
                className="px-5 py-2 bg-aviation hover:bg-aviation-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Parsing &amp; Validating...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-3.5 h-3.5" />
                    Preview &amp; Validate Roster
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 2: PREVIEW & VALIDATION */}
        {/* ================================================================= */}
        {step === 'preview' && previewSummary && (
          <div className="space-y-4">
            {/* Metric Summary Cards */}
            <div className="grid grid-cols-6 gap-2 text-center">
              <div className="p-2 bg-surface rounded-lg border border-surface-border">
                <span className="text-[10px] text-gray-500 font-bold block">TOTAL ROWS</span>
                <span className="text-base font-extrabold text-aviation-950">
                  {previewSummary.totalRows}
                </span>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                <span className="text-[10px] text-emerald-700 font-bold block">NEW STUDENTS</span>
                <span className="text-base font-extrabold text-emerald-950">
                  {previewSummary.newCount}
                </span>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-[10px] text-blue-700 font-bold block">UPDATES</span>
                <span className="text-base font-extrabold text-blue-950">
                  {previewSummary.existingUpdateCount}
                </span>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-[10px] text-gray-600 font-bold block">NO CHANGE</span>
                <span className="text-base font-extrabold text-gray-800">
                  {previewSummary.existingNoChangeCount}
                </span>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                <span className="text-[10px] text-amber-700 font-bold block">DUPLICATES</span>
                <span className="text-base font-extrabold text-amber-950">
                  {previewSummary.duplicateCount}
                </span>
              </div>
              <div className="p-2 bg-rose-50 rounded-lg border border-rose-100">
                <span className="text-[10px] text-rose-700 font-bold block">INVALID</span>
                <span className="text-base font-extrabold text-rose-950">
                  {previewSummary.invalidCount}
                </span>
              </div>
            </div>

            {/* In-CSV Duplicate Warning Alert */}
            {previewSummary.duplicateCount > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <span className="font-bold">Warning: Duplicate Register Numbers detected in CSV.</span>{' '}
                  Duplicate rows cannot be imported simultaneously. They are highlighted below and will be skipped unless resolved.
                </div>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-gray-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Filter:
                </span>
                {(
                  [
                    { id: 'ALL', label: `All (${previewItems.length})` },
                    { id: 'NEW', label: `New (${previewSummary.newCount})` },
                    { id: 'UPDATE', label: `Updates (${previewSummary.existingUpdateCount})` },
                    { id: 'NO_CHANGE', label: `No Change (${previewSummary.existingNoChangeCount})` },
                    { id: 'DUPLICATE', label: `Duplicates (${previewSummary.duplicateCount})` },
                    { id: 'INVALID', label: `Invalid (${previewSummary.invalidCount})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPreviewFilter(tab.id)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                      previewFilter === tab.id
                        ? 'bg-aviation text-white'
                        : 'bg-surface text-gray-600 hover:bg-gray-200 border border-surface-border'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <span className="text-[10px] text-gray-400">
                Showing {filteredPreviewItems.length} of {previewItems.length} records
              </span>
            </div>

            {/* Preview Table */}
            <div className="overflow-x-auto max-h-72 rounded-lg border border-surface-border bg-white">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="sticky top-0 bg-surface border-b border-surface-border font-bold text-aviation-950 z-10">
                  <tr>
                    <th className="px-3 py-2 w-12">Row</th>
                    <th className="px-3 py-2">Reg Number</th>
                    <th className="px-3 py-2">Student Name</th>
                    <th className="px-3 py-2">Programme</th>
                    <th className="px-3 py-2">Year/Sec</th>
                    <th className="px-3 py-2">Status Classification</th>
                    <th className="px-3 py-2">Changes / Issue Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {filteredPreviewItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface/30">
                      <td className="px-3 py-2 text-gray-400 font-mono text-[10px]">{item.row}</td>
                      <td className="px-3 py-2 font-mono font-bold text-aviation-950">
                        {item.register_number}
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-800">{item.name}</td>
                      <td className="px-3 py-2 text-gray-500 truncate max-w-[140px]">{item.programme}</td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                        Yr {item.year} &bull; {item.section}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {item.classification === 'NEW' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            New Student
                          </span>
                        )}
                        {item.classification === 'UPDATE' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Update Required
                          </span>
                        )}
                        {item.classification === 'NO_CHANGE' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                            No Change
                          </span>
                        )}
                        {item.classification === 'DUPLICATE' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Duplicate in CSV
                          </span>
                        )}
                        {item.classification === 'INVALID' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Invalid
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-[10px]">
                        {item.classification === 'UPDATE' && item.changes && (
                          <div className="space-y-0.5">
                            {item.changes.map((c: any, cIdx: number) => (
                              <div key={cIdx} className="text-blue-800">
                                <span className="font-semibold uppercase">{c.field}:</span>{' '}
                                <span className="line-through text-gray-400">{c.existingValue}</span> &rarr;{' '}
                                <span className="font-bold text-blue-900">{c.incomingValue}</span>
                              </div>
                            ))}
                            {item.existingSource && (
                              <div className="text-gray-400 text-[9px]">
                                Source: {item.existingSource} (Protected)
                              </div>
                            )}
                          </div>
                        )}
                        {item.classification === 'NO_CHANGE' && (
                          <span className="text-gray-400 italic">Identical to existing record</span>
                        )}
                        {item.classification === 'NEW' && (
                          <span className="text-emerald-700 font-medium">Ready for creation</span>
                        )}
                        {(item.classification === 'INVALID' || item.classification === 'DUPLICATE') && (
                          <span className="text-rose-600 font-medium">{item.error}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-surface-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="px-3 py-1.5 bg-surface hover:bg-aviation-50 text-aviation-950 rounded-lg text-xs font-semibold border border-surface-border transition-colors flex items-center gap-1"
              >
                &larr; Back to Upload
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-white hover:bg-surface text-gray-700 rounded-lg text-xs font-medium border border-surface-border"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading || validActionableCount === 0}
                  onClick={handleConfirmImport}
                  className="px-5 py-2 bg-aviation hover:bg-aviation-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Importing Records...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confirm &amp; Import ({validActionableCount} Records)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 3: RESULT SUMMARY */}
        {/* ================================================================= */}
        {step === 'result' && resultSummary && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-3">
              <div className="flex items-center gap-2 font-bold text-aviation-950 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Student Roster Processing Complete
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 font-bold block">IMPORTED</span>
                  <span className="text-base font-extrabold text-emerald-950">
                    {resultSummary.imported}
                  </span>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-[10px] text-blue-700 font-bold block">UPDATED</span>
                  <span className="text-base font-extrabold text-blue-950">
                    {resultSummary.updated}
                  </span>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-[10px] text-gray-600 font-bold block">NO CHANGE</span>
                  <span className="text-base font-extrabold text-gray-800">
                    {resultSummary.noChange}
                  </span>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                  <span className="text-[10px] text-amber-700 font-bold block">SKIPPED / ERRORS</span>
                  <span className="text-base font-extrabold text-amber-950">
                    {resultSummary.skipped}
                  </span>
                </div>
              </div>

              {/* Error Details if any were skipped */}
              {resultSummary.errors && resultSummary.errors.length > 0 && (
                <div className="mt-3">
                  <span className="font-semibold text-rose-950 block mb-1 text-[11px]">
                    Row-by-Row Skipped / Issue Details:
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1 bg-white p-2 rounded-lg border border-rose-200">
                    {resultSummary.errors.map((err: any, idx: number) => (
                      <div key={idx} className="text-[11px] text-rose-800 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>
                          Row {err.row}{' '}
                          {err.register_number ? `(${err.register_number})` : ''}: {err.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 bg-white border border-surface-border text-aviation-950 rounded-lg font-semibold hover:bg-surface text-xs"
                >
                  Import Another File
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 bg-aviation text-white rounded-lg font-semibold hover:bg-aviation-800 text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
