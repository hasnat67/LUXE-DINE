-- Create tables for Restaurant 3D project

-- 1. Restaurants (Settings)
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    currency TEXT DEFAULT 'USD',
    currency_symbol TEXT DEFAULT '$',
    tax_rate DECIMAL DEFAULT 0.08,
    service_charge DECIMAL DEFAULT 0.05,
    theme_color TEXT DEFAULT '#D4AF37',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY, -- Using slug-like IDs for compatibility with existing code
    name TEXT NOT NULL,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Menu Items
CREATE TABLE IF NOT EXISTS public.menu_items (
    id TEXT PRIMARY KEY, -- Using slug-like IDs for compatibility with existing code
    name TEXT NOT NULL,
    category_id TEXT REFERENCES public.categories(id),
    price DECIMAL NOT NULL,
    calories INTEGER,
    description TEXT,
    ingredients JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    model_url TEXT,
    featured BOOLEAN DEFAULT false,
    available BOOLEAN DEFAULT true,
    spin_photos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tables (Restaurant Seating)
CREATE TABLE IF NOT EXISTS public.restaurant_tables (
    id SERIAL PRIMARY KEY,
    status TEXT DEFAULT 'available', -- available, occupied, reserved
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id INTEGER, -- Simplified for compatibility; use restaurant_tables for status tracking
    items JSONB NOT NULL,
    total_price DECIMAL NOT NULL,
    tax DECIMAL,
    service_charge DECIMAL,
    status TEXT DEFAULT 'pending', -- pending, preparing, served, completed, cancelled
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Notifications (Waiter Calls, etc)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- call_waiter, order_status
    message TEXT,
    table_id INTEGER REFERENCES public.restaurant_tables(id),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) - Basic Policy: Anyone can read, Auth users can write
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Public Read Access
CREATE POLICY "Public read access" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.restaurant_tables FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.orders FOR SELECT USING (true);

-- Customer Submissions
CREATE POLICY "Public insert access" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON public.notifications FOR INSERT WITH CHECK (true);

-- Admin Management (Authenticated Users)
-- In development, if you don't have Auth setup yet, you can change 'authenticated' to 'anon' temporarily.
-- For production, these MUST be restricted to 'authenticated'.
CREATE POLICY "Admin manage restaurants" ON public.restaurants FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin manage categories" ON public.categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin manage menu items" ON public.menu_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin manage tables" ON public.restaurant_tables FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin manage orders" ON public.orders FOR ALL TO authenticated USING (true);
-- Enable Realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
