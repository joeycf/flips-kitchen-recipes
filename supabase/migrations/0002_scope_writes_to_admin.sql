-- 0002_scope_writes_to_admin.sql — OPTIONAL hardening (Phase 5)
--
-- Phase 2's RLS lets ANY authenticated user write. With sign-ups disabled and anonymous
-- sign-in off, that already means "only you". This migration tightens it further so that
-- even if another auth user ever exists, only YOUR account can create/edit/delete recipes
-- and upload images.
--
-- BEFORE RUNNING: replace both occurrences of REPLACE_WITH_YOUR_ADMIN_UID with your user's
-- UID from Supabase → Authentication → Users (the "UID" column). Then paste into the
-- Supabase SQL Editor and Run. Idempotent: it drops and recreates the write policies, so
-- it's safe to re-run. Public read policies are left untouched.
--
-- To revert to "any authenticated user", re-run 0001_init.sql (it recreates the original
-- authenticated-write policies under the same names).

-- Set your admin UID once; every policy below references it.
-- (psql/SQL-Editor variable — expands into the policy bodies as a quoted literal.)
\set admin_uid 'REPLACE_WITH_YOUR_ADMIN_UID'

-- ============================================================================
-- recipes — writes limited to the admin UID
-- ============================================================================

drop policy if exists "Authenticated can insert recipes" on public.recipes;
create policy "Authenticated can insert recipes"
  on public.recipes for insert
  to authenticated
  with check (auth.uid() = :'admin_uid');

drop policy if exists "Authenticated can update recipes" on public.recipes;
create policy "Authenticated can update recipes"
  on public.recipes for update
  to authenticated
  using (auth.uid() = :'admin_uid')
  with check (auth.uid() = :'admin_uid');

drop policy if exists "Authenticated can delete recipes" on public.recipes;
create policy "Authenticated can delete recipes"
  on public.recipes for delete
  to authenticated
  using (auth.uid() = :'admin_uid');

-- ============================================================================
-- recipe_ingredients — same UID scoping
-- ============================================================================

drop policy if exists "Authenticated can insert recipe ingredients" on public.recipe_ingredients;
create policy "Authenticated can insert recipe ingredients"
  on public.recipe_ingredients for insert
  to authenticated
  with check (auth.uid() = :'admin_uid');

drop policy if exists "Authenticated can update recipe ingredients" on public.recipe_ingredients;
create policy "Authenticated can update recipe ingredients"
  on public.recipe_ingredients for update
  to authenticated
  using (auth.uid() = :'admin_uid')
  with check (auth.uid() = :'admin_uid');

drop policy if exists "Authenticated can delete recipe ingredients" on public.recipe_ingredients;
create policy "Authenticated can delete recipe ingredients"
  on public.recipe_ingredients for delete
  to authenticated
  using (auth.uid() = :'admin_uid');

-- ============================================================================
-- storage.objects (recipe-images bucket) — same UID scoping for uploads
-- ============================================================================

drop policy if exists "Authenticated can upload recipe images" on storage.objects;
create policy "Authenticated can upload recipe images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'recipe-images' and auth.uid() = :'admin_uid');

drop policy if exists "Authenticated can update recipe images" on storage.objects;
create policy "Authenticated can update recipe images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'recipe-images' and auth.uid() = :'admin_uid')
  with check (bucket_id = 'recipe-images' and auth.uid() = :'admin_uid');

drop policy if exists "Authenticated can delete recipe images" on storage.objects;
create policy "Authenticated can delete recipe images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'recipe-images' and auth.uid() = :'admin_uid');
