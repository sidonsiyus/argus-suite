-- 20260919_phase4_audit_immutability.sql
-- MENTOR OS Phase 4: Production Hardening & Database-Level Audit Immutability
--
-- Objective:
-- Guarantee that audit records in public.audit_logs can NEVER be updated or deleted,
-- even by faculty or administrative accounts, while preserving uninhibited append-only INSERT.

-- 1. Create immutability enforcement trigger function
CREATE OR REPLACE FUNCTION public.prevent_audit_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Security Violation: Audit records in public.audit_logs are strictly immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

-- 2. Attach trigger BEFORE UPDATE OR DELETE
DROP TRIGGER IF EXISTS trg_prevent_audit_log_mutation ON public.audit_logs;
CREATE TRIGGER trg_prevent_audit_log_mutation
BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW
EXECUTE FUNCTION public.prevent_audit_log_mutation();

-- 3. Refine Row Level Security (RLS) on public.audit_logs
-- Drop legacy 'FOR ALL' policy and replace with explicit SELECT and INSERT policies.
-- This ensures that RLS rejects UPDATE and DELETE at the policy evaluation layer as well.
DROP POLICY IF EXISTS "Faculty manage audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Faculty select audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Faculty insert audit logs" ON public.audit_logs;

CREATE POLICY "Faculty select audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_faculty());

CREATE POLICY "Faculty insert audit logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_faculty());
