"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  LayoutDashboard,
  Users,
  CalendarCheck,
  Calendar,
  BookOpen,
  Briefcase,
  Award,
  UsersRound,
  ShieldCheck,
  LogOut,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

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

  // Exactly the 8 operational modules specified in Section 5
  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/mentor-os/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Students",
      href: "/mentor-os/students",
      icon: Users,
    },
    {
      label: "Sessions",
      href: "/mentor-os/sessions",
      icon: CalendarCheck,
    },
    {
      label: "Calendar",
      href: "/mentor-os/calendar",
      icon: Calendar,
    },
    {
      label: "Resources",
      href: "/mentor-os/resources",
      icon: BookOpen,
    },
    {
      label: "Internships",
      href: "/mentor-os/internships",
      icon: Briefcase,
    },
    {
      label: "Achievements",
      href: "/mentor-os/achievements",
      icon: Award,
    },
    {
      label: "Groups",
      href: "/mentor-os/groups",
      icon: UsersRound,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full text-nav-text">
      {/* Brand Header */}
      <div>
        <div className="p-5 pb-4 border-b border-nav-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-nav-surface border border-nav-border flex items-center justify-center text-accent-emerald">
              <Compass className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-nav-text">
                  MENTOR OS
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700/50">
                  PROD
                </span>
              </div>
              <p className="text-[11px] text-emerald-400/80 font-mono tracking-wider">
                AERO SCIENCE
              </p>
            </div>
          </div>

          {/* Close button on mobile drawer */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-nav-muted hover:text-nav-text hover:bg-nav-surface lg:hidden transition-colors"
              aria-label="Close navigation sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isCurrent =
              item.href === "/mentor-os/dashboard"
                ? pathname === "/mentor-os/dashboard" || pathname === "/mentor-os"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50",
                  isCurrent
                    ? "bg-nav-surface text-nav-text border border-nav-border/90 font-semibold shadow-sm"
                    : "text-nav-muted hover:text-nav-text hover:bg-nav-hover/60"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      "w-4 h-4 shrink-0",
                      isCurrent ? "text-emerald-400" : "text-nav-muted"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Current Cohort & Faculty Profile */}
      <div className="p-4 border-t border-nav-border bg-nav-surface/40">
        <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-300 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>BATCH 2025–2028 (AERO)</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-nav-border/50">
          <div>
            <p className="text-xs font-medium text-nav-text">Siddarth J</p>
            <p className="text-[11px] text-emerald-400/80">Faculty Mentor</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Online" />
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign Out from Mentor OS"
              className="p-1.5 rounded-lg text-nav-muted hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition-colors cursor-pointer"
              title="Sign Out from Mentor OS"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col bg-nav border-r border-nav-border min-h-screen sticky top-0 h-screen overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <aside className="relative w-72 max-w-[85vw] bg-nav border-r border-nav-border h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
