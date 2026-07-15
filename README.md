# Flip's Kitchen — Recipes

A warm, rustic family-recipe site. Built with **Nuxt 4**, **Tailwind CSS v4** (CSS-first,
no config file), **TypeScript**, and **@nuxt/image**, and deployed on **Vercel**.

## Requirements

- **Node.js 24+** — pinned in [`.nvmrc`](./.nvmrc) and `package.json` `engines`.

```bash
nvm use            # switch to Node 24
npm install
npm run dev        # http://localhost:3000
```

## Scripts

| Script                      | Description                  |
| --------------------------- | ---------------------------- |
| `npm run dev`               | Start the dev server         |
| `npm run build`             | Production build             |
| `npm run preview`           | Preview the production build |
| `npm run generate`          | Static site generation       |
| `npm run lint` / `:fix`     | ESLint (flat config)         |
| `npm run format` / `:check` | Prettier                     |
| `npm run typecheck`         | Type-check with `vue-tsc`    |

## Rendering strategy

Configured in [`nuxt.config.ts`](./nuxt.config.ts) → `routeRules`:

| Route         | Strategy                                            |
| ------------- | --------------------------------------------------- |
| `/`           | ISR (public)                                        |
| `/recipes/**` | ISR (public)                                        |
| `/admin/**`   | Client-rendered SPA (`ssr: false`), not prerendered |

## Design tokens

The warm/rustic tokens — cream `#FAF4EA`, paper `#FFFDF9`, terracotta/clay `#BC5A39`,
Spectral + Work Sans + JetBrains Mono, layout widths, radii and shadows — live in the
Tailwind v4 `@theme` block in [`app/assets/css/main.css`](./app/assets/css/main.css).
Values were read from the Claude Design export in **`design/`**.

`design/` is **reference only**: it is excluded from Tailwind scanning (`@source not` in
`main.css`), never placed in `public/`, and excluded from the deploy (`.vercelignore`).

## Deploying to Vercel

Vercel auto-detects Nuxt (zero-config) — import the repo and deploy. ISR route rules map
to Vercel ISR automatically.

> [!IMPORTANT]
> **Set the Node.js version to `24.x`** in Vercel → **Project Settings → General →
> Node.js Version.** `package.json` `engines.node` is `>=24`, but confirm the dashboard
> setting so the build and serverless functions run on Node 24.
