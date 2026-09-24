-- ==========================================================================
-- Professor Console: daily to-do checklist
-- Migration: 20260925_tasks.sql
-- One row per task per day. The 4 fixed daily tasks are generated in the UI and
-- only persist their done-state (kind='fixed', fixed_key set); manual tasks are
-- full rows (kind='manual'). Faculty-only via is_faculty().
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day DATE NOT NULL,
    kind TEXT NOT NULL DEFAULT 'manual',   -- 'fixed' | 'manual'
    fixed_key TEXT,                         -- set for the fixed daily tasks
    title TEXT NOT NULL,
    link TEXT,
    deadline TEXT,                          -- display string, e.g. '3:00 PM'
    done BOOLEAN NOT NULL DEFAULT false,
    sort INT NOT NULL DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (day, fixed_key)                 -- manual rows have NULL fixed_key (not unique)
);

CREATE INDEX IF NOT EXISTS idx_tasks_day ON public.tasks(day);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty manage tasks" ON public.tasks;
CREATE POLICY "Faculty manage tasks" ON public.tasks
    FOR ALL TO authenticated
    USING (public.is_faculty()) WITH CHECK (public.is_faculty());
