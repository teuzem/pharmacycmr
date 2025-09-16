/*
          # [Function Security Update]
          Sets the search_path for the get_dashboard_stats function to mitigate security risks.

          ## Query Description: [This operation enhances security by explicitly setting the function's schema search path, preventing potential hijacking attacks. It is a non-destructive, safe operation with no impact on data.]
          
          ## Metadata:
          - Schema-Category: ["Safe"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Function: get_dashboard_stats
          
          ## Security Implications:
          - RLS Status: [Not Applicable]
          - Policy Changes: [No]
          - Auth Requirements: [None]
          
          ## Performance Impact:
          - Indexes: [Not Applicable]
          - Triggers: [Not Applicable]
          - Estimated Impact: [None]
          */

ALTER FUNCTION public.get_dashboard_stats() SET search_path = public;
