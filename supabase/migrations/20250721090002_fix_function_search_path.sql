/*
          # [SECURITY] Set Search Path for Functions
          Sets a secure search_path for public functions to mitigate potential security vulnerabilities.

          ## Query Description: "This operation hardens the security of database functions by explicitly setting their execution search path. It prevents a malicious user with table creation privileges from hijacking function execution. This is a non-destructive, safe operation."
          
          ## Metadata:
          - Schema-Category: "Safe"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Functions: `get_frequently_bought_together`, `get_product_reviews_summary`
          
          ## Security Implications:
          - RLS Status: Not applicable
          - Policy Changes: No
          - Auth Requirements: None
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Negligible performance impact.
          */

ALTER FUNCTION public.get_frequently_bought_together(p_id uuid, p_limit integer)
SET search_path = public;

ALTER FUNCTION public.get_product_reviews_summary(p_id uuid)
SET search_path = public;

-- Reset session-level search_path to default
RESET search_path;
