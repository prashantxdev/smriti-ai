-- Add 'declined' to caregiver_status enum if not present
ALTER TYPE public.caregiver_status ADD VALUE IF NOT EXISTS 'declined';

-- ===== activity_logs =====
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS activity_logs_patient_idx ON public.activity_logs (patient_id, created_at DESC);

-- RLS Policies
CREATE POLICY "patients view own activity logs" ON public.activity_logs FOR SELECT TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "caregivers view activity logs" ON public.activity_logs FOR SELECT TO authenticated
  USING (public.caregiver_can(patient_id, 'VIEW_ACTIVITY'));

CREATE POLICY "actors insert activity logs" ON public.activity_logs FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());
