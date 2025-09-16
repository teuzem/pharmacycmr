/*
# Schéma complet pour l'application e-commerce de pharmacie camerounaise
Cette migration crée toute la structure de base de données nécessaire pour une pharmacie e-commerce complète.

## Query Description: 
Cette opération crée un système complet de gestion de pharmacie e-commerce incluant :
- Gestion des utilisateurs et profils
- Catalogue de produits pharmaceutiques
- Système de commandes et paiements
- Gestion des ordonnances avec OCR
- Support multilingue
- Gestion des stocks et livraisons

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: true

## Structure Details:
Tables créées : profiles, categories, products, prescriptions, orders, order_items, payments, addresses, reviews, inventory, translations

## Security Implications:
- RLS Status: Enabled sur toutes les tables publiques
- Policy Changes: Yes - Politiques complètes d'accès
- Auth Requirements: Authentification requise pour les achats

## Performance Impact:
- Indexes: Ajoutés sur les colonnes de recherche principales
- Triggers: Trigger pour création automatique de profil
- Estimated Impact: Structure optimisée pour les requêtes e-commerce
*/

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Types ENUM
CREATE TYPE user_role AS ENUM ('customer', 'pharmacist', 'admin');
CREATE TYPE prescription_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('cinetpay', 'paystack', 'cash_on_delivery');
CREATE TYPE product_type AS ENUM ('prescription', 'over_counter', 'medical_device', 'supplement');

-- Table des profils utilisateurs
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'customer',
  avatar_url TEXT,
  date_of_birth DATE,
  preferred_language TEXT DEFAULT 'fr',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des adresses
CREATE TABLE public.addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('shipping', 'billing')) DEFAULT 'shipping',
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  postal_code TEXT,
  country TEXT DEFAULT 'Cameroon',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des catégories de produits
CREATE TABLE public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_fr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_fr TEXT,
  description_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des produits
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_fr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_fr TEXT,
  description_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  type product_type NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  requires_prescription BOOLEAN DEFAULT false,
  dosage TEXT,
  active_ingredient TEXT,
  manufacturer TEXT,
  country_origin TEXT,
  expiry_date DATE,
  images TEXT[] DEFAULT '{}',
  weight DECIMAL(8,2),
  dimensions JSONB,
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des ordonnances
CREATE TABLE public.prescriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  prescription_image_url TEXT NOT NULL,
  ocr_text TEXT,
  extracted_products JSONB,
  doctor_name TEXT,
  doctor_license TEXT,
  patient_name TEXT,
  prescription_date DATE,
  status prescription_status DEFAULT 'pending',
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des commandes
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status order_status DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'XAF',
  shipping_address JSONB,
  billing_address JSONB,
  prescription_id UUID REFERENCES public.prescriptions(id),
  notes TEXT,
  estimated_delivery DATE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des articles de commande
CREATE TABLE public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des paiements
CREATE TABLE public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  payment_method payment_method NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'XAF',
  status payment_status DEFAULT 'pending',
  transaction_id TEXT,
  gateway_response JSONB,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des avis
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de l'inventaire
CREATE TABLE public.inventory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  batch_number TEXT,
  expiry_date DATE,
  quantity INTEGER NOT NULL,
  cost_price DECIMAL(10,2),
  supplier TEXT,
  received_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table du panier
CREATE TABLE public.cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Trigger pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Fonction pour générer le numéro de commande
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
BEGIN
  SELECT 'CMD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((COALESCE(MAX(SUBSTRING(order_number FROM 14)::INTEGER), 0) + 1)::TEXT, 4, '0')
  INTO new_number
  FROM public.orders
  WHERE order_number LIKE 'CMD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%';
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-générer le numéro de commande
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE set_order_number();

-- Politique RLS pour les profils
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Politique RLS pour les adresses
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent gérer leurs adresses" ON public.addresses
  FOR ALL USING (auth.uid() = user_id);

-- Politique RLS pour les catégories (lecture publique)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture publique des catégories" ON public.categories
  FOR SELECT USING (is_active = true);

-- Politique RLS pour les produits (lecture publique)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture publique des produits actifs" ON public.products
  FOR SELECT USING (is_active = true);

-- Politique RLS pour les ordonnances
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent gérer leurs ordonnances" ON public.prescriptions
  FOR ALL USING (auth.uid() = user_id);

-- Politique RLS pour les commandes
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent voir leurs commandes" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent créer des commandes" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique RLS pour les articles de commande
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Accès aux articles via commandes" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

-- Politique RLS pour les paiements
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Accès aux paiements via commandes" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

-- Politique RLS pour les avis
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture publique des avis publiés" ON public.reviews
  FOR SELECT USING (is_published = true);
CREATE POLICY "Les utilisateurs peuvent gérer leurs avis" ON public.reviews
  FOR ALL USING (auth.uid() = user_id);

-- Politique RLS pour l'inventaire (admin seulement)
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour le panier
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent gérer leur panier" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

-- Index pour les performances
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_type ON public.products(type);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_products_featured ON public.products(featured);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_order_items_product ON public.order_items(product_id);
CREATE INDEX idx_reviews_product ON public.reviews(product_id);
CREATE INDEX idx_reviews_published ON public.reviews(is_published);
CREATE INDEX idx_cart_user ON public.cart_items(user_id);

-- Données de base - Catégories
INSERT INTO public.categories (name_fr, name_en, slug, description_fr, description_en) VALUES
('Médicaments sur ordonnance', 'Prescription Drugs', 'prescription-drugs', 'Médicaments nécessitant une ordonnance médicale', 'Medications requiring medical prescription'),
('Médicaments en vente libre', 'Over-the-Counter', 'over-counter', 'Médicaments disponibles sans ordonnance', 'Medications available without prescription'),
('Vitamines et suppléments', 'Vitamins & Supplements', 'vitamins-supplements', 'Vitamines, minéraux et compléments alimentaires', 'Vitamins, minerals and dietary supplements'),
('Soins personnels', 'Personal Care', 'personal-care', 'Produits d''hygiène et de soins personnels', 'Personal hygiene and care products'),
('Matériel médical', 'Medical Equipment', 'medical-equipment', 'Équipements et dispositifs médicaux', 'Medical equipment and devices'),
('Soins bébé', 'Baby Care', 'baby-care', 'Produits pour bébés et nourrissons', 'Products for babies and infants');

-- Produits d'exemple
INSERT INTO public.products (name_fr, name_en, slug, sku, category_id, type, price, requires_prescription, dosage, active_ingredient, manufacturer, description_fr, description_en, stock_quantity) VALUES
('Paracétamol 500mg', 'Paracetamol 500mg', 'paracetamol-500mg', 'PAR500', (SELECT id FROM public.categories WHERE slug = 'over-counter'), 'over_counter', 1500, false, '500mg', 'Paracétamol', 'Pharma Cameroun', 'Antalgique et antipyrétique', 'Pain reliever and fever reducer', 100),
('Amoxicilline 250mg', 'Amoxicillin 250mg', 'amoxicilline-250mg', 'AMX250', (SELECT id FROM public.categories WHERE slug = 'prescription-drugs'), 'prescription', 3500, true, '250mg', 'Amoxicilline', 'Antibio Lab', 'Antibiotique à large spectre', 'Broad-spectrum antibiotic', 50),
('Vitamine C 1000mg', 'Vitamin C 1000mg', 'vitamine-c-1000mg', 'VITC1000', (SELECT id FROM public.categories WHERE slug = 'vitamins-supplements'), 'supplement', 2500, false, '1000mg', 'Acide ascorbique', 'VitaLife', 'Complément en vitamine C', 'Vitamin C supplement', 200);
