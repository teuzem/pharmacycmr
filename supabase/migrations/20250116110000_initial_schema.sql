/*
# PharmaConnect Cameroun - Schema Initial
Création du schéma complet pour l'application e-commerce de pharmacie

## Query Description: Cette migration crée l'architecture complète de la base de données pour PharmaConnect Cameroun. Elle inclut toutes les tables nécessaires pour gérer les utilisateurs, produits, commandes, ordonnances et paiements. Aucune donnée existante ne sera affectée car il s'agit de la migration initiale.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Tables: profiles, categories, products, cart_items, prescriptions, orders, order_items, payments
- Indexes: Optimisés pour les requêtes fréquentes
- Constraints: Clés étrangères et validations métier

## Security Implications:
- RLS Status: Enabled sur toutes les tables publiques
- Policy Changes: Yes - politiques de sécurité complètes
- Auth Requirements: Intégration avec auth.users

## Performance Impact:
- Indexes: Ajoutés sur les colonnes de recherche fréquentes
- Triggers: Trigger pour création automatique de profil
- Estimated Impact: Performance optimisée pour l'e-commerce
*/

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des profils utilisateurs
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'pharmacist', 'admin')),
    avatar_url TEXT,
    date_of_birth DATE,
    preferred_language TEXT NOT NULL DEFAULT 'fr' CHECK (preferred_language IN ('fr', 'en')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des catégories
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name_fr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_fr TEXT,
    description_en TEXT,
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des produits
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name_fr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_fr TEXT,
    description_en TEXT,
    slug TEXT NOT NULL UNIQUE,
    sku TEXT NOT NULL UNIQUE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('prescription', 'over_counter', 'medical_device', 'supplement')),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    compare_price DECIMAL(10,2) CHECK (compare_price IS NULL OR compare_price > price),
    requires_prescription BOOLEAN NOT NULL DEFAULT false,
    dosage TEXT,
    active_ingredient TEXT,
    manufacturer TEXT,
    images TEXT[] DEFAULT '{}',
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table du panier
CREATE TABLE public.cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Table des ordonnances
CREATE TABLE public.prescriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    doctor_name TEXT NOT NULL,
    doctor_phone TEXT,
    prescription_date DATE NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('image', 'pdf')),
    extracted_text TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'verified', 'rejected')),
    pharmacist_notes TEXT,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des commandes
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    currency TEXT NOT NULL DEFAULT 'XAF',
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des articles de commande
CREATE TABLE public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des paiements
CREATE TABLE public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cinetpay', 'paystack', 'mobile_money', 'cash_on_delivery')),
    payment_provider TEXT,
    provider_transaction_id TEXT,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'XAF',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    provider_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes pour optimiser les performances
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_prescriptions_user ON prescriptions(user_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_payments_order ON payments(order_id);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Politiques RLS pour categories (lecture publique)
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (is_active = true);

-- Politiques RLS pour products (lecture publique)
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (is_active = true);

-- Politiques RLS pour cart_items
CREATE POLICY "Users can view their own cart" ON cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert into their own cart" ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cart" ON cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete from their own cart" ON cart_items FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour prescriptions
CREATE POLICY "Users can view their own prescriptions" ON prescriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own prescriptions" ON prescriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own prescriptions" ON prescriptions FOR UPDATE USING (auth.uid() = user_id);

-- Politiques RLS pour orders
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques RLS pour order_items
CREATE POLICY "Users can view their own order items" ON order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
);

-- Politiques RLS pour payments
CREATE POLICY "Users can view their own payments" ON payments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()
    )
);

-- Trigger pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, phone, preferred_language)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'fr')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Fonction pour générer un numéro de commande unique
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_number := 'PH' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(counter::TEXT, 4, '0');
        
        IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_number) THEN
            RETURN new_number;
        END IF;
        
        counter := counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement le numéro de commande
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE PROCEDURE set_order_number();

-- Insertion des données de test

