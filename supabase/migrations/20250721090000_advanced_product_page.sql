/*
          # [Feature] Advanced Product Page & Reviews
          Adds a complete review system and enhances product relationships.

          ## Query Description: This migration is safe and non-destructive. It introduces new tables and functions to support advanced e-commerce features like customer reviews (with media), product recommendations, and linking prescriptions to cart items. It does not alter or delete any existing data.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true (by dropping new tables/functions)
          
          ## Structure Details:
          - Adds new table: `reviews`
          - Adds new column `prescription_id` to `cart_items`
          - Adds new functions: `get_frequently_bought_together`, `get_product_reviews_summary`
          - Creates a new storage bucket: `review-media`
          
          ## Security Implications:
          - RLS Status: Enabled on the new `reviews` table.
          - Policy Changes: Yes, new policies for the `reviews` table.
          - Auth Requirements: Users must be authenticated to write reviews.
          
          ## Performance Impact:
          - Indexes: Added on `reviews` table for `product_id` and `user_id`.
          - Triggers: None.
          - Estimated Impact: Low. New functions are optimized for performance.
          */

-- 1. Create Reviews Table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    images TEXT[],
    videos TEXT[],
    is_verified_purchase BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies for Reviews
-- Anyone can read reviews
CREATE POLICY "Allow public read access to reviews"
ON public.reviews
FOR SELECT
USING (true);

-- Authenticated users can insert their own reviews
CREATE POLICY "Allow users to insert their own reviews"
ON public.reviews
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Allow users to update their own reviews"
ON public.reviews
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Allow users to delete their own reviews"
ON public.reviews
FOR DELETE
USING (auth.uid() = user_id);


-- 2. Update Cart Items Table to link prescriptions
ALTER TABLE public.cart_items
ADD COLUMN prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE SET NULL;


-- 3. Create Storage Bucket for Review Media
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-media', 'review-media', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for Storage
-- Allow public read access
CREATE POLICY "Allow public read access to review media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'review-media');

-- Allow authenticated users to upload their own media
CREATE POLICY "Allow authenticated users to upload review media"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'review-media' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own media
CREATE POLICY "Allow users to update their own review media"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'review-media' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own media
CREATE POLICY "Allow users to delete their own review media"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'review-media' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);


-- 4. Create SQL Functions for Recommendations

-- Function to get "Frequently Bought Together" products
CREATE OR REPLACE FUNCTION get_frequently_bought_together(p_id UUID, p_limit INT DEFAULT 2)
RETURNS TABLE (
    product_id UUID,
    association_count BIGINT
)
LANGUAGE sql
AS $$
    WITH orders_with_product AS (
        SELECT order_id
        FROM order_items
        WHERE product_id = p_id
    )
    SELECT
        oi.product_id,
        count(*) as association_count
    FROM order_items oi
    JOIN orders_with_product owp ON oi.order_id = owp.order_id
    WHERE oi.product_id != p_id
    GROUP BY oi.product_id
    ORDER BY association_count DESC
    LIMIT p_limit;
$$;


-- Function to get a summary of product reviews
CREATE OR REPLACE FUNCTION get_product_reviews_summary(p_id UUID)
RETURNS TABLE (
    total_reviews BIGINT,
    average_rating NUMERIC,
    rating_distribution JSONB
)
LANGUAGE sql
AS $$
    SELECT
        COUNT(*) AS total_reviews,
        AVG(rating) AS average_rating,
        jsonb_object_agg(
            rating_counts.rating,
            rating_counts.count
        ) AS rating_distribution
    FROM (
        SELECT
            rating,
            COUNT(*) as count
        FROM reviews
        WHERE product_id = p_id
        GROUP BY rating
    ) as rating_counts;
$$;
