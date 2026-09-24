-- ==========================================================================
-- Professor Console: custom news-ticker announcements
-- Migration: 20260924_ticker_items.sql
-- Faculty-authored items that ride in the homepage news wire alongside the
-- live aviation headlines. Active items are readable by everyone (the public
-- homepage shows them); only faculty can create/edit/remove them.
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.ticker_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    href TEXT,                                    -- optional link
    priority INT NOT NULL DEFAULT 0,              -- higher shows earlier
    active BOOLEAN NOT NULL DEFAULT true,
    starts_at TIMESTAMPTZ,                        -- null = show immediately
    expires_at TIMESTAMPTZ,                       -- null = never expires
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticker_active ON public.ticker_items(active);

ALTER TABLE public.ticker_items ENABLE ROW LEVEL SECURITY;

-- Public (and authenticated) may read items that are active and within their
-- time window. Faculty get full read via the manage policy below.
DROP POLICY IF EXISTS "Anyone reads active ticker items" ON public.ticker_items;
CREATE POLICY "Anyone reads active ticker items" ON public.ticker_items
    FOR SELECT TO anon, authenticated
    USING (
        active = true
        AND (starts_at IS NULL OR starts_at <= now())
        AND (expires_at IS NULL OR expires_at > now())
    );

-- Faculty can create/read/update/delete everything.
DROP POLICY IF EXISTS "Faculty manage ticker items" ON public.ticker_items;
CREATE POLICY "Faculty manage ticker items" ON public.ticker_items
    FOR ALL TO authenticated
    USING (public.is_faculty())
    WITH CHECK (public.is_faculty());
