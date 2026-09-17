"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Bell, UserCircle, LogOut, Menu, ChevronRight, Sun, Moon, Laptop } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";

interface StudentSearchResult {
  id: string;
  full_name: string;
  reg_no: string;
  career_goal?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface TopBarProps {
  title: string;
  subtitle?: string;
  studentsIndex?: StudentSearchResult[];
  attentionCount?: number;
  breadcrumbs?: BreadcrumbItem[];
  onMenuClick?: () => void;
}

export function TopBar({
  title,
  subtitle,
  studentsIndex = [],
  attentionCount = 0,
  breadcrumbs,
  onMenuClick,
}: TopBarProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StudentSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // Filter STRICTLY by name and register number (data minimization rule)
    const matches = studentsIndex
      .filter(
        (s) =>
          s.full_name.toLowerCase().includes(q) ||
          s.reg_no.toLowerCase().includes(q)
      )
      .slice(0, 6);

    setResults(matches);
    setIsOpen(true);
  }, [query, studentsIndex]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (studentId: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/mentor-os/students/${studentId}`);
  };

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/mentor-os/login");
      router.refresh();
    } catch {
      router.push("/mentor-os/login");
    }
  };

  return (
    <header className="h-16 border-b border-border bg-surface px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Mobile Hamburger + Breadcrumbs / Title */}
      <div className="flex items-center gap-3 min-w-0">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-hover lg:hidden transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav className="flex items-center gap-1.5 text-xs text-ink-muted mb-0.5 truncate" aria-label="Breadcrumb">
              {breadcrumbs.map((b, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />}
                  {b.href ? (
                    <Link
                      href={b.href}
                      className="hover:text-emerald-800 transition-colors truncate"
                    >
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-ink font-medium truncate">{b.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          ) : null}

          <h1 className="text-base font-semibold tracking-tight text-ink truncate">
            {title}
          </h1>
          {subtitle && !breadcrumbs && (
            <p className="text-xs text-ink-muted leading-none mt-0.5 hidden sm:block truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Actions: Search + Attention Indicator + Profile + Sign Out */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Global Student Search (Strictly full_name & reg_no) */}
        <div ref={dropdownRef} className="relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (query.trim() && results.length > 0) setIsOpen(true);
              }}
              placeholder="Search cadets..."
              aria-label="Search cadets by name or registration number"
              className="w-36 sm:w-56 md:w-64 pl-9 pr-3 py-1.5 text-xs bg-workspace border border-border rounded-lg text-ink placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 transition-all"
            />
          </div>

          {/* Search Dropdown */}
          {isOpen && results.length > 0 && (
            <div className="absolute right-0 top-10 w-72 sm:w-80 bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-2 border-b border-border/80 bg-stone-50/60 text-[10px] uppercase font-semibold text-stone-400 tracking-wider">
                Cadets Matching "{query}"
              </div>
              <div className="divide-y divide-border/60 max-h-64 overflow-y-auto">
                {results.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSelect(st.id)}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-emerald-50/60 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="truncate mr-2">
                      <p className="text-xs font-semibold text-ink group-hover:text-emerald-900 transition-colors truncate">
                        {st.full_name}
                      </p>
                      {st.career_goal && (
                        <p className="text-[11px] text-ink-muted truncate">
                          {st.career_goal}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-surface-subtle border border-border text-ink-secondary shrink-0">
                      {st.reg_no}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isOpen && query.trim() && results.length === 0 && (
            <div className="absolute right-0 top-10 w-72 bg-surface border border-border rounded-xl shadow-lg p-4 text-center text-xs text-ink-muted z-50">
              No cadet found matching "{query}"
            </div>
          )}
        </div>

        {/* Theme Toggle (Light / Dark / System) */}
        <button
          type="button"
          onClick={() => {
            if (theme === "light") setTheme("dark");
            else if (theme === "dark") setTheme("system");
            else setTheme("light");
          }}
          className="p-2 rounded-lg text-ink-secondary hover:bg-surface-hover border border-border/60 transition-colors cursor-pointer"
          aria-label={`Current theme: ${theme}. Click to switch theme.`}
          title={`Theme: ${theme} (Click to switch)`}
        >
          {theme === "dark" ? (
            <Moon className="w-4 h-4 text-emerald-400" />
          ) : theme === "light" ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Laptop className="w-4 h-4 text-ink-muted" />
          )}
        </button>

        {/* Attention Indicator */}
        <button
          type="button"
          onClick={() => router.push("/dashboard#attention")}
          className="p-2 rounded-lg text-ink-secondary hover:bg-surface-hover border border-border/60 relative transition-colors"
          aria-label={`${attentionCount} cadets needing mentor attention`}
          title={`${attentionCount} cadets needing attention`}
        >
          <Bell className="w-4 h-4" />
          {attentionCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        {/* Faculty Profile Badge */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-border">
          <UserCircle className="w-6 h-6 text-emerald-900 dark:text-emerald-400 shrink-0" />
          <div className="hidden md:block">
            <p className="text-xs font-medium text-ink leading-tight">
              Siddarth J
            </p>
            <p className="text-[10px] font-mono text-ink-muted">
              FACULTY
            </p>
          </div>
        </div>

        {/* Sign Out Action */}
        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Sign Out from Mentor OS"
          className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-ink-secondary hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-border/60 transition-colors cursor-pointer"
          title="Sign Out from Mentor OS"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="text-xs font-medium hidden md:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
