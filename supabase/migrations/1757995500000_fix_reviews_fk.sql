/*
# [Fix] Mettre à jour la relation de la table des avis

Ce script modifie la clé étrangère de la table `reviews` pour la lier directement à la table `profiles` au lieu de `auth.users`. Cela simplifie les requêtes pour récupérer les informations de l'auteur d'un avis.

## Query Description:
- **DROP CONSTRAINT**: Supprime l'ancienne contrainte `reviews_user_id_fkey` qui liait `reviews.user_id` à `auth.users.id`.
- **ADD CONSTRAINT**: Ajoute une nouvelle contrainte `reviews_user_id_fkey` qui lie `reviews.user_id` à `public.profiles.id`.

- **Impact sur les données**: Aucune perte de données. La relation est simplement redéfinie.
- **Risques potentiels**: Faible. Assurez-vous que tous les `user_id` dans `reviews` existent bien dans `profiles`. Le trigger `handle_new_user` devrait garantir cela.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (en inversant les opérations)

## Structure Details:
- Table affectée: `public.reviews`
- Colonne affectée: `user_id`
- Contrainte affectée: `reviews_user_id_fkey`

## Security Implications:
- RLS Status: Inchangé
- Policy Changes: Non
- Auth Requirements: Non

## Performance Impact:
- Indexes: La clé étrangère recrée un index. Impact neutre à positif sur les jointures.
- Triggers: Inchangé
- Estimated Impact: Faible.
*/

-- Supprimer l'ancienne contrainte si elle existe
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Ajouter la nouvelle contrainte liant à public.profiles
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id)
ON DELETE CASCADE;
