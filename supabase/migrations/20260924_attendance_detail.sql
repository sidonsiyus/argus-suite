-- ==========================================================================
-- Professor Console: attendance absentee detail
-- Migration: 20260924_attendance_detail.sql
-- Adds the legacy absentee model to attendance_records: a fine category, a
-- reason (for AUTH / OD), and whether the parent was contacted (for AUTH).
-- Coarse `status` (present/absent/od) is kept for counting & analytics.
-- Safe to run after 20260924_attendance.sql.
-- ==========================================================================

ALTER TABLE public.attendance_records
    ADD COLUMN IF NOT EXISTS absence_type TEXT,        -- auth | unauth | groom | susp (null when present/od)
    ADD COLUMN IF NOT EXISTS reason TEXT,              -- from the reason list (AUTH / OD)
    ADD COLUMN IF NOT EXISTS parent_contacted BOOLEAN; -- AUTH only
