import Link from 'next/link';
import { Plane, Calendar, ArrowRight, ShieldCheck, Clock, FileText, ClipboardCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between">
      {/* Top Institutional Header */}
      <header className="border-b border-surface-border bg-white px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-aviation flex items-center justify-center text-white shadow-sm">
              <Plane className="w-5 h-5 text-aviation-200" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-aviation-600">
                Department of Aviation
              </div>
              <h1 className="text-lg font-bold text-aviation-950 leading-tight">
                Faculty–Student Appointment Portal
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/appointments/login"
              className="text-xs font-medium text-aviation-700 hover:text-aviation-950 px-3 py-1.5 rounded border border-surface-border hover:bg-surface transition-colors"
            >
              Coordinator Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aviation-50 border border-aviation-100 text-aviation-800 text-xs font-medium self-center mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-aviation-600" />
          Aviation Department Official Scheduling System
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-aviation-950 tracking-tight mb-4">
          Outside-Class Hours Faculty Scheduling
        </h2>

        <p className="text-base text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Under Department of Aviation regulations, meetings with faculty outside regular
          scheduled class hours must be registered in advance. Select an active faculty member
          and reserve your designated time slot.
        </p>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full text-left">
          {/* 1. Student Appointment Card */}
          <Link
            href="/appointments/book"
            className="group block p-6 bg-white rounded-xl border-2 border-aviation-600 hover:border-aviation-900 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-aviation flex items-center justify-center text-white mb-4">
                <Calendar className="w-6 h-6 text-aviation-200" />
              </div>
              <h3 className="text-lg font-bold text-aviation-950 group-hover:text-aviation-700 flex items-center gap-2">
                Student Appointment
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Schedule academic guidance, project reviews, flight debriefs, or internship discussions. No student login required.
              </p>
            </div>
          </Link>

          {/* 2. Track Appointment Card */}
          <Link
            href="/appointments/appointment-status"
            className="group block p-6 bg-white rounded-xl border-2 border-aviation-600 hover:border-aviation-900 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-aviation flex items-center justify-center text-white mb-4">
                <ClipboardCheck className="w-6 h-6 text-aviation-200" />
              </div>
              <h3 className="text-lg font-bold text-aviation-950 group-hover:text-aviation-700 flex items-center gap-2">
                Track Appointment
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Check your appointment status using your tracking code.
              </p>
            </div>
          </Link>

          {/* 3. Coordinator Card */}
          <Link
            href="/appointments/login"
            className="group block p-6 bg-white rounded-xl border border-surface-border hover:border-aviation-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-lg bg-surface-muted flex items-center justify-center text-aviation-800 mb-4">
                <ShieldCheck className="w-6 h-6 text-aviation-700" />
              </div>
              <h3 className="text-lg font-bold text-aviation-950 group-hover:text-aviation-700 flex items-center gap-2">
                Coordinator
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-gray-400 group-hover:text-aviation-700" />
              </h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Administrative access to manage appointments, master calendar, student roster, faculty directory, and sessions.
              </p>
            </div>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-14 pt-10 border-t border-surface-border grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-aviation-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-aviation-950">Strict Slot Control</div>
              <div className="text-xs text-gray-500 mt-0.5">Real-time conflict prevention during authorized scheduling hours.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-aviation-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-aviation-950">Immediate Record Confirmation</div>
              <div className="text-xs text-gray-500 mt-0.5">Instant printable appointment ID and automated faculty calendar sync.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-aviation-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-aviation-950">Department of Aviation Only</div>
              <div className="text-xs text-gray-500 mt-0.5">Tailored exclusively for Aviation faculty, flight labs, and students.</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-white py-6 px-6 text-center text-xs text-gray-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Department of Aviation &bull; Faculty–Student Appointment Portal</span>
          <span>Outside Class Hours Authorization System</span>
        </div>
        <div className="appt-copyright mt-2">
          © {new Date().getFullYear()} · made by <strong>sid</strong>
        </div>
      </footer>
    </div>
  );
}
