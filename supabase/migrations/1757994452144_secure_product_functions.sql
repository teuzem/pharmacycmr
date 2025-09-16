/*
          # [SECURITY] Set search_path for functions
          [This operation secures functions by setting a non-mutable search_path. This prevents malicious users from creating objects (e.g., functions) in other schemas that could be executed unintentionally.]

          ## Query Description: [This operation modifies the search_path for specific database functions to enhance security. It ensures that functions execute with a predictable and safe schema path, mitigating potential hijacking risks. No data is affected, but it's a critical security best practice.]
          
          ## Metadata:
          - Schema-Category: ["Security"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          [Affects the following functions: get_frequently_bought_together, get_product_reviews_summary]
          
          ## Security Implications:
          - RLS Status: [Not Changed]
          - Policy Changes: [No]
          - Auth Requirements: [None]
          
          ## Performance Impact:
          - Indexes: [Not Changed]
          - Triggers: [Not Changed]
          - Estimated Impact: [None]
          */

ALTER FUNCTION public.get_frequently_bought_together(p_id uuid, p_limit integer) SET search_path = public;
ALTER FUNCTION public.get_product_reviews_summary(p_id uuid) SET search_path = public;
