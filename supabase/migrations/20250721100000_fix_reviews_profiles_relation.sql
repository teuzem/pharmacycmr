/*
# [Correctif] Relation Avis-Profils
[Cette migration corrige définitivement le problème de relation entre la table des avis (reviews) et la table des profils (profiles). Elle supprime l'ancienne clé étrangère qui pointait vers la table d'authentification et en crée une nouvelle qui pointe directement vers la table des profils publics.]

## Query Description: [Cette opération modifie une contrainte de clé étrangère pour améliorer la performance des requêtes et résoudre une erreur d'API. Elle ne modifie aucune donnée existante et est considérée comme sûre. L'intégrité des données est maintenue car la table des profils est déjà liée à la table des utilisateurs.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table 'reviews': Modification de la contrainte 'reviews_user_id_fkey'.

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [No]
- Auth Requirements: [None]

## Performance Impact:
- Indexes: [Modification d'une clé étrangère, peut légèrement améliorer les jointures.]
- Triggers: [None]
- Estimated Impact: [Positif sur les requêtes de lecture des avis.]
*/

-- Supprimer l'ancienne contrainte de clé étrangère qui pointe vers auth.users
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Ajouter une nouvelle contrainte de clé étrangère qui pointe directement vers public.profiles
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
