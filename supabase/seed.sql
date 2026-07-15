-- ============================================================================
-- seed.sql — sample recipes for local / preview testing (Phase 3)
--
-- Paste into Supabase → SQL Editor → Run. Safe to re-run: it re-seeds cleanly by
-- deleting the three sample slugs first. Hero images are intentionally null so the
-- <RecipePlaceholder> renders; add Storage URLs later to test @nuxt/image.
--
-- To remove all seed data:
--   delete from public.recipes
--   where slug in ('chicken-adobo', 'pad-thai', 'chicken-katsu-curry');
--   -- recipe_ingredients rows cascade-delete via the FK.
-- ============================================================================

begin;

-- Clean re-seed (recipe_ingredients cascade with the parent rows).
delete from public.recipes
where slug in ('chicken-adobo', 'pad-thai', 'chicken-katsu-curry');

-- Insert the recipes, then fan out their ingredients by joining on slug to the
-- freshly-generated ids.
with inserted as (
  insert into public.recipes
    (slug, title, description, cuisine, hero_image, youtube_url,
     prep_minutes, cook_minutes, servings, difficulty, tags, instructions)
  values
    (
      'chicken-adobo',
      'Chicken Adobo',
      'The everyday classic — chicken braised low and slow in soy, vinegar, garlic and bay until glossy and deeply savory.',
      'Filipino',
      null,
      -- Sample video (Big Buck Bunny, Creative Commons) so the embed is testable.
      -- Replace with a real cooking video.
      'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      15, 45, 4, 'Easy',
      array['Chicken', 'Rice', 'Weeknight'],
      '[
        {"text": "Marinate the chicken in soy sauce and crushed garlic for at least 30 minutes."},
        {"text": "Sear the chicken skin-side down until deeply browned, then set aside."},
        {"text": "Add the marinade, water, bay leaves and peppercorns. Boil, then simmer covered for 25 minutes."},
        {"text": "Pour in the vinegar and do not stir; let it boil 2 minutes to mellow the sharpness."},
        {"text": "Stir in the brown sugar and reduce uncovered until the sauce turns glossy."},
        {"text": "Rest 5 minutes and serve over hot steamed rice."}
      ]'::jsonb
    ),
    (
      'pad-thai',
      'Pad Thai',
      'Springy rice noodles wok-tossed with shrimp, egg and a sweet-sour-salty tamarind sauce, showered with peanuts.',
      'Thai',
      null,
      null,
      25, 15, 4, 'Medium',
      array['Noodles', 'Seafood', 'Spicy', 'Quick'],
      '[
        {"text": "Soak the rice noodles in warm water until pliable, then drain."},
        {"text": "Whisk tamarind, fish sauce and palm sugar into a sauce."},
        {"text": "Stir-fry the shrimp in a hot wok, push aside, and scramble the eggs."},
        {"text": "Add the noodles and sauce, tossing until glossy and tender."},
        {"text": "Fold in bean sprouts, top with peanuts and lime, and serve at once."}
      ]'::jsonb
    ),
    (
      'chicken-katsu-curry',
      'Chicken Katsu Curry',
      'Crunchy panko cutlets over rice, blanketed in a mellow, faintly sweet Japanese curry sauce.',
      'Japanese',
      null,
      null,
      25, 35, 4, 'Medium',
      array['Chicken', 'Rice', 'Comfort'],
      '[
        {"text": "Simmer onion, carrot and potato until soft, then melt in the curry roux."},
        {"text": "Pound the chicken to an even thickness and season."},
        {"text": "Dredge each cutlet in flour, egg, then panko."},
        {"text": "Fry until deep golden and cooked through, then rest and slice."},
        {"text": "Serve the sliced katsu over rice with the curry sauce alongside."}
      ]'::jsonb
    )
  returning id, slug
)
insert into public.recipe_ingredients
  (recipe_id, position, quantity, unit, name, name_key)
select ins.id, v.position, v.quantity, v.unit, v.name, v.name_key
from inserted ins
join (
  values
    -- Chicken Adobo
    ('chicken-adobo', 1, 900,   'g',     'chicken thighs, bone-in',        'chicken'),
    ('chicken-adobo', 2, 0.5,   'cup',   'soy sauce',                      'soy sauce'),
    ('chicken-adobo', 3, 0.333, 'cup',   'cane or white vinegar',          'vinegar'),
    ('chicken-adobo', 4, 1,     'whole', 'garlic head, crushed',           'garlic'),
    ('chicken-adobo', 5, 3,     'pcs',   'dried bay leaves',               'bay leaf'),
    ('chicken-adobo', 6, 1,     'tsp',   'whole black peppercorns',        'black pepper'),
    ('chicken-adobo', 7, 1,     'cup',   'water',                          'water'),
    ('chicken-adobo', 8, 1,     'tbsp',  'brown sugar',                    'sugar'),
    -- Pad Thai
    ('pad-thai', 1, 250,   'g',    'flat rice noodles',       'rice noodles'),
    ('pad-thai', 2, 300,   'g',    'shrimp, peeled',          'shrimp'),
    ('pad-thai', 3, 2,     'pcs',  'eggs',                    'egg'),
    ('pad-thai', 4, 3,     'tbsp', 'tamarind paste',          'tamarind'),
    ('pad-thai', 5, 2,     'tbsp', 'fish sauce',              'fish sauce'),
    ('pad-thai', 6, 2,     'tbsp', 'palm sugar',              'sugar'),
    ('pad-thai', 7, 1,     'cup',  'bean sprouts',            'bean sprouts'),
    ('pad-thai', 8, 0.333, 'cup',  'roasted peanuts, crushed', 'peanuts'),
    -- Chicken Katsu Curry
    ('chicken-katsu-curry', 1, 4, 'pcs',  'chicken breasts',        'chicken'),
    ('chicken-katsu-curry', 2, 2, 'cups', 'panko breadcrumbs',      'panko'),
    ('chicken-katsu-curry', 3, 2, 'pcs',  'eggs, beaten',           'egg'),
    ('chicken-katsu-curry', 4, 1, 'box',  'Japanese curry roux',    'curry roux'),
    ('chicken-katsu-curry', 5, 1, 'pc',   'onion, sliced',          'onion'),
    ('chicken-katsu-curry', 6, 2, 'pcs',  'carrots, chopped',       'carrot'),
    ('chicken-katsu-curry', 7, 2, 'pcs',  'potatoes, cubed',        'potato'),
    ('chicken-katsu-curry', 8, 4, 'cups', 'steamed rice, to serve', 'rice')
) as v(slug, position, quantity, unit, name, name_key)
  on v.slug = ins.slug;

commit;
