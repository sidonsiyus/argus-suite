'use client';

import type { Metadata } from 'next';
import './appointments.css';
import { useEffect, useState } from 'react';

// Theme toggle icon components
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export default function AppointmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Read saved preference on mount
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('appt-theme');
      if (saved === 'dark') setDark(true);
      else if (saved === 'light') setDark(false);
      else {
        // Default to system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDark(prefersDark);
      }
    } catch {}
  }, []);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      try { localStorage.setItem('appt-theme', next ? 'dark' : 'light'); } catch {}
      return next;
    });
  };

  return (
    <div className={`appointments-root${dark ? ' dark' : ''}`} style={{ position: 'relative' }}>
      {/* Floating dark mode toggle — always visible */}
      {mounted && (
        <button
          className="appt-theme-toggle"
          onClick={toggle}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={dark ? 'Light mode' : 'Dark mode'}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
          }}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      )}
      {children}
    </div>
  );
}
