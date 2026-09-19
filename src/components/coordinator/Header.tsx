'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Plus, Search, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onNewAppointment?: () => void;
  onSearch?: (term: string) => void;
}

export function Header({
  title = 'Dashboard',
  subtitle = 'Department of Aviation Administration',
  onNewAppointment,
  onSearch,
}: HeaderProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/appointments/login');
      router.refresh();
    } catch (err) {
      router.push('/appointments/login');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  return (
    <header className="h-16 border-b border-surface-border bg-white px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title / Breadcrumb */}
      <div>
        <h1 className="text-sm font-bold text-aviation-950 flex items-center gap-2">
          {title}
        </h1>
        <p className="text-[11px] text-gray-500 font-medium">{subtitle}</p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {onSearch && (
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface border border-surface-border rounded-lg focus:outline-hidden focus:border-aviation focus:ring-1 focus:ring-aviation"
            />
          </div>
        )}

        {onNewAppointment && (
          <button
            onClick={onNewAppointment}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-aviation hover:bg-aviation-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Appointment
          </button>
        )}

        {/* Notification Bell */}
        <NotificationBell />

        <div className="h-5 w-px bg-surface-border" />

        {/* Coordinator Profile & Logout */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-aviation-50 text-aviation-800 border border-aviation-200 flex items-center justify-center text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-aviation-700" />
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign out as Coordinator"
            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function NotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/coordinator/notifications');
      const data = await res.json();
      if (data) {
        setUnreadCount(data.unreadCount || 0);
        setNotifications(data.notifications || []);
      }
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/coordinator/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // Non-blocking
    }
  };

  const handleNotificationClick = async (notif: any) => {
    try {
      if (!notif.is_read) {
        await fetch('/api/coordinator/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: notif.id }),
        });
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      setIsOpen(false);
      router.push('/appointments/coordinator/requests');
    } catch {
      router.push('/appointments/coordinator/requests');
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="p-1.5 rounded-lg border border-surface-border text-gray-600 hover:text-aviation-950 hover:bg-surface relative transition-colors"
        title="Pending appointment notifications"
      >
        <Bell className="w-4 h-4 text-aviation-800" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-surface-border shadow-lg z-40 overflow-hidden text-xs">
            <div className="p-3 bg-surface border-b border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-aviation-700" />
                <span className="font-bold text-aviation-950">
                  Notifications ({unreadCount} unread)
                </span>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-semibold text-aviation-700 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-surface-border">
              {loading && notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-xs">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-xs">
                  No new notifications.
                </div>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3 hover:bg-surface/80 cursor-pointer transition-colors ${
                      !n.is_read ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-aviation-950">
                        {n.title}
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded">
                        PENDING
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 line-clamp-2">
                      {n.message}
                    </p>
                    <span className="text-[9px] text-gray-400 mt-1 block">
                      {new Date(n.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="p-2 bg-surface/50 border-t border-surface-border text-center">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push('/appointments/coordinator/requests');
                }}
                className="text-xs font-semibold text-aviation hover:underline"
              >
                View all pending requests →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
