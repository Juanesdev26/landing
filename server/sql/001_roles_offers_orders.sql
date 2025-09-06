-- SQL migration: roles, user offers, and order source differentiation
-- NOTE: Run these statements in your Postgres (Supabase) project.

-- 1) Extend profiles to include fields used by the app
DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS postal_code text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date date;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender text;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notes text;
EXCEPTION WHEN others THEN NULL; END $$;

-- 2) Differentiate orders by source (customer vs user vs admin)
DO $$ BEGIN
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_source text
    CHECK (order_source = ANY (ARRAY['customer','user','admin']))
    DEFAULT 'customer';
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS assigned_user_id uuid
    REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION WHEN others THEN NULL; END $$;

-- 3) Create user_offers table to assign offers to specific users
CREATE TABLE IF NOT EXISTS public.user_offers (
  id_offer uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id_product) ON DELETE CASCADE,
  discount_percent numeric NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  is_active boolean DEFAULT true,
  valid_from timestamptz,
  valid_to timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT user_offers_unique UNIQUE (user_id, product_id)
);

-- 4) Updated_at trigger for user_offers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_offers_updated_at ON public.user_offers;
CREATE TRIGGER trg_user_offers_updated_at
BEFORE UPDATE ON public.user_offers
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- 5) Create global offers table (offers visible to all users)
CREATE TABLE IF NOT EXISTS public.offers (
  id_offer uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id_product) ON DELETE CASCADE,
  discount_percent numeric NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  is_active boolean DEFAULT true,
  valid_from timestamptz,
  valid_to timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT offers_unique_product UNIQUE (product_id)
);

DROP TRIGGER IF EXISTS trg_offers_updated_at ON public.offers;
CREATE TRIGGER trg_offers_updated_at
BEFORE UPDATE ON public.offers
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();


