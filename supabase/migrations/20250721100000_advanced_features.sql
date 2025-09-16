/*
          # [Feature: Wishlists]
          Adds tables for managing user wishlists and the items within them.

          ## Query Description: This operation creates two new tables, `wishlists` and `wishlist_items`, to enable users to save products to named lists. It is a non-destructive, structural change. Existing data is not affected.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Tables Added: `public.wishlists`, `public.wishlist_items`
          - Columns Added: 
            - `wishlists`: id, user_id, name, is_default, created_at
            - `wishlist_items`: id, wishlist_id, product_id, created_at
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes (New policies for `wishlists` and `wishlist_items`)
          - Auth Requirements: Users must be authenticated to manage their own wishlists.
          
          ## Performance Impact:
          - Indexes: Added (Primary Keys and Foreign Keys)
          - Triggers: None
          - Estimated Impact: Low. Standard table creation.
          */

-- 1. Wishlists Table
CREATE TABLE public.wishlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.wishlists IS 'Stores user-created wishlists.';
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- 2. Wishlist Items Table
CREATE TABLE public.wishlist_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wishlist_id UUID NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_wishlist_product UNIQUE (wishlist_id, product_id)
);

COMMENT ON TABLE public.wishlist_items IS 'Associates products with wishlists.';
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for Wishlists
CREATE POLICY "Users can view their own wishlists."
ON public.wishlists FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wishlists."
ON public.wishlists FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlists."
ON public.wishlists FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlists."
ON public.wishlists FOR DELETE
USING (auth.uid() = user_id);

-- 4. RLS Policies for Wishlist Items
CREATE POLICY "Users can view items in their own wishlists."
ON public.wishlist_items FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.wishlists w
    WHERE w.id = wishlist_id AND w.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add items to their own wishlists."
ON public.wishlist_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.wishlists w
    WHERE w.id = wishlist_id AND w.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove items from their own wishlists."
ON public.wishlist_items FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.wishlists w
    WHERE w.id = wishlist_id AND w.user_id = auth.uid()
  )
);

-- 5. Function to create a default wishlist for a new user
CREATE OR REPLACE FUNCTION public.create_default_wishlist()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wishlists (user_id, name, is_default)
  VALUES (NEW.id, 'Mes Favoris', TRUE);
  RETURN NEW;
END;
$$;

-- 6. Trigger to call the function on new user creation
CREATE TRIGGER on_new_user_create_default_wishlist
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_default_wishlist();
