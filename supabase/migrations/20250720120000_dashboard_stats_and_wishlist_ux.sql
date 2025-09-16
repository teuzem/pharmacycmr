/*
          # [Function] get_dashboard_stats
          Creates a function to aggregate key statistics for the admin dashboard.

          ## Query Description: "This function provides a centralized and performant way to fetch dashboard metrics. It counts pending orders, new users within the last 30 days, pending prescriptions, and out-of-stock products. It is a safe, read-only operation."
          
          ## Metadata:
          - Schema-Category: ["Safe"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Creates a new RPC function `get_dashboard_stats`.
          
          ## Security Implications:
          - RLS Status: [Not Applicable]
          - Policy Changes: [No]
          - Auth Requirements: [None, but frontend should restrict access to admins]
          
          ## Performance Impact:
          - Indexes: [Utilizes existing indexes on status and created_at columns]
          - Triggers: [None]
          - Estimated Impact: [Low, improves performance by reducing multiple queries to one.]
          */
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  pending_orders_count BIGINT,
  new_users_count BIGINT,
  pending_prescriptions_count BIGINT,
  out_of_stock_products_count BIGINT
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.orders WHERE status = 'pending'),
    (SELECT COUNT(*) FROM auth.users WHERE created_at >= NOW() - INTERVAL '30 days'),
    (SELECT COUNT(*) FROM public.prescriptions WHERE status = 'pending'),
    (SELECT COUNT(*) FROM public.products WHERE stock_quantity = 0 AND is_active = true);
END;
$$ LANGUAGE plpgsql;