-- Catégories
INSERT INTO categories (name_fr, name_en, slug, description_fr, description_en, image_url) VALUES
('Médicaments sur ordonnance', 'Prescription Medicines', 'prescription-medicines', 'Médicaments nécessitant une ordonnance médicale', 'Medicines requiring a medical prescription', 'https://images.unsplash.com/photo-1585435557343-3b092031d4cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'),
('Vente libre', 'Over-the-Counter', 'over-the-counter', 'Médicaments disponibles sans ordonnance', 'Medicines available without prescription', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'),
('Vitamines et Suppléments', 'Vitamins & Supplements', 'vitamins-supplements', 'Compléments alimentaires et vitamines', 'Dietary supplements and vitamins', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'),
('Matériel Médical', 'Medical Equipment', 'medical-equipment', 'Équipements et dispositifs médicaux', 'Medical equipment and devices', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'),
('Soins et Hygiène', 'Care & Hygiene', 'care-hygiene', 'Produits de soins et d\'hygiène', 'Care and hygiene products', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'),
('Premiers Secours', 'First Aid', 'first-aid', 'Trousses et produits de premiers secours', 'First aid kits and products', 'https://images.unsplash.com/photo-1603398938795-1dd61026827d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80');

-- Produits d'exemple
INSERT INTO products (name_fr, name_en, description_fr, description_en, slug, sku, category_id, type, price, requires_prescription, dosage, active_ingredient, manufacturer, images, stock_quantity, featured) VALUES
('Paracétamol 500mg', 'Paracetamol 500mg', 'Médicament contre la douleur et la fièvre', 'Pain and fever relief medication', 'paracetamol-500mg', 'PAR500-001', (SELECT id FROM categories WHERE slug = 'over-the-counter'), 'over_counter', 1500, false, '500mg', 'Paracétamol', 'Pharma Plus', '{"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"}', 100, true),
('Amoxicilline 500mg', 'Amoxicillin 500mg', 'Antibiotique à large spectre', 'Broad-spectrum antibiotic', 'amoxicilline-500mg', 'AMX500-001', (SELECT id FROM categories WHERE slug = 'prescription-medicines'), 'prescription', 8500, true, '500mg', 'Amoxicilline', 'Antibio Cameroun', '{"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"}', 50, true),
('Vitamine C 1000mg', 'Vitamin C 1000mg', 'Complément alimentaire en vitamine C', 'Vitamin C dietary supplement', 'vitamine-c-1000mg', 'VTC1000-001', (SELECT id FROM categories WHERE slug = 'vitamins-supplements'), 'supplement', 3500, false, '1000mg', 'Acide ascorbique', 'VitaHealth', '{"https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"}', 75, true),
('Thermomètre Digital', 'Digital Thermometer', 'Thermomètre numérique pour mesurer la température', 'Digital thermometer for temperature measurement', 'thermometre-digital', 'THERM-001', (SELECT id FROM categories WHERE slug = 'medical-equipment'), 'medical_device', 12000, false, NULL, NULL, 'MedDevice Pro', '{"https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"}', 30, false),
('Gel Hydroalcoolique 100ml', 'Hand Sanitizer 100ml', 'Gel désinfectant pour les mains', 'Hand sanitizing gel', 'gel-hydroalcoolique-100ml', 'GEL100-001', (SELECT id FROM categories WHERE slug = 'care-hygiene'), 'over_counter', 2500, false, '100ml', 'Alcool 70%', 'HygienePlus', '{"https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"}', 200, true),
('Trousse de Premiers Secours', 'First Aid Kit', 'Kit complet de premiers secours', 'Complete first aid kit', 'trousse-premiers-secours', 'FAID-KIT-001', (SELECT id FROM categories WHERE slug = 'first-aid'), 'medical_device', 25000, false, NULL, NULL, 'SecureMed', '{"https://images.unsplash.com/photo-1603398938795-1dd61026827d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"}', 20, false),
('Ibuprofène 400mg', 'Ibuprofen 400mg', 'Anti-inflammatoire et antalgique', 'Anti-inflammatory and pain reliever', 'ibuprofene-400mg', 'IBU400-001', (SELECT id FROM categories WHERE slug = 'over-the-counter'), 'over_counter', 2800, false, '400mg', 'Ibuprofène', 'PainRelief Pharma', '{"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"}', 80, true),
('Oméprazole 20mg', 'Omeprazole 20mg', 'Inhibiteur de la pompe à protons', 'Proton pump inhibitor', 'omeprazole-20mg', 'OME20-001', (SELECT id FROM categories WHERE slug = 'prescription-medicines'), 'prescription', 15500, true, '20mg', 'Oméprazole', 'GastroMed', '{"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"}', 40, false);
