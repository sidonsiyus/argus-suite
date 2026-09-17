-- Skill development tracking: link a skill assessment to the session it came from.
-- Nullable + ON DELETE SET NULL so historical assessments and cascade deletes are safe.

ALTER TABLE public.skill_assessments
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_skill_assessments_session
  ON public.skill_assessments(session_id);
