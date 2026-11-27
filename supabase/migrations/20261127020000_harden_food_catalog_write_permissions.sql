-- =========================================================
-- CociHub
-- AUD-135.1 / AUD-106
-- Harden food catalog write permissions
-- =========================================================
--
-- Food catalog mutations must be performed through
-- authorized RPC functions.
--
-- Direct writes could bypass catalog validation,
-- allergen synchronization and suggestion moderation.
--
-- Existing SELECT grants and RLS policies are preserved.
-- =========================================================


revoke insert, update, delete, truncate
on table
    public.food_items,
    public.food_aliases,
    public.food_allergens,
    public.food_keywords,
    public.food_catalog_suggestions
from public, anon, authenticated;