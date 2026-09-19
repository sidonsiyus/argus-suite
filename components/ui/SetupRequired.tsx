'use client';

import React, { useState } from 'react';
import { Plane, AlertTriangle, Database, Key, CheckCircle, Copy, Terminal } from 'lucide-react';

export function SetupRequired({ title = 'Supabase Database Connection Required' }: { title?: string }) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const envSample = `# Department of Aviation — Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key`;

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl border border-surface-border shadow-sm p-8">
        {/* Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-surface-border">
          <div className="w-12 h-12 rounded-xl bg-aviation flex items-center justify-center text-white shadow-sm shrink-0">
            <Plane className="w-6 h-6 text-aviation-200" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-aviation-600">
              Department of Aviation
            </div>
            <h1 className="text-xl font-bold text-aviation-950">{title}</h1>
          </div>
        </div>

        {/* Notice Alert */}
        <div className="my-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <p className="font-semibold text-amber-950 mb-1">
              Persistent Database Not Yet Connected
            </p>
            Per the system architecture, the Department of Aviation Portal relies strictly on
            Supabase PostgreSQL as its persistent database. To activate the portal, configure your Supabase project credentials.
          </div>
        </div>

        {/* Setup Steps */}
        <div className="space-y-6 text-sm">
          {/* Step 1 */}
          <div className="border border-surface-border rounded-xl p-5 bg-surface">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-semibold text-aviation-950">
                <span className="w-6 h-6 rounded-full bg-aviation-100 text-aviation-800 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Add Supabase Credentials to `.env.local`
              </div>
              <button
                onClick={() => copyToClipboard(envSample, 'env')}
                className="text-xs text-aviation-700 hover:text-aviation-950 flex items-center gap-1 font-medium px-2 py-1 rounded hover:bg-aviation-50"
              >
                {copiedSection === 'env' ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </>
                )}
              </button>
            </div>
            <pre className="text-xs bg-aviation-950 text-aviation-100 p-3 rounded-lg overflow-x-auto font-mono">
              {envSample}
            </pre>
          </div>

          {/* Step 2 */}
          <div className="border border-surface-border rounded-xl p-5 bg-surface">
            <div className="flex items-center gap-2 font-semibold text-aviation-950 mb-2">
              <span className="w-6 h-6 rounded-full bg-aviation-100 text-aviation-800 text-xs flex items-center justify-center font-bold">
                2
              </span>
              Run the Database Migration in Supabase SQL Editor
            </div>
            <p className="text-xs text-gray-600 mb-2">
              Copy and execute the pre-built SQL migration script located in the codebase:
            </p>
            <div className="text-xs font-mono bg-white p-2.5 rounded border border-surface-border text-aviation-800 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-aviation-600" />
              supabase/migrations/20260918000000_initial_schema.sql
            </div>
          </div>

          {/* Step 3 */}
          <div className="border border-surface-border rounded-xl p-5 bg-surface">
            <div className="flex items-center gap-2 font-semibold text-aviation-950 mb-2">
              <span className="w-6 h-6 rounded-full bg-aviation-100 text-aviation-800 text-xs flex items-center justify-center font-bold">
                3
              </span>
              Create Coordinator Account in Supabase Auth
            </div>
            <p className="text-xs text-gray-600">
              Navigate to <strong>Supabase Dashboard &rarr; Authentication &rarr; Users &rarr; Add User</strong>.
              Provide the Coordinator’s email and password. Then log in at <code>/login</code>.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-surface-border flex justify-end">
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-lg bg-aviation hover:bg-aviation-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Check Connection &amp; Reload
          </button>
        </div>
      </div>
    </div>
  );
}
