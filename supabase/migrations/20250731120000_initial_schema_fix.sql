/*
          # [Initial Schema Creation]
          This script sets up the complete initial database schema for the PharmaConnect application.

          ## Query Description: [This operation will create all necessary tables, relationships, and security policies. It will also seed the database with initial categories and products. This is a foundational script and is safe to run on a new, empty database. If run on an existing database with the same table names, it may cause errors or data loss. A backup is always recommended before applying major schema changes.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "High"
          - Requires-Backup: true
          - Reversible: false
          
          ## Structure Details:
          - Tables Created: profiles, categories, products, cart_items, prescriptions, orders, order_items, payments
          - Functions Created: handle_new_user
          - Triggers Created: on_auth_user_created
          - RLS Policies: Enabled and configured for all tables.
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes, policies are created for all tables to restrict access based on user roles.
          - Auth Requirements: Policies are tied to authenticated users and their roles.
          
          ## Performance Impact:
          - Indexes: Primary keys and foreign keys are indexed automatically. Custom indexes are added for performance on frequently queried columns (slugs, user_id, etc.).
          - Triggers: A trigger is added to the auth.users table to create user profiles automatically.
          - Estimated Impact: Low on an empty database.
          */

-- 1. PROFILES TABLE
-- Stores user-specific information, linked to auth.users.
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email character varying(255) NOT NULL UNIQUE,
    first_name character varying(100),
    last_name character varying(100),
    phone character varying(20),
    role character varying(50) NOT NULL DEFAULT 'customer'::character varying,
    avatar_url character varying(255),
    date_of_birth date,
    preferred_language character varying(5) NOT NULL DEFAULT 'fr'::character varying,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.profiles IS 'Stores user profile information, extending the auth.users table.';

-- 2. CATEGORIES TABLE
-- Stores product categories.
CREATE TABLE public.categories (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name_fr character varying(100) NOT NULL,
    name_en character varying(100) NOT NULL,
    description_fr text,
    description_en text,
    slug character varying(100) NOT NULL UNIQUE,
    image_url character varying(255),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.categories IS 'Stores product categories like "Prescription" or "Vitamins".';

-- 3. PRODUCTS TABLE
-- Stores all product information.
CREATE TABLE public.products (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name_fr character varying(255) NOT NULL,
    name_en character varying(255) NOT NULL,
    description_fr text,
    description_en text,
    slug character varying(255) NOT NULL UNIQUE,
    sku character varying(100) UNIQUE,
    category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    type character varying(50) NOT NULL, -- 'prescription', 'over_counter', 'medical_device', 'supplement'
    price numeric(10, 2) NOT NULL,
    compare_price numeric(10, 2),
    requires_prescription boolean NOT NULL DEFAULT false,
    dosage character varying(100),
    active_ingredient character varying(255),
    manufacturer character varying(100),
    images text[],
    stock_quantity integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    featured boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.products IS 'Stores detailed information about each medication or product.';

-- 4. CART ITEMS TABLE
-- Stores items in a user's shopping cart.
CREATE TABLE public.cart_items (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity integer NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id, product_id)
);
COMMENT ON TABLE public.cart_items IS 'Manages items in users'' shopping carts.';

-- 5. PRESCRIPTIONS TABLE
-- Stores uploaded medical prescriptions.
CREATE TABLE public.prescriptions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_name character varying(100) NOT NULL,
    doctor_phone character varying(20),
    prescription_date date NOT NULL,
    file_url text NOT NULL,
    file_type character varying(20) NOT NULL, -- 'image', 'pdf'
    extracted_text text,
    status character varying(50) NOT NULL DEFAULT 'pending'::character varying, -- 'pending', 'verified', 'rejected', 'processing'
    pharmacist_notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.prescriptions IS 'Stores user-uploaded medical prescriptions for verification.';

-- 6. ORDERS TABLE
-- Stores customer orders.
CREATE TABLE public.orders (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_number character varying(50) NOT NULL UNIQUE DEFAULT 'ORD-' || upper(substr(gen_random_uuid()::text, 1, 8)),
    status character varying(50) NOT NULL DEFAULT 'pending'::character varying, -- 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
    subtotal numeric(10, 2) NOT NULL,
    shipping_amount numeric(10, 2) NOT NULL,
    total_amount numeric(10, 2) NOT NULL,
    currency character varying(3) NOT NULL DEFAULT 'XAF'::character varying,
    shipping_address jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.orders IS 'Stores customer order information.';

-- 7. ORDER ITEMS TABLE
-- Stores individual items within an order.
CREATE TABLE public.order_items (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity integer NOT NULL,
    unit_price numeric(10, 2) NOT NULL,
    total_price numeric(10, 2) NOT NULL
);
COMMENT ON TABLE public.order_items IS 'Stores the individual product line items for each order.';

-- 8. PAYMENTS TABLE
-- Stores payment information for orders.
CREATE TABLE public.payments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method character varying(50) NOT NULL,
    amount numeric(10, 2) NOT NULL,
    currency character varying(3) NOT NULL,
    status character varying(50) NOT NULL, -- 'pending', 'succeeded', 'failed'
    transaction_id character varying(255),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.payments IS 'Records payment attempts and status for orders.';

-- INDEXES FOR PERFORMANCE
CREATE INDEX ON public.products (slug);
CREATE INDEX ON public.products (category_id);
CREATE INDEX ON public.cart_items (user_id);
CREATE INDEX ON public.prescriptions (user_id);
CREATE INDEX ON public.orders (user_id);
CREATE INDEX ON public.order_items (order_id);
CREATE INDEX ON public.payments (order_id);

-- FUNCTION TO CREATE A PROFILE FOR A NEW USER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

-- TRIGGER TO CALL THE FUNCTION ON NEW USER SIGNUP
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ROW LEVEL SECURITY (RLS)
-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
-- Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories & Products (Publicly readable)
CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);

-- Cart Items
CREATE POLICY "Users can manage their own cart items" ON public.cart_items FOR ALL USING (auth.uid() = user_id);

-- Prescriptions
CREATE POLICY "Users can manage their own prescriptions" ON public.prescriptions FOR ALL USING (auth.uid() = user_id);

-- Orders & Order Items
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (
  (SELECT user_id FROM public.orders WHERE id = order_id) = auth.uid()
);
CREATE POLICY "Users can create their own order items" ON public.order_items FOR INSERT WITH CHECK (
  (SELECT user_id FROM public.orders WHERE id = order_id) = auth.uid()
);

-- Payments
CREATE POLICY "Users can manage their own payments" ON public.payments FOR ALL USING (
  (SELECT user_id FROM public.orders WHERE id = order_id) = auth.uid()
);

-- Admin policies (Example for products, extend as needed)
CREATE POLICY "Admins can manage all products" ON public.products FOR ALL
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'pharmacist') )
  WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'pharmacist') );

