-- Migration: add Stripe fields and webhook events table
BEGIN;

-- Ensure pgcrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add frequency and Stripe identifiers to donations
ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS frequency text NOT NULL DEFAULT 'once',
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Constraint for frequency
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE c.conname = 'donations_frequency_check'
      AND t.relname = 'donations'
  ) THEN
    ALTER TABLE public.donations
      ADD CONSTRAINT donations_frequency_check CHECK (frequency IN ('once','monthly'));
  END IF;
END$$;

-- Create table to store processed Stripe webhook event ids (idempotency)
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb
);

-- Table to store donation payments (one record per processed payment/invoice)
CREATE TABLE IF NOT EXISTS public.donation_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  stripe_invoice_id text UNIQUE,
  stripe_payment_intent_id text UNIQUE,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Table to record project amount updates per donation payment (idempotency)
CREATE TABLE IF NOT EXISTS public.project_amount_updates (
  donation_payment_id uuid NOT NULL,
  donation_id uuid NOT NULL,
  project_id uuid NOT NULL,
  amount numeric NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (donation_payment_id, project_id)
);

-- Function to safely increment project current_amount once per donation payment/project
CREATE OR REPLACE FUNCTION public.increment_project_amount_if_donation_payment(
  p_donation_payment_id uuid,
  p_project_id uuid,
  p_amount numeric,
  p_donation_id uuid
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  -- Try insert into project_amount_updates to ensure idempotency per payment
  BEGIN
    INSERT INTO public.project_amount_updates (donation_payment_id, donation_id, project_id, amount)
    VALUES (p_donation_payment_id, p_donation_id, p_project_id, p_amount);
  EXCEPTION WHEN unique_violation THEN
    -- already processed for this payment
    RETURN;
  END;

  -- perform the update
  UPDATE public.projects
  SET current_amount = COALESCE(current_amount, 0) + p_amount
  WHERE id = p_project_id;

END; $$;

COMMIT;

-- NOTE: Apply this migration via Supabase SQL editor or psql. This file is reproducible.
