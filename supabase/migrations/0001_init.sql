-- 0001_init.sql — Flip's Kitchen Recipes: initial schema
--
-- Idempotent: safe to paste into Supabase → SQL Editor → Run more than once.
-- Mirrors app/types/database.types.ts exactly (the hand-written Database type).
--
-- Creates: recipes + recipe_ingredients tables, their indexes, an updated_at
-- trigger, a public `recipe-images` Storage bucket, and RLS policies
-- (public read; writes restricted to authenticated).

-- gen_random_uuid() is built into Postgres 13+, but ensure pgcrypto for safety.
create extension if not exists pgcrypto;

-- ============================================================================
-- Tables
-- ============================================================================

create table if not exists public.recipes (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,          -- e.g. "lemon-garlic-pasta"
  title         text not null,
  description   text,
  cuisine       text,                           -- single, first-class (e.g. "Filipino")
  hero_image    text,                           -- Supabase Storage URL
  gallery       text[] not null default '{}',   -- optional extra photos
  youtube_url   text,                           -- optional reference video
  prep_minutes  integer,
  cook_minutes  integer,
  servings      integer,
  difficulty    text,                           -- e.g. "Easy" / "Medium" / "Hard"
  tags          text[] not null default '{}',   -- per-card pills only (e.g. {chicken, rice})
  instructions  jsonb not null default '[]'::jsonb, -- ordered [{ text, image? }, ...]
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.recipe_ingredients (
  id         uuid primary key default gen_random_uuid(),
  recipe_id  uuid not null references public.recipes (id) on delete cascade,
  position   integer,        -- display order
  quantity   numeric,        -- nullable (e.g. "to taste")
  unit       text,           -- nullable (g, cup, tbsp, ...)
  name       text not null,  -- display name, e.g. "cherry tomatoes"
  name_key   text            -- normalized/lowercased, e.g. "tomato" — for filter facets
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- GIN for `tags && '{...}'` / `tags @> '{...}'` filter queries.
create index if not exists recipes_tags_gin on public.recipes using gin (tags);
-- btree for cuisine facet lookups.
create index if not exists recipes_cuisine_idx on public.recipes (cuisine);
-- btree for the ingredient filter facets (distinct name_key values).
create index if not exists recipe_ingredients_name_key_idx on public.recipe_ingredients (name_key);
-- btree on the FK — Postgres does not index FKs automatically, and the detail
-- page always loads ingredients by recipe_id.
create index if not exists recipe_ingredients_recipe_id_idx on public.recipe_ingredients (recipe_id);

-- ============================================================================
-- updated_at trigger
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists recipes_set_updated_at on public.recipes;
create trigger recipes_set_updated_at
  before update on public.recipes
  for each row
  execute function public.set_updated_at();

-- ============================================================================
-- Storage bucket (public read; uploads gated by the policies below)
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

-- ============================================================================
-- Row-Level Security
-- ============================================================================

alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;

-- recipes: public read, authenticated write. (drop-then-create = idempotent;
-- Postgres has no `create policy if not exists`.)
drop policy if exists "Recipes are readable by everyone" on public.recipes;
create policy "Recipes are readable by everyone"
  on public.recipes for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated can insert recipes" on public.recipes;
create policy "Authenticated can insert recipes"
  on public.recipes for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update recipes" on public.recipes;
create policy "Authenticated can update recipes"
  on public.recipes for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete recipes" on public.recipes;
create policy "Authenticated can delete recipes"
  on public.recipes for delete
  to authenticated
  using (true);

-- recipe_ingredients: same public-read / authenticated-write shape.
drop policy if exists "Recipe ingredients are readable by everyone" on public.recipe_ingredients;
create policy "Recipe ingredients are readable by everyone"
  on public.recipe_ingredients for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated can insert recipe ingredients" on public.recipe_ingredients;
create policy "Authenticated can insert recipe ingredients"
  on public.recipe_ingredients for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update recipe ingredients" on public.recipe_ingredients;
create policy "Authenticated can update recipe ingredients"
  on public.recipe_ingredients for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete recipe ingredients" on public.recipe_ingredients;
create policy "Authenticated can delete recipe ingredients"
  on public.recipe_ingredients for delete
  to authenticated
  using (true);

-- ============================================================================
-- Storage RLS (storage.objects already has RLS enabled by Supabase).
-- Scope every policy to the recipe-images bucket.
-- ============================================================================

drop policy if exists "Recipe images are publicly readable" on storage.objects;
create policy "Recipe images are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'recipe-images');

drop policy if exists "Authenticated can upload recipe images" on storage.objects;
create policy "Authenticated can upload recipe images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'recipe-images');

drop policy if exists "Authenticated can update recipe images" on storage.objects;
create policy "Authenticated can update recipe images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'recipe-images')
  with check (bucket_id = 'recipe-images');

drop policy if exists "Authenticated can delete recipe images" on storage.objects;
create policy "Authenticated can delete recipe images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'recipe-images');
