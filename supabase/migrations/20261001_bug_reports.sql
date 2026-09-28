-- Bug reports / tickets. Anyone on the site can submit (even logged-out);
-- only faculty can read and resolve them (RLS via public.is_faculty()).

CREATE TABLE IF NOT EXISTS public.bug_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  message     TEXT NOT NULL,
  page        TEXT,
  email       TEXT,
  user_agent  TEXT,
  status      TEXT NOT NULL DEFAULT 'open',   -- open | resolved
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_bug_reports_created ON public.bug_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON public.bug_reports(status);

ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Anyone (anonymous or signed-in) may file a report.
DROP POLICY IF EXISTS bug_reports_insert ON public.bug_reports;
CREATE POLICY bug_reports_insert ON public.bug_reports
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Only faculty can read them.
DROP POLICY IF EXISTS bug_reports_select ON public.bug_reports;
CREATE POLICY bug_reports_select ON public.bug_reports
  FOR SELECT USING (public.is_faculty());

-- Only faculty can update (resolve / reopen).
DROP POLICY IF EXISTS bug_reports_update ON public.bug_reports;
CREATE POLICY bug_reports_update ON public.bug_reports
  FOR UPDATE USING (public.is_faculty()) WITH CHECK (public.is_faculty());

-- Only faculty can delete.
DROP POLICY IF EXISTS bug_reports_delete ON public.bug_reports;
CREATE POLICY bug_reports_delete ON public.bug_reports
  FOR DELETE USING (public.is_faculty());