CREATE POLICY "Admins can manage all categories" ON public.categories FOR ALL
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'pharmacist') )
  WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'pharmacist') );

-- SEED DATA
-- Seed Categories (with corrected strings)
INSERT INTO public.categories (name_fr, name_en, slug, description_fr, description_en, image_url) VALUES
('Médicaments sur Ordonnance', 'Prescription Drugs', 'prescription', 'Médicaments nécessitant une ordonnance médicale.', 'Medications requiring a medical prescription.', 'https://images.unsplash.com/photo-1584515933411-9c8e42843e35?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'),
('Vente Libre', 'Over-the-Counter', 'over-counter', 'Médicaments disponibles sans ordonnance.', 'Medications available without a prescription.', 'https://images.unsplash.com/photo-1628771065518-5d8241315539?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'),
('Vitamines & Suppléments', 'Vitamins & Supplements', 'vitamins-supplements', 'Vitamines, minéraux et compléments alimentaires.', 'Vitamins, minerals, and dietary supplements.', 'https://images.unsplash.com/photo-1607619056574-7d8d3ee536b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'),
('Soins et Hygiène', 'Care & Hygiene', 'care-hygiene', 'Produits de soins et d''hygiène corporelle.', 'Personal care and hygiene products.', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'),
('Matériel Médical', 'Medical Equipment', 'medical-equipment', 'Équipements et dispositifs médicaux.', 'Medical equipment and devices.', 'https://images.unsplash.com/photo-1579684385127-6c1d7c2f8f2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'),
('Bébé et Maman', 'Baby & Mother', 'baby-mother', 'Produits pour les bébés et les jeunes mamans.', 'Products for babies and new mothers.', 'https://images.unsplash.com/photo-1525413123989-38321c6969a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80');

-- Seed Products (with corrected strings)
DO $$
DECLARE
    cat_over_counter_id uuid;
    cat_prescription_id uuid;
BEGIN
    SELECT id INTO cat_over_counter_id FROM public.categories WHERE slug = 'over-counter';
    SELECT id INTO cat_prescription_id FROM public.categories WHERE slug = 'prescription';

    INSERT INTO public.products (name_fr, name_en, slug, description_fr, description_en, category_id, type, price, compare_price, requires_prescription, dosage, active_ingredient, manufacturer, images, stock_quantity, featured) VALUES
    ('Doliprane 1000mg', 'Doliprane 1000mg', 'doliprane-1000mg', 'Soulage la douleur et la fièvre. Pour l''adulte.', 'Relieves pain and fever. For adults.', cat_over_counter_id, 'over_counter', 1500, 1700, false, '1000mg', 'Paracétamol', 'Sanofi', '{"https://images.unsplash.com/photo-1607619056574-7d8d3ee536b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"}', 100, true),
    ('Amoxicilline 500mg', 'Amoxicillin 500mg', 'amoxicilline-500mg', 'Antibiotique pour traiter les infections bactériennes.', 'Antibiotic to treat bacterial infections.', cat_prescription_id, 'prescription', 4500, null, true, '500mg', 'Amoxicilline', 'Generic Labs', '{"https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"}', 50, false),
    ('Biafine', 'Biafine', 'biafine-emulsion', 'Émulsion pour l''application cutanée. Traitement des brûlures et plaies.', 'Emulsion for cutaneous application. Treatment of burns and wounds.', cat_over_counter_id, 'over_counter', 3500, 4000, false, '93g', 'Trolamine', 'Johnson & Johnson', '{"https://images.unsplash.com/photo-1622202210947-8b21245a7967?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"}', 75, true),
    ('Smecta 30 sachets', 'Smecta 30 sachets', 'smecta-30-sachets', 'Traitement symptomatique de la diarrhée aiguë chez l''enfant et l''adulte.', 'Symptomatic treatment of acute diarrhea in children and adults.', cat_over_counter_id, 'over_counter', 2800, null, false, '3g', 'Diosmectite', 'Ipsen', '{"https://images.unsplash.com/photo-1550572092-2f93a59319b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"}', 120, false),
    ('Spasfon 30 comprimés', 'Spasfon 30 tablets', 'spasfon-30-comprimes', 'Traitement des douleurs spasmodiques de l''intestin, des voies biliaires, de la vessie et de l''utérus.', 'Treatment of spasmodic pain of the intestine, bile ducts, bladder and uterus.', cat_over_counter_id, 'over_counter', 2200, null, false, '80mg', 'Phloroglucinol', 'Teva', '{"https://images.unsplash.com/photo-1628771065518-5d8241315539?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"}', 200, true);
END $$;
