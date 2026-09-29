-- ============================================================
-- LOCO.com Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (for admin role)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CARS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_per_day NUMERIC(10, 2) NOT NULL CHECK (price_per_day >= 0),
  images TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cars_active ON public.cars(active);

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE RESTRICT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  pickup_address TEXT NOT NULL,
  dropoff_address TEXT NOT NULL,
  pickup_time TIMESTAMPTZ NOT NULL,
  dropoff_time TIMESTAMPTZ NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('PayPal', 'Cash App', 'Zelle', 'Chime')),
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  -- ID verification placeholder (never store actual documents here)
  id_verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (id_verification_status IN ('pending', 'verified', 'failed', 'not_required')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_rental_period CHECK (dropoff_time > pickup_time)
);

CREATE INDEX IF NOT EXISTS idx_bookings_car_id ON public.bookings(car_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(pickup_time, dropoff_time);

-- ============================================================
-- OVERLAP PREVENTION (Exclusion Constraint)
-- Prevents two approved/pending bookings for the same car with overlapping times.
-- Uses tstzrange for proper temporal exclusion.
-- ============================================================
-- First, create the range type helper if needed
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add exclusion constraint: no two non-cancelled/non-rejected bookings
-- for the same car can have overlapping [pickup, dropoff) ranges.
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_no_overlap;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (
    car_id WITH =,
    tstzrange(pickup_time, dropoff_time, '[)') WITH &&
  )
  WHERE (status IN ('pending', 'approved'));

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cars_updated_at ON public.cars;
CREATE TRIGGER cars_updated_at
  BEFORE UPDATE ON public.cars
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS bookings_updated_at ON public.bookings;
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- CARS policies
DROP POLICY IF EXISTS "Anyone can view active cars" ON public.cars;
CREATE POLICY "Anyone can view active cars"
  ON public.cars FOR SELECT
  USING (active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert cars" ON public.cars;
CREATE POLICY "Admins can insert cars"
  ON public.cars FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update cars" ON public.cars;
CREATE POLICY "Admins can update cars"
  ON public.cars FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete cars" ON public.cars;
CREATE POLICY "Admins can delete cars"
  ON public.cars FOR DELETE
  USING (public.is_admin());

-- BOOKINGS policies
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
CREATE POLICY "Anyone can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update bookings" ON public.bookings;
CREATE POLICY "Admins can update bookings"
  ON public.bookings FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;
CREATE POLICY "Admins can delete bookings"
  ON public.bookings FOR DELETE
  USING (public.is_admin());

-- ============================================================
-- STORAGE BUCKET (run after creating bucket in dashboard)
-- ============================================================
-- 1. Go to Storage → New bucket → name: "car-images" → Public: YES
-- 2. Then run the policies below:

-- Storage policies for car-images bucket
-- (These must be run after the bucket exists)

INSERT INTO storage.buckets (id, name, public)
VALUES ('car-images', 'car-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read car images" ON storage.objects;
CREATE POLICY "Public read car images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'car-images');

DROP POLICY IF EXISTS "Admins can upload car images" ON storage.objects;
CREATE POLICY "Admins can upload car images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'car-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update car images" ON storage.objects;
CREATE POLICY "Admins can update car images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'car-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete car images" ON storage.objects;
CREATE POLICY "Admins can delete car images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'car-images' AND public.is_admin());

-- ============================================================
-- SEED: Sample cars (optional – remove if not wanted)
-- ============================================================
INSERT INTO public.cars (name, description, price_per_day, images, active) VALUES
(
  'Tesla Model 3 Performance',
  'Experience pure electric performance. 0-60 in 3.1s, Autopilot, premium interior, and 315 miles of range. Perfect for city drives and weekend getaways.',
  149.00,
  ARRAY['https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800', 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800'],
  true
),
(
  'Porsche 911 Carrera',
  'Iconic sports car with legendary handling. 379 hp flat-six, PDK transmission, and timeless design. An unforgettable driving experience.',
  349.00,
  ARRAY['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800'],
  true
),
(
  'BMW X5 xDrive40i',
  'Luxury SUV with commanding presence. Spacious cabin, adaptive suspension, panoramic roof, and advanced driver assists. Ideal for family trips or executive travel.',
  189.00,
  ARRAY['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800'],
  true
),
(
  'Mercedes-Benz S-Class',
  'The pinnacle of luxury sedans. Whisper-quiet cabin, massage seats, ambient lighting, and cutting-edge technology. Arrive in style.',
  299.00,
  ARRAY['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800'],
  true
),
(
  'Jeep Wrangler Rubicon',
  'Go anywhere capability. Removable top and doors, 4x4 locking differentials, and legendary off-road prowess. Adventure awaits.',
  129.00,
  ARRAY['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800', 'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=800'],
  true
),
(
  'Audi RS7 Sportback',
  'Four-door coupe with supercar performance. 591 hp twin-turbo V8, quattro AWD, and a cabin that blends sport and luxury.',
  379.00,
  ARRAY['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800', 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800'],
  true
);
