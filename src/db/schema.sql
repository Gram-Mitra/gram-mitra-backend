-- ==============================================================================
-- Gram Mitra / Rural Connect - Supabase PostgreSQL Database Schema
-- ==============================================================================

-- Enable UUID extension (standard in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES (Unified User Model linked to Supabase Auth)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  age INTEGER,
  state TEXT,
  district TEXT,
  village TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. HOSPITALS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('human', 'animal')),
  address TEXT,
  state TEXT,
  district TEXT,
  village TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  phone TEXT,
  email TEXT,
  is_emergency BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. HOSPITAL SERVICES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hospital_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  description TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. VILLAGE PROBLEMS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS village_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('water', 'road', 'electricity', 'agriculture', 'healthcare', 'sanitation', 'animal', 'other')),
  image_url TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  village TEXT,
  district TEXT,
  status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'under_review', 'in_progress', 'resolved', 'rejected')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 5. PROBLEM UPDATES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problem_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID REFERENCES village_problems(id) ON DELETE CASCADE,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT,
  comment TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. PRODUCTS (Marketplace)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price DECIMAL NOT NULL,
  unit TEXT,
  quantity DECIMAL NOT NULL,
  image_url TEXT,
  location TEXT,
  state TEXT,
  district TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. NGOS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ngos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  state TEXT,
  district TEXT,
  village TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  services TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. MYTHS vs FACTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS myths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  myth TEXT NOT NULL,
  fact TEXT NOT NULL,
  explanation TEXT,
  category TEXT,
  language TEXT DEFAULT 'en',
  image_url TEXT,
  source TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. ORDERS (Marketplace Transactions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  unit_price DECIMAL NOT NULL,
  total_price DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  delivery_address TEXT NOT NULL,
  delivery_village TEXT,
  delivery_district TEXT,
  delivery_state TEXT,
  payment_method TEXT DEFAULT 'cod' CHECK (payment_method IN ('cod', 'cash_on_delivery', 'upi', 'bank_transfer', 'online')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES for Optimized Query Performance
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_hospitals_type_district ON hospitals(type, district);
CREATE INDEX IF NOT EXISTS idx_hospitals_is_active ON hospitals(is_active);
CREATE INDEX IF NOT EXISTS idx_hospital_services_hospital_id ON hospital_services(hospital_id);
CREATE INDEX IF NOT EXISTS idx_village_problems_reported_by ON village_problems(reported_by);
CREATE INDEX IF NOT EXISTS idx_village_problems_district_status ON village_problems(district, status);
CREATE INDEX IF NOT EXISTS idx_village_problems_category ON village_problems(category);
CREATE INDEX IF NOT EXISTS idx_problem_updates_problem_id ON problem_updates(problem_id);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_district ON products(district);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_ngos_district_category ON ngos(district, category);
CREATE INDEX IF NOT EXISTS idx_myths_category_language ON myths(category, language);

-- ==============================================================================
-- AUTOMATIC updated_at TRIGGER FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_hospitals_updated_at BEFORE UPDATE ON hospitals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_village_problems_updated_at BEFORE UPDATE ON village_problems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_ngos_updated_at BEFORE UPDATE ON ngos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_myths_updated_at BEFORE UPDATE ON myths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
