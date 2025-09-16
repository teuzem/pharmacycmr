/*
# [SECURITY] Fix Function Search Path
This migration sets a secure search_path for the handle_new_user function to mitigate potential security risks, addressing the 'Function Search Path Mutable' warning.

## Query Description:
- This operation modifies the configuration of an existing database function.
- It does not alter any data or table structures.
- It is a safe, non-destructive operation that enhances security.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Function affected: public.handle_new_user()

## Security Implications:
- RLS Status: Not changed
- Policy Changes: No
- Auth Requirements: None
- Fixes: Sets `search_path` to 'public', preventing potential hijacking by malicious functions in other schemas.
*/
ALTER FUNCTION public.handle_new_user() SET search_path = 'public';
