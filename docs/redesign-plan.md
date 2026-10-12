# Redesign v56: Netlify HTML → Astro

Source of truth: `/Users/jackmcpickle/Downloads/pelican-netlify-v56-40` (static
HTML + one 156 KB `style.css`). Treat it as read-only. Match the overall theme,
not pixel-for-pixel. Serve it locally to compare:

```sh
python3 -m http.server 8090 --directory /Users/jackmcpickle/Downloads/pelican-netlify-v56-40
```

The old Astro styling, components, modules, pages and content were deleted on
this branch. Images, the prospectus PDF and robots.txt are already copied into
`public/` with the same paths the HTML uses (`/images/stage/x.webp`,
`/downloads/pelican-pro-2027-prospectus.pdf`).

## Conventions

- Astro 7, Tailwind v4 via `@tailwindcss/vite`, `output: 'server'` on the
  Cloudflare adapter. Pages are prerendered (`export const prerender = true` is
  the default for static pages; API routes use `prerender = false`).
- `@/` alias → `src/`. Prettier (4 spaces, single quotes); run `pnpm fmt`.
- Tokens live in `src/styles/global.css` `@theme`. Use Tailwind utilities in
  components; keep bespoke CSS (curtains, squiggles, marquee keyframes) small
  and scoped in the component's `<style>`.
- Shared primitives in `src/components/ui/`, site chrome in
  `src/components/layout/`. Page-specific sections in
  `src/modules/{feature}/components/` with an `index.ts` barrel.
- Inline `<script>` behaviour from the HTML (menu, dropdowns, finder, quote
  rotator, lightbox) becomes Astro `<script>` blocks in the owning component.
- Netlify forms → Cloudflare Email (`send_email` binding `EMAIL`, sender/
  recipient in wrangler `vars`). Contact form (fields: topic, name, email,
  message) posts to `/api/contact`; newsletter (email, optional name) to
  `/api/newsletter`. Both honour the `bot` honeypot and 303 to `/thanks/`.

## Stage 1a: Theme (shared UI)

Extract the _final_ cascade from `style.css` (later `:root` blocks override
earlier ones; check computed styles in a browser rather than reading the file
top-down). Fonts: Inter (body), Caveat Brush / Caveat (script accents), Space
Mono (kickers/labels). Palette ends up navy `#070a1f`, pink `#ff4d6d`, cobalt
`#2f6bf2`, light blue `#5bd8fd`, lavender `#c7c9f2`, ink `#12163a`.

Deliverables:

- `src/styles/global.css`: tokens, base typography, `mark` highlight, focus
  rings, reduced-motion handling.
- `src/layouts/BaseLayout.astro`: meta, canonical, OG/Twitter, JSON-LD
  (EntertainmentBusiness), fonts, skip link, header, nav, footer, newsletter
  band (opt-out prop).
- `src/data/site.ts`: name, URL, email, phone, address, enrol URL, socials, nav
  tree (Home; Classes; Camps & Trips; Shows; Sing!OZ; Hire; About).
- Layout: `SiteHeader`, `SiteNav` (dropdowns + mobile toggle), `SiteFooter`,
  `NewsletterSignup` (the "Don't miss a beat" `.news` section).
- UI: `Button` (primary/ghost/light), `Wrap`, `Section` (tones: default, sky,
  paper, navy), `PageHero` (sub hero with the flight squiggle SVG), `Band`
  (full-bleed image), `Marquee`/`Ticker`, `Facts` (dl), `Kicker`, `CtaRow`,
  `Gallery`, `QuoteRotator`, `Card`.
- `/` temporary demo page rendering every primitive (replaced in Stage 2).

## Stage 1b: Content collections

`src/content.config.ts` with these collections (Zod schemas, `reference()`
where entries point at each other). Content extracted from the HTML verbatim
(fix only obvious HTML entities).

| Collection      | Format | Entries                                                                                                      | Feeds                                     |
| --------------- | ------ | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| `pages`         | md     | one per route: home, about, programs, pelican-pro, professional, musicals, camps, camp-photos, trips, sing-oz, hire, contact, thanks, 404 | SEO title/description, hero, page copy    |
| `offerings`     | yaml   | every enrollable thing: MT Foundations, MT Academy, Acting Jr/Sr, Dance Jr/Sr, Singing, Spotlight, MTC, Cert IV, Diploma, Junior/Senior Musical, Sing!OZ | class finder, comparison table, cards     |
| `programs`      | md     | musical-theatre, acting, dance, singing-lessons                                                              | `/programs/[slug]/`                       |
| `people`        | md     | singing teachers (5), directors (Jen, Kylie…), Pro faculty                                                   | about bios, teacher pages                 |
| `productions`   | yaml   | past + upcoming shows                                                                                        | musicals marquee, past grid, coming soon  |
| `camps`         | md     | music-theatre-camp, spotlight                                                                                | camps page, finder                        |
| `trips`         | md     | upcoming tour + past trips (West End, JTF…)                                                                  | trips page                                |
| `hire`          | md     | studio-hire, set-and-costume-hire                                                                            | `/hire/`, `/hire/[slug]/`                 |
| `testimonials`  | yaml   | all quotes, tagged by page                                                                                   | quote rotators                            |
| `keyDates`      | yaml   | home "Key dates"                                                                                             | home, camps                               |
| `announcements` | yaml   | ticker items                                                                                                 | home ticker                               |
| `faqs`          | yaml   | parent FAQ and any others, tagged by topic                                                                   | programs, hire, pro                       |
| `galleries`     | yaml   | named image sets (stage, camp-photos, nest, hire, rehearsal, pro, sing-oz, more)                             | galleries, bands                          |

Images stay in `public/images` and are referenced by path string.

## Stage 2: Pages

Scaffold first (every route renders BaseLayout + PageHero + placeholder
sections reading from collections), then build out in parallel groups:

| Group | Routes                                                                                      | Module(s)                         |
| ----- | ------------------------------------------------------------------------------------------- | --------------------------------- |
| A     | `/`, `/about/`, `/contact/`, `/thanks/`, `404`, `/api/contact`, `/api/newsletter`           | home, about, contact              |
| B     | `/programs/`, `/programs/[slug]/`, `/programs/singing-lessons/[teacher]/`, `/pelican-pro/` | programs, pelican-pro             |
| C     | `/camps/`, `/camps/photos/`, `/trips/`, `/musicals/`, `/professional/`                      | camps, trips, musicals, professional |
| D     | `/sing-oz/`, `/hire/`, `/hire/[slug]/`                                                      | sing-oz, hire                     |

Redirects (astro.config): old Weebly/old-Astro URLs → new routes, e.g.
`/cert4` → `/pelican-pro/`, `/the-nest` → `/programs/`, `/summer-camps` and
`/music-theatre-camp` → `/camps/`, `/singoz` → `/sing-oz/`,
`/set-and-costume-hire` → `/hire/set-and-costume-hire/`, `/blog/*`,
`/the-team`, `/about-us` → `/about/`, `/musicals/*` → `/musicals/#past`,
`/find-my-class` → `/programs/#finder`, `/whats-on`, `/faq` → `/`.

## Stage 3: Review

- Side-by-side screenshots (desktop 1280, mobile 390) of every route vs the
  HTML site; list theme drift, missing sections, missing copy.
- Links: every internal href resolves; redirects work.
- `pnpm check && pnpm lint && pnpm build` green; per-page SEO checklist.
- Remove unused assets.
