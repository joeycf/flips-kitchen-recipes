# Recipe Website — Build Playbook

> **Status:** Phase 7A complete (polish, SEO & error handling — title template + canonical + default OG, @nuxtjs/sitemap + @nuxtjs/robots wired to NUXT_PUBLIC_SITE_URL, branded error.vue, admin loading skeletons, a11y pass with skip link + landmarks + global focus ring + WCAG-AA contrast fixes, self-hosted fonts via @nuxt/fonts; typecheck/lint/vercel-build all green, sitemap + 404 + robots verified). **Next: Phase 7B — deploy (manual, GitHub + Vercel). Final step; see below.**
> **Last updated:** 2026-07-16 · **Pins:** Node 24+ · Nuxt 4.4.8 · Tailwind 4.3.2 · anime.js 4.5.0 · TypeScript 5.9.3 (do not bump) · +@nuxtjs/sitemap 8 · @nuxtjs/robots 6 · @nuxt/fonts 0.14
>
> **Phase 7B reminder:** set `NUXT_PUBLIC_SITE_URL` in Vercel after the first deploy — canonical, OG image URLs, sitemap `<loc>`s and the robots `Sitemap:` line all read it (they fall back to the request origin until it's set). In dev, `/robots.txt` shows `Disallow: /` on purpose (indexing blocked); check prod output with `/robots.txt?mockProductionEnv=true`.

A personal, searchable, ingredient-filterable recipe site with an admin mode for
entering recipes, photos, and an optional reference YouTube video.

**Confirmed decisions**
- **Backend:** Supabase (Postgres + Storage + Auth)
- **Design vibe:** Warm & rustic — cream, terracotta, serif (Phase 0 complete)
- **Extras:** Cook mode (screen stays awake) + Print-friendly recipe view

**Stack:** Vue 3 + Nuxt 4 (SSR/ISR/SSG → Vercel), Vite, TypeScript, Tailwind CSS v4,
anime.js for motion. Pinia only if genuinely needed (it isn't, for this build).

**Verified stable as of July 2026** (use latest stable; these are known-good baselines):
- Node **24+** (current LTS)
- Nuxt **4.4.8** — Nuxt 4 is the active line; Nuxt 3 gets maintenance only through end of July 2026
- Tailwind CSS **4.3.2** — CSS-first, configured via `@theme` (no `tailwind.config.js`)
- anime.js **4.5.0** — v4 modular API, named ESM exports, no global `anime` object
- TypeScript **~5.9.3** — **pinned, do NOT bump.** The current latest is native TypeScript 7.0,
  which crashes ESLint (`@typescript-eslint` supports only <6.1.0). 5.9.3 is the newest version
  the whole toolchain (ESLint + vue-tsc) supports. A future session may "helpfully" try to
  upgrade this — don't.

---

## Architecture at a glance

- **Public pages** (home, recipe detail) are read-heavy and change rarely, so they use
  Nuxt **ISR** route rules on Vercel: near-static speed, great SEO, and edits go live
  within the revalidation window without a full redeploy.
- **Admin section** lives behind Supabase Auth and renders client-side (talks to Supabase
  directly with your logged-in session). It's never prerendered or public.
- **No Pinia.** `@nuxtjs/supabase` manages auth/session state; search + filter state lives
  on the page and in the URL; `useState` covers anything else shared.

---

## Repository layout

Nuxt 4 keeps app source in an `app/` directory. Key locations:

```
<repo root>
  app/                     # Nuxt source (Nuxt 4 srcDir)
    assets/css/main.css    # @import "tailwindcss"; + @theme design tokens
    pages/                 # file-based routes (public pages + /admin)
    ...
  public/                  # served & deployed AS-IS — do NOT put design files here
  design/                  # Claude Design reference export (committed, inert to Nuxt)
    README.md              # maps each file to its page
  nuxt.config.ts
  package.json             # "engines": { "node": ">=24" }
  .nvmrc                   # contains: 24
```

**The `design/` folder** holds the unzipped Claude Design "Project archive" export (each
page's `.dc.html` plus assets). Keep it committed — it's redesign history, and it's where
Claude Code reads exact colors, fonts, and spacing to fill in the `@theme` block and to
match layouts during the page-building phases. A root `design/` folder is inert to Nuxt
(Nuxt only routes `app/pages` and only serves `public/`), so nothing there ships to
production. Never place it in `public/` (would be publicly reachable) or `app/`.

Exclude it from Tailwind's class scanning so it doesn't pad your stylesheet. In
`app/assets/css/main.css` (path is relative to that file — adjust if it moves; verify the
exclusion syntax against current Tailwind docs):

```css
@import "tailwindcss";
@source not "../../../design";
```

Add a short `design/README.md` mapping each file to its page (e.g. "Home.dc.html → recipe
grid") to help Claude Code navigate.

> Ordering: since the repo is empty, run the Phase 1 scaffold FIRST, then drop `design/` in
> — some scaffolders refuse to run in a non-empty directory. If you stage `design/` first,
> tell Claude Code it already exists so it scaffolds around it.

---

## Data model

Ingredients are stored as **structured rows** (not free text) — that's what makes real
ingredient filtering work. Cuisine is a **dedicated first-class field** (it's the terracotta
FILIPINO/THAI label on every card and the admin autocomplete), kept separate from the
per-card tag pills.

```sql
-- recipes
id           uuid primary key default gen_random_uuid()
slug         text unique not null          -- e.g. "lemon-garlic-pasta"
title        text not null
description  text
cuisine      text                          -- single, first-class, e.g. "Filipino"
hero_image   text                          -- Supabase Storage URL
gallery      text[]                        -- optional extra photos
youtube_url  text                          -- nullable (optional reference video)
prep_minutes int
cook_minutes int
servings     int
difficulty   text                          -- e.g. "Easy" / "Medium" / "Hard"
tags         text[]                        -- per-card pills only, e.g. {chicken, rice, weeknight}
instructions jsonb                         -- ordered [{ text, image? }, ...]
created_at   timestamptz default now()
updated_at   timestamptz default now()

-- recipe_ingredients (one row per ingredient — display AND filtering)
id         uuid primary key default gen_random_uuid()
recipe_id  uuid references recipes(id) on delete cascade
position   int
quantity   numeric        -- nullable (e.g. "to taste")
unit       text           -- nullable (g, cup, tbsp...)
name       text not null  -- display name, e.g. "cherry tomatoes"
name_key   text           -- normalized/lowercased, e.g. "tomato" — for filter facets
```

Indexes: GIN on `recipes.tags`, plain index on `recipe_ingredients.name_key`, index on
`recipes.cuisine`.

`name_key` is the filtering trick: chips list distinct `name_key` values (so "cherry
tomatoes" and "tomatoes" both fold into "tomato"), while `quantity`/`unit`/`name` render the
pretty ingredient line.

Row-Level Security: public can **read**; only the authenticated admin can **write**.

---

## Search & filtering

Done **client-side** (ideal for a personal catalog): load a lightweight index of all recipes
once (title, slug, image, cuisine, tags, ingredient `name_key`s), use **Fuse.js** for fuzzy
search over titles, ingredients, and cuisines, and render the filter chips. Active search +
filters sync to the URL so results are shareable and survive refresh. (If the catalog ever
grows into the many hundreds, migrate search to Postgres full-text or Meilisearch.)

**Decided (Phase 4) — how the top filter chips match.** The curated chips (Chicken, Pork, Beef,
Seafood, Noodles, Rice, Coconut, Vegetarian, Spicy, Quick) stay a fixed list matching the design.
A recipe matches a chip when the chip term (lowercased) is in its `tags` OR its ingredient
`name_key`s — so single-ingredient chips (Chicken/Rice/Coconut) match automatically via
ingredients, while category/attribute chips (Seafood/Noodles/Vegetarian/Spicy/Quick) match via
tags applied in admin. Multiple selected chips combine as match-ANY (OR) by default, behind a
constant so it can be flipped to match-all. ("Quick" optionally = total time ≤ 30 min instead.)

---

## Build phases (run in order)

Phase 0 → **Claude Design** (done). Phases 1–7 → **Claude Code**.

### Phase 0 — Design the screens (COMPLETE)

Warm & rustic look approved: home recipe grid, recipe detail, cook-mode view, print layout,
admin form (with searchable cuisine autocomplete), and empty/loading/no-results states.
Export as **Project archive** and unzip into `design/` (see Repository layout).

### Phase 1 — Scaffold the Nuxt project

```
Create a new Nuxt 4 project (latest, ~4.4.8) with TypeScript, set up for deployment to
Vercel. Pin TypeScript to ~5.9.3 (do NOT use latest — TypeScript 7 breaks @typescript-eslint;
5.9.3 is the newest the toolchain supports). Use Node 24+ — set it in package.json "engines" ("node": ">=24"), a .nvmrc
containing 24, and remind me to set the Node version to 24.x in Vercel's project settings.

Set up Tailwind CSS v4 (latest, ~4.3.2) the v4 way — do NOT create a tailwind.config.js:
- install `tailwindcss` and `@tailwindcss/vite`
- register the plugin in nuxt.config.ts under vite.plugins
- create app/assets/css/main.css with `@import "tailwindcss";` plus a `@theme` block, and
  add that file to the `css` array
- put the warm & rustic design tokens in the @theme block: the cream/off-white and
  terracotta hex values, the serif + sans font families, and the spacing scale — read the
  exact values from the design/ folder (the Claude Design export)
- exclude design/ from Tailwind scanning with `@source not` in main.css

Also add @nuxt/image (latest). Configure route rules: ISR for public pages (/ and
/recipes/**) and a client-rendered /admin section that is not prerendered. Set a recent
compatibilityDate. Add ESLint + Prettier, a clean folder structure, and initialize git.
Do not add Pinia. A design/ folder at the repo root holds the design reference — read it
but never place it in public/ and keep it out of the build.
```

### Phase 2 — Supabase backend (SQL-editor paste route)

**Before running the prompt — set up the Supabase project (manual, in the dashboard):**

1. **Create the project.** New project in Supabase → name `flips-kitchen-recipes`, set a strong
   DB password and **save it to a password manager immediately** (shown only once; needed for
   CLI/direct DB access later). Region: East US (North Virginia / us-east-1) — closest to MD and
   matches Vercel's default. If creation stalls, East US (Ohio) is an equivalent fallback.
   Security options: keep **Enable Data API** on (the client libraries need it), keep **Auto
   expose new tables** on (RLS is the real gate), and **check Enable automatic RLS** (fails
   closed on any new table). Skip the optional GitHub connection for now.
2. **Grab credentials.** From the Connect dialog or Settings → API Keys, copy the Project URL and
   the **publishable** key (`sb_publishable_…`; or the legacy **anon** key if the project only
   shows legacy). Never use the secret / service_role key here — it bypasses RLS and must never
   reach the browser.
3. **Add to `.env`** at the repo root (names must be exactly these — the module reads them):
   ```
   SUPABASE_URL="https://<project-ref>.supabase.co"
   SUPABASE_KEY="<publishable or legacy anon key>"
   ```
   The secret key isn't needed for this build (admin writes go through the logged-in session +
   RLS). Confirm `.env` is gitignored.

Migration path: **SQL-editor paste** — Claude Code writes the migration and hands it to you; it
has no DB access and must not try to run or introspect the live database.

**Phase 2 prompt (Claude Code):**

```
PHASE 2 (SQL-editor paste route) — Supabase wiring + migration

Context: the Supabase project "flips-kitchen-recipes" exists. The repo-root .env has
SUPABASE_URL and SUPABASE_KEY (the publishable key). I will paste the migration into
Supabase's SQL editor myself — you do NOT have CLI or MCP access to the database, so do
not attempt to run migrations, connect to, or introspect the live DB, and make no network
calls to Supabase.

1) Migration SQL. Write one idempotent SQL migration, save it as a committed file at
   supabase/migrations/0001_init.sql, and also print it so I can paste it into the SQL
   editor. It must create:
   - tables `recipes` and `recipe_ingredients` per the playbook schema — note `cuisine` is
     its own column, separate from the `tags` array
   - indexes: GIN on recipes.tags, btree on recipe_ingredients.name_key, btree on recipes.cuisine
   - an updated_at trigger that sets recipes.updated_at = now() on update
   - a public Storage bucket 'recipe-images'
   - RLS enabled on both tables: public read (select) for anon + authenticated; insert/update/
     delete restricted to authenticated. For storage: public read of recipe-images objects,
     and insert/update/delete restricted to authenticated.
   Use `if not exists` / `on conflict do nothing` where sensible so I can safely re-run it.

2) Wire @nuxtjs/supabase. Install it and add it to nuxt.config.ts, reading SUPABASE_URL and
   SUPABASE_KEY from env. Set `redirect: false` for now — we'll add /admin-only auth
   protection in Phase 5 once the login page exists; do NOT gate the whole site now. Add
   SUPABASE_URL and SUPABASE_KEY as empty placeholders to a committed .env.example, and
   confirm .env stays gitignored.

3) Types. Since you can't introspect the live DB, hand-write a `Database` type that exactly
   matches the schema you authored, at app/types/database.types.ts, and point the module's
   `types` option at it. Make these schema-derived types the source of truth and reconcile
   the existing app/types/recipe.ts to match — especially the first-class `cuisine` field and
   the recipe_ingredients row shape (quantity/unit/name/name_key).

4) Verify without a live DB: typecheck and lint pass, the app still builds on the vercel
   preset, and the module loads cleanly given the env vars.

(For my reference only: if I later want auto-generated types instead of hand-written, I can
run `npx supabase gen types typescript --project-id <ref>` with a Supabase access token — no
local linking needed.)
```

**After Claude Code finishes — do these in the dashboard:**

1. **Run the migration.** Open `supabase/migrations/0001_init.sql`, paste into Supabase → SQL
   Editor → Run. Any error → bring it back to fix.
2. **Create your admin user.** Authentication → Users → Add user (your email + password; mark it
   confirmed so login works in Phase 5).
3. **Disable open sign-ups (important).** RLS lets *any* authenticated user write, so the signup
   setting is the real lock. In Authentication settings, turn off "Allow new users to sign up" so
   yours is the only account that can ever exist.

### Phase 3 — Public recipe pages (incl. cook mode + print)

Note: the DB starts empty, so this phase includes a seed file to paste in (like the migration)
so the pages are visually testable before the Phase 5 admin form exists.

```
PHASE 3 — Public pages (list + detail) with cook mode & print

Build the public recipe pages, implementing the layouts in design/ and using the typed
useSupabaseClient() (typed against app/types/database.types.ts). The database has no rows yet,
so also provide a seed (below) so the pages are testable.

Data fetching:
- Fetch server-side with useAsyncData so pages render on the server and are cached by the ISR
  route rules. Use the typed Supabase client.
- Detail page: fetch the recipe AND its ingredients in ONE query via a nested select, e.g.
  .from('recipes').select('*, recipe_ingredients(*)').eq('slug', slug).single(), ordering
  ingredients by `position`.
- Resolve recipes by their `slug` column (clean URLs like /recipes/chicken-adobo). The
  scaffold's placeholder detail route is app/pages/recipes/[id].vue — rename/align it to a slug
  param and query by slug. Return a proper 404 via createError when no recipe matches.

Home (/):
- Fetch the card fields for all recipes (id, slug, title, description, cuisine, hero_image,
  prep_minutes, cook_minutes, difficulty, tags) and render the responsive card grid from the
  design. Build reusable components (e.g. RecipeCard, RecipeGrid) plus a composable for the
  fetch. Handle the empty state (no recipes) with the design's empty state.
- Phase 4 will add search + the ingredient filter here; structure the fetch/list so that's easy
  to extend (it can later also select recipe_ingredients(name_key)).

Recipe detail (/recipes/[slug]):
- Hero image, meta strip (prep/cook time, servings, difficulty, cuisine), ingredients list
  (quantity + unit + name), numbered steps from the instructions JSONB, and — if youtube_url is
  present — an embedded video via lite-youtube-embed. Where hero_image is null, show the design's
  placeholder rather than a broken image.
- SEO: useSeoMeta (title/description/og) + a schema.org/Recipe JSON-LD block for rich results.

Images:
- Use @nuxt/image (<NuxtImg>) for responsive, lazy-loaded images. Configure it for the Supabase
  Storage domain so remote hero images can be optimized — add "<project-ref>.supabase.co" to
  image.domains in nuxt.config. Handle null images with the placeholder.

Cook mode (detail page):
- A "Cook mode" toggle that requests a Screen Wake Lock (navigator.wakeLock.request('screen')) so
  the device won't sleep, and switches to a focused large-text step-by-step view. Re-acquire the
  lock on visibilitychange when the tab regains focus, release it on exit/navigation, and degrade
  gracefully where unsupported (older iOS) by still showing the focused view.

Print (detail page):
- A "Print recipe" button (window.print()) plus an @media print stylesheet that hides nav, search,
  animations, and the video; lays out title, meta, ingredients, and numbered steps cleanly for
  paper; uses page-break-friendly rules; keeps/shrinks the hero sensibly.

Seed for testing:
- Add supabase/seed.sql with 2–3 sample recipes from the design (e.g. Chicken Adobo, Pad Thai),
  each with a few recipe_ingredients and short instructions, so I can paste it into the SQL editor
  and see the pages render. Make it easy to delete later.

Verify: dev server renders the list and a detail page against the seed data; typecheck, lint, and
the vercel-preset build all pass.
```

**After Claude Code finishes:** paste `supabase/seed.sql` into the SQL Editor → Run (same flow as
the migration), then `npm run dev` and open http://localhost:3000 to see the grid; click a card
for the detail page, cook mode, and print. (Production ISR will also need SUPABASE_URL/SUPABASE_KEY
in Vercel's env — handled in Phase 7.)

### Phase 4 — Search & ingredient filtering

```
PHASE 4 — Search & ingredient filtering (client-side)

Add the search box and the curated filter chips to the home page (app/pages/index.vue),
implementing the design's search bar, FILTER chip row, live result count, and "No results" state.
All filtering is client-side over the already-loaded recipe list (small catalog).

Data:
- Extend the useRecipes select (the Phase 3 note marks the spot) to also fetch each recipe's
  ingredient name_keys — recipe_ingredients(name_key) only, kept lightweight. Keep fetching the
  list server-side via useAsyncData so SSR/ISR is preserved and the full set is present on first
  paint.

Search (Fuse.js):
- Fuzzy search over: title (highest weight), cuisine, and ingredient names; tags at lower weight.
  Tune the threshold to be forgiving but not noisy. Build the Fuse index once from the loaded list
  (memoized); search reactively as the query changes.

Filter chips (curated, fixed — match the design):
- Chips: Chicken, Pork, Beef, Seafood, Noodles, Rice, Coconut, Vegetarian, Spicy, Quick. Keep the
  list in one constant so it's easy to edit.
- A recipe matches a chip when the chip term (lowercased) is in its tags OR its ingredient
  name_keys. (Single-ingredient chips match automatically via ingredients; category/attribute
  chips match via tags applied in admin. Optionally treat "Quick" as total time <= 30 min instead;
  default to the tag/ingredient rule.)
- Multiple selected chips combine as match-ANY (OR) by default. Put the combine mode behind a
  constant so it can be flipped to match-all later; don't add an any/all toggle control unless it
  fits the design's chip row cleanly.
- Chips are accessible toggle buttons (aria-pressed), keyboard-operable; the row scrolls/wraps on
  mobile per the design.

Combine + results:
- Visible results = recipes matching the search text (if any) AND the selected chips (if any).
  Empty search + no chips = all recipes.
- Update the result count to the filtered count ("N recipes"). When recipes exist but none match,
  show the design's "No results" state with a "Clear filters" action (distinct from the empty-DB
  EmptyState). Reset returns to the full list.

URL sync (shareable + survives refresh):
- Reflect the search text and selected chips in the URL query (e.g. ?q=&tags=). Read initial state
  from the query on load; update with router.replace (not push, no history spam); debounce the
  search input (~250ms). Ensure server and client derive the same filtered set from the same list +
  query (no hydration mismatch).

Structure the search/filter logic as a composable (e.g. useRecipeSearch) rather than stuffing it
into the page. Keep the page's existing hero, grid, and empty state.

Verify: typecheck, lint, and the vercel-preset build pass; with the seed data, searching
"adobo"/"thai" narrows correctly, the Chicken chip matches while Beef shows the No-results state,
chips + search combine, the URL updates, a pasted filtered URL restores the same view, and there
are no hydration warnings.
```

### Phase 5 — Admin mode (auth + CRUD + uploads)

```
PHASE 5 — Admin mode: login, protected /admin, create/edit form, image upload, CRUD

First phase with write access: you log in as the admin user (from Phase 2) and create/edit/delete
recipes through the UI. Implement the admin layouts from design/.

AUTH & PROTECTION
- Keep @nuxtjs/supabase redirect:false (public site stays ungated). Protect ONLY /admin: add a
  route middleware (or an admin layout with middleware) that checks useSupabaseUser() and
  redirects unauthenticated users to /login, preserving the intended destination to return to
  after login.
- /login page: email + password via supabase.auth.signInWithPassword; clear error on bad
  credentials; on success go to the intended /admin page.
- Logout control in the admin UI (supabase.auth.signOut → redirect home).
- Security note: RLS allows writes for ANY authenticated user; disabled sign-ups + anonymous-off
  are what limit that to you. OPTIONAL hardening: scope write policies to your admin UID
  (auth.uid() = '<uid>') via a follow-up migration (get the UID from Authentication → Users).

ADMIN LIST (/admin)
- List existing recipes (title, cuisine, updated date) with Edit + Delete, plus a "New recipe"
  button (matches the design header). Delete confirms first; the FK is ON DELETE CASCADE so
  ingredients go automatically. Optionally also delete that recipe's Storage images to avoid orphans.

CREATE / EDIT FORM (matches design/ admin form)
- Fields: title, description, cuisine (searchable autocomplete over ~50 world cuisines, current
  pick check-marked, custom entries allowed → writes the cuisine column), tags input, YouTube URL,
  prep/cook minutes, servings, difficulty.
- Ingredients: dynamic, reorderable rows (quantity / unit / name). Derive name_key from name
  (lowercase + trim) on save; allow manual edit if wanted. Keep position.
- Steps: reorderable ordered text steps (instructions JSONB). Per-step image optional (schema
  supports { text, image? }) — do text + reordering now; add per-step image only if straightforward.
- Tags UX: make it easy to apply the curated chip terms (vegetarian, spicy, quick, seafood,
  noodles) as quick-add suggestions, so those filter chips light up.
- Slug: auto-generate from title (lowercase, hyphenate, strip punctuation) with uniqueness handling
  (suffix on collision). On EDIT, keep the existing slug stable by default (changing it breaks links).

IMAGES (Supabase Storage: recipe-images)
- Hero + gallery upload via supabase.storage.from('recipe-images').upload(...), unique object paths
  (e.g. `${slug}/${uuid}-${filename}`), then store the getPublicUrl result in hero_image / gallery.
  Preview before and after upload. Optionally downscale/compress large images client-side first.
  (@nuxt/image is already configured for the Supabase domain from Phase 3.)

PERSISTENCE (CRUD)
- Create: insert recipe row, then insert recipe_ingredients (position + name_key).
- Edit: load recipe + ingredients into the form; on save, update the recipe row and reconcile
  ingredients by deleting existing rows and re-inserting from the form (simplest correct approach
  for small counts).
- Delete: delete recipe (ingredients cascade), confirm first.
- Show errors visibly; validate required fields (at least title).

CHIP-MATCH REFINEMENT (so real data filters well)
- Refine the useRecipeSearch chip predicate so a chip matches when its term appears as a WORD
  within any ingredient name (not only as an exact name_key), so "Chicken" catches "chicken thighs".
  Keep the tags-or-ingredients union and the OR/AND combine constant.

FRESHNESS
- Public pages are ISR-cached, so admin edits appear after the revalidation window. Document the
  TTL. On-demand revalidation is an optional later upgrade.

VERIFY: typecheck, lint, vercel-preset build pass. Then (with your real Supabase project): admin
login works and bad credentials error; /admin redirects to /login when logged out; creating a
recipe with an uploaded image makes it appear on the public grid + detail page; editing updates it;
deleting removes it; and the refined chips match real multi-word ingredients.
```

**After Phase 5:** the seed is no longer needed — you enter real recipes through the form. Consider
deleting the seed rows (the delete snippet in supabase/seed.sql) once you have your own.

### Phase 6 — Animations with anime.js

```
PHASE 6 — anime.js motion layer (polish on a working app)

Add anime.js v4 (latest, ~4.5.0) for tasteful motion. The app is fully built, so this is
enhancement only — nothing here should change behavior or block content.

What to animate:
- Staggered entrance of recipe cards on the home grid (fade + slight rise), on INITIAL load only.
- A subtle reveal on the recipe detail page (hero, then meta/ingredients/steps easing in).
- Small micro-interactions where they add something (chip toggle, primary buttons).

Critical interaction with existing features:
- The home grid is filtered client-side (Phase 4). Do NOT re-run the full staggered entrance on
  every keystroke/chip toggle — it's jarring. Stagger only on first load; when the filtered set
  changes, keep it instant or a quick subtle fade, not a re-stagger.
- Cards are server-rendered (ISR). Entrance animation must be progressive enhancement: content
  stays visible if JS doesn't run, and there must be NO flash where SSR'd cards appear then hide
  then re-animate on hydration. Apply the hidden start-state only on the client, before paint.
- Print already hides animations (Phase 3); ensure motion doesn't run in print or fight the
  full-screen cook-mode overlay.

How:
- v4 API: no global `anime` — named ESM imports (import { animate, stagger } from 'animejs',
  subpaths like animejs/utils where useful), animate(targets, params), v4 param names (`ease` not
  `easing`, `to` not `value`). Animate transforms + opacity only; short durations (~200–400ms),
  small stagger (~30–50ms).
- Run client-side only (onMounted / client plugin / <ClientOnly>). Put reusable entrance logic in a
  small composable.
- Respect prefers-reduced-motion: skip entrances/transitions entirely (or reduce to a plain fade)
  when the user prefers reduced motion.
- For list↔detail route changes, use Nuxt's built-in page transition (a subtle fade/slide) rather
  than hand-driving route transitions with anime.js; keep anime.js for in-page choreography so the
  two systems don't double-animate. (anime.js-driven page transitions are an optional later upgrade.)
- Taste: use anime.js where it adds real choreography (staggers, sequenced reveals); leave simple
  hover/press states to CSS. Don't over-animate — restraint reads as premium.

Verify: typecheck, lint, vercel-preset build pass; cards stagger in once on load and do NOT
re-stagger while searching/filtering; no flash-of-hidden content on hydration; reduced-motion
disables it; print and cook mode unaffected.
```

### Phase 7 — Polish, SEO & deploy (final)

Two halves: **7A** = last code polish (Claude Code). **7B** = deploy (manual, in GitHub + Vercel).

**Phase 7A prompt (Claude Code):**

```
PHASE 7A — Polish, SEO & error handling

Final code polish before deploy. The app works; this hardens and finishes it.

SEO & metadata:
- Site-wide defaults: a title template ("<page> · Flip's Kitchen"), default description, default OG
  image, html lang="en", theme-color, canonical URLs. Per-recipe pages already have useSeoMeta +
  schema.org/Recipe (Phase 3) — set each recipe's og:image to its hero_image (fall back to the
  default OG image when null).
- Sitemap: add @nuxtjs/sitemap and generate sitemap.xml including the dynamic recipe routes (pull
  the slugs from Supabase in a sitemap source). Add robots.txt allowing indexing and pointing to the
  sitemap. Both need the production site URL — read it from runtime config (NUXT_PUBLIC_SITE_URL) so
  it's correct in production.
- Favicon is set; add apple-touch-icon + theme-color. (Web manifest optional.)

Error, loading & empty states:
- A branded error.vue (Nuxt error page) for 404 + 500, on-brand, with a link home; the detail page's
  createError(404) should render through it nicely.
- Loading skeletons where data is fetched client-side (the /admin list, and the edit form while it
  loads a recipe). Confirm the existing empty + no-results states still look right.

Accessibility pass:
- alt text on all images (recipe hero alt = title). Labels on every admin form field. Visible focus
  states throughout; keyboard operability (chips, cook mode already). Landmark regions
  (header/nav/main) + a skip-to-content link. Check text contrast against the cream/clay palette meets
  WCAG AA and fix any shortfalls. Reduced-motion already handled.

Optional upgrade (removes layout shift + an external request):
- Replace the Google Fonts <link> with @nuxt/fonts to self-host Spectral / Work Sans / JetBrains Mono.
  Nice-to-have; skip if it risks the look.

Verify: typecheck, lint, vercel-preset build pass; sitemap.xml lists all recipe slugs; error.vue
renders for a bad URL; a keyboard-only pass reaches every control with visible focus; contrast passes.
```

**Phase 7B — deploy (manual; drive it yourself, ask for per-screen detail when needed):**

1. Push to GitHub. Create a new empty GitHub repo (no README). Push local `main` to it (Claude Code
   can run `git remote add` + `git push` if git is signed in, else use your terminal). Confirm `.env`
   did NOT get pushed.
2. Import to Vercel. Add New → Project → import the repo. Vercel auto-detects Nuxt — don't override
   build settings.
3. Node 24.x. Vercel → Settings → General → Node.js Version → 24.x (matches .nvmrc/engines).
4. Env vars (ESSENTIAL). Vercel → Settings → Environment Variables → add SUPABASE_URL and SUPABASE_KEY
   (same publishable key as .env), for Production + Preview. Without these the live site can't load
   recipes.
5. Site URL. After first deploy, set NUXT_PUBLIC_SITE_URL to the live URL so canonical/sitemap/OG use
   absolute production URLs; redeploy.
6. Point Supabase at production. Supabase → Authentication → URL Configuration → set Site URL to the
   production URL.
7. Custom domain (optional). Vercel → Domains → add it, follow DNS steps.

**Pre-launch security check (site is public now):**
- Supabase → Authentication: sign-ups OFF and anonymous sign-ins OFF (limits write access to you).
- Only SUPABASE_URL + the publishable SUPABASE_KEY in env — never the secret/service_role key.
- RLS on (it is). Optional: apply the 0002 admin-UID write-scoping migration for defense in depth.
- .env not in the repo.

**Verify live:**
- Home + a detail page render your recipes + images (env vars working).
- Log in on the live /login; /admin works and redirects to /login when logged out; admin not publicly
  reachable.
- After an edit, wait past the 60s ISR window → change appears.
- sitemap.xml and a social link preview look right.

---

## Tips while building

- **Run phases in order** and verify each before moving on — especially Phase 2 (backend)
  before any page work.
- **Node 24** must agree in three places: package.json "engines", .nvmrc, and Vercel's Node
  setting. At deploy time, confirm Vercel's build actually lists 24.x.
- **Environment variables:** the Supabase URL + anon key go in a local `.env` for dev and into
  Vercel project settings for production. Never commit `.env`.
- **design/ folder:** committed reference, read by Claude Code for tokens + layout, excluded
  from the build, never in public/.
- **A few small choices** are best settled at the relevant step against current docs: the
  @nuxt/image optimization provider (Vercel vs ipx), the exact `@source` exclusion syntax, and
  whether admin login is password vs magic link.
- **Cook mode caveat:** Wake Lock needs HTTPS (Vercel provides it) and support varies on older
  iOS — the focused view should still work without the lock as a fallback.
- **Versions drift:** the pins above are known-good July 2026 baselines. Have Claude Code
  install the latest stable of each and check official docs if a setup step differs.