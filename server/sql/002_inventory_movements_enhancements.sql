-- SQL migration: Align inventory_movements schema with application needs
-- NOTE: Run these statements in your Postgres (Supabase) project.

-- 1) Extend inventory_movements with fields used by the app
DO $$ BEGIN
  ALTER TABLE public.inventory_movements
    ADD COLUMN IF NOT EXISTS stock_before integer,
    ADD COLUMN IF NOT EXISTS stock_after integer,
    ADD COLUMN IF NOT EXISTS reason text,
    ADD COLUMN IF NOT EXISTS description text,
    ADD COLUMN IF NOT EXISTS reference text;
EXCEPTION WHEN others THEN NULL; END $$;

-- 2) Broaden allowed values for movement_type to include app values
-- Existing allowed values: 'purchase','sale','adjustment','return'
-- App uses also: 'in','out','damaged'
DO $$ BEGIN
  ALTER TABLE public.inventory_movements
    DROP CONSTRAINT IF EXISTS inventory_movements_movement_type_check;
  ALTER TABLE public.inventory_movements
    ADD CONSTRAINT inventory_movements_movement_type_check
    CHECK (movement_type = ANY (ARRAY['purchase','sale','adjustment','return','in','out','damaged']));
EXCEPTION WHEN others THEN NULL; END $$;

-- 3) Optional: backfill description from notes if present (no-op if column doesn't exist)
DO $$ BEGIN
  UPDATE public.inventory_movements
  SET description = COALESCE(description, notes)
  WHERE notes IS NOT NULL AND (description IS NULL OR description = '');
EXCEPTION WHEN others THEN NULL; END $$;


