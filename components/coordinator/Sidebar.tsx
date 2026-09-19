'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  GraduationCap,
  Users,
  BookOpen,
  Settings,
  Plane,
  ExternalLink,
  Inbox,
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/appointments/coordinator', icon: LayoutDashboard, exact: true },
  { name: 'Calendar', href: '/appointments/coordinator/calendar', icon: Calendar },
  { name: 'Appointments', href: '/appointments/coordinator/appointments', icon: Clock },
  { name: 'Pending Requests', href: '/appointments/coordinator/requests', icon: Inbox },
  { name: 'Students', href: '/appointments/coordinator/students', icon: GraduationCap },
  { name: 'Faculty', href: '/appointments/coordinator/faculty', icon: Users },
  { name: 'Sessions', href: '/appointments/coordinator/sessions', icon: BookOpen },
  { name: 'Settings', href: '/appointments/coordinator/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await fetch('/api/coordinator/notifications');
        const data = await res.json();
        if (data && typeof data.unreadCount === 'number') {
          setPendingCount(data.unreadCount);
        }
      } catch {
        // Non-blocking
      }
    };
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (item: (typeof navigationItems)[0]) => {
    if (item.exact) {
      return pathname === '/appointments/coordinator' || pathname === '/appointments/coordinator/dashboard';
    }
    return pathname.startsWith(item.href);
  };

  return (
    <aside className="w-64 bg-white border-r border-surface-border flex flex-col justify-between shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-aviation flex items-center justify-center text-white shrink-0 shadow-sm">
              <Plane className="w-5 h-5 text-aviation-200" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-aviation-600 truncate">
                Department of Aviation
              </div>
              <div className="text-xs font-semibold text-aviation-950 truncate">
                Appointment Portal
              </div>
            </div>
          </div>
          <div className="mt-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-aviation-50 text-aviation-800 border border-aviation-100">
            Coordinator Administration
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          {navigationItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-aviation text-white shadow-sm font-semibold'
                    : 'text-gray-600 hover:text-aviation-950 hover:bg-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      active ? 'text-aviation-200' : 'text-gray-400 group-hover:text-aviation-700'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.name === 'Pending Requests' && pendingCount > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      active
                        ? 'bg-white text-aviation-900'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Quick Link to Public Booking */}
      <div className="p-4 border-t border-surface-border space-y-2 bg-surface/50">
        <Link
          href="/appointments/book"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-surface-border rounded-lg hover:border-aviation-300 hover:text-aviation-950 transition-colors shadow-2xs"
        >
          <span className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-aviation-600" />
            Student Booking Page
          </span>
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </Link>
        <div className="text-[10px] text-gray-600 px-1">
          Aviation Department Scheduler v1.0
        </div>
      </div>
    </aside>
  );
}
