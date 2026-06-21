# Changelog — Mossven

> **Read this file first.** Any agent or person working in this repo should read this
> changelog before making changes, and append an entry after making changes.
> It is the running log of what happened, what changed, and what files were touched.
>
> **How to write an entry** (newest at the top of the list, under the date):
> - Date the work (`## YYYY-MM-DD`).
> - One short line on the *why/what*.
> - A `Touched:` line listing the files changed/created.
> - Note anything non-obvious: decisions, things skipped, follow-ups, gotchas.
> - Keep it factual and brief. This is a log, not documentation.

---

## 2026-06-21

### Showcase: mark Mlžný Dvůr card as "Připravuje se" (full-image overlay)
Per request, the Penzion Mlžný Dvůr hub card now reads as upcoming instead of live: added
`soon: true` to its `multi` entry so it renders through the non-clickable coming-soon branch,
with a **full-cover overlay** across the whole preview (diagonal-hatch + dark scrim + brass-bordered
"Připravuje se" chip, `.ux-soonover` / `.ux-prev--over`) rather than the small corner badge. Added a
bilingual key `demos.soon3` ("Připravuje se" / "In preparation") so the i18n pass shows the exact
wording (reusing `demos.soon2` would have overwritten it with "Brzy k dispozici"). The demo pages
themselves are untouched and still reachable directly at `/ukazky/penzion`.

**Touched:** `src/components/Showcase.astro`, `src/i18n/translations.ts`

**Note:** Showcase validated via `@astrojs/compiler` `transform()` — 0 errors. To make the card live
again later: remove `soon: true` from its entry.

### Added Penzion Mlžný Dvůr — multipage forest-retreat demo (`/ukazky/penzion`)
New 6-page hospitality demo (3rd multipage demo), with a deliberately distinct identity from
Studio Luma (warm pastel salon) and Ateliér Hrot (cold gothic tattoo): a dark, misty, slow
quiet-luxury forest estate on the Šumava. All classes prefixed `mlz-`; own `_layout/`, not the
Mossven Layout.

- **Identity:** dark-led pine/brass/linen palette (deep pine `#0E1512`, aged brass `#B0894A`,
  warm linen `#E2D7C0`, muted moss, dark wine accent). Type trio not reused elsewhere:
  **Cormorant Garamond** (cinematic display serif), **Hanken Grotesk** (calm body),
  **Martian Mono** (ledger/utility: prices, coordinates, room codes). Small radii (stone/wood),
  page-wide film-grain/mist overlay, slow contour drift, IntersectionObserver reveals,
  scroll-aware header, mobile menu, reduced-motion guards.
- **Signature motif (mist map + key ledger):** `_layout/Vrstevnice.astro` = drifting SVG
  topographic contour lines (hero/divider/frame/panel variants) threaded through the site;
  rooms carry brass **key tags (No. I–IV)**, coordinates, and guest-book "estate record" rows
  with dotted leaders. This is the memorable through-line per Jacob's stated preference.
- **Images:** no photo assets available, so scenes are art-directed CSS "fog frame" placeholders
  (`.mlz-scene--forest/room/candle/sauna/breakfast/stone/path/night/water/reading/deepforest`),
  each a layered gradient mood. A real photo can be dropped in per-element via `--photo`
  (`style="--photo:url(...)"`) with no markup change — `.mlz-scene::after` overlays it.
- **Pages:** `index` (cinematic dark hero with integrated **booking ledger strip** — příjezd/
  odjezd/hosté/pokoj/Ověřit termín — estate thesis + record, 4-room key preview, 4 seasons,
  experiences preview, guest-book testimonials, candlelit CTA), `ubytovani` (4 room types as
  alternating full-width ledger entries: Mlžná borovice / Apartmá Tiché údolí / Kamenný pramen /
  Lesní loft — specs w/ dot leaders, amenity chips, price block, dual CTA; + "v ceně" band),
  `ubytovani/apartma-tiche-udoli` (full detail: gallery, story, specs, amenities, included,
  **tichá pravidla**, sticky booking card w/ price block, nearby výhledy, related rooms),
  `zazitky` (editorial alternating features + "jeden den ve Dvoře" timeline ledger + grid +
  CTA), `galerie` (JS-filtered editorial mosaic with varied tile spans, categories Vše/Pokoje/
  Snídaně/Wellness/Les/Detaily + counts), `kontakt` (guest-ledger reservation form w/ demo
  success state, recepce/adresa cards, SVG location mapka, check-in/out, arrival instructions,
  FAQ `<details>`). Nav: Úvod/Ubytování/Zážitky/Galerie/Kontakt + persistent "Rezervovat pobyt".
- Wired the **Showcase** "Penzion & retreat — Mlžný Dvůr" card live into the multi-page grid
  (changed `ux-grid--2` → `ux-grid` for 3-up; added on-brand `.ux-prev--mist` gradient preview
  since the card has no hero photo; demos.6* i18n keys use Czech fallbacks, missing keys are safe).

**Touched:** `src/pages/ukazky/penzion/**` (new: `_layout/Mlha.astro`, `_layout/Vrstevnice.astro`,
`index.astro`, `ubytovani.astro`, `ubytovani/apartma-tiche-udoli.astro`, `zazitky.astro`,
`galerie.astro`, `kontakt.astro`), `src/components/Showcase.astro`

**Note:** Large `.astro` files written to `outputs/` then `cp`-ed into the mount (file-tool
~24 KB truncation workaround). Validated all 8 new files + edited Showcase via `@astrojs/compiler`
`transform()` — 0 errors, no NUL bytes. All internal routes confirmed to resolve (no broken
links); all pages end with `</Mlha>`. All imagery is CSS/SVG (no external photo assets needed);
prices/contact/coordinates are fictional and marked as demo. Full `astro build` still can't run in
the sandbox (missing rollup linux binary — same long-standing platform issue). Confirm visually
with `npm run dev` on Windows.

## 2026-06-20

### Ateliér Hrot — gothic mood shift (cold blackwork-editorial, layout-level retune)
Shifted the whole tattoo site from warm "clean premium" to cold gothic / underground European
atelier / cathedral-meets-steel, by retuning the shared layout `_layout/Hrot.astro` (tokens +
global components) so all 7 pages change at once — no per-page concept/copy changes.

- **Palette → cold:** matte black `#0C0C0D`, charcoal `#151517`, graphite `#1E1E22`, cooler bone
  `#E7E4DB`, steel grays, slate "healed". The warm amber accent is retired — `--hr-amber` is now an
  alias to cold steel `#9DA2A4`, so every existing per-page reference (hero stamp, portfolio codes,
  hygiene labels, chooser) turns cold automatically. A **restrained oxblood `--hr-red #7E1C20`** is
  the only saturated accent, used sparingly (scroll bar, active-nav tick/marker, brand point,
  label incision, phead corner crosshairs). Body gets a cathedral vignette + a fixed **grain overlay**.
- **Sharper UI:** global radius `0`; buttons get a **blade-cut corner** (clip-path) and an uppercase
  condensed face; solid button is now bone-on-ink (crisp) instead of amber.
- **Typography:** added **Oswald** as `--hr-ff-cond` — a condensed editorial accent for section
  labels, nav, footer keys and the vertical label; IBM Plex Mono kept for technical codes; Bricolage
  for headlines. `.hr-label` is now condensed uppercase with a red incision tick (recurring signature).
- **Nav refined:** condensed uppercase links, red active marker + dot, steel hover underline.
- **Signature motifs:** red incision label tick, phead corner registration crosshairs, needle line
  (existing), catalog codes (existing) — a coherent archival/ritual language.
- **Services (`sluzby.astro`):** tattoo vs piercing now visually distinct disciplines — tattoo items
  read ink-heavy (higher-contrast image, red category incision); piercing reads cold/metallic
  (desaturated image, steel number/category, steel inner frame).

**Touched:** `src/pages/ukazky/tetovani/_layout/Hrot.astro` (full retune, 25 KB → written via outputs
+ shell `cp`, the Write/Edit truncation workaround), `src/pages/ukazky/tetovani/sluzby.astro`.

**Note:** Hrot.astro (25 KB) exceeds the ~24 KB file-tool truncation cap on this mount, so it was
written to `outputs/` then `cp`-ed in (shell writes ARE visible to bash, file-tool edits aren't —
the mount serves a stale snapshot). Layout validated from the mount via `@astrojs/compiler` = 0
errors, `</html>` present, Oswald/grain/`--hr-red` all present. `sluzby.astro` edits verified via the
Read tool (trivial class:list + CSS, matching existing patterns). Confirm visually with `npm run dev`.

### Ateliér Hrot (tattoo) — harder-hitting pass (hero, portfolio, hygiene, contact)
Pushed the tattoo demo from "good and clean" toward a studio-artifact feel, per feedback that it
should hit harder (flash sheet / underground / black-ink editorial). Reused the existing `hr-`
design system + tokens.

- **Hero (`index.astro`):** dropped the 3-card stack for ONE brutally cropped blackwork image with
  an inset vignette, a rotated amber **catalog stamp** (`HROT-04 / BLACKWORK / · HEALED ·`), a
  measurement rule annotation, and a split mono caption (`FLASH 04 — paže` / `085 × 220 mm`).
  Bumped headline to clamp(3rem,8.6vw,7.2rem), tighter leading/weight for more tension. Removed the
  now-unused `imgNeedle` import + `heroStack`.
- **Portfolio (`portfolio.astro`):** each work now carries a **catalog code** stamp
  (`HROT-01…12`, signature element) and piercing works render **colder/metallic** (`hr-work--metal`:
  desaturated image, steel code chip + steel cat color, steel "fresh" tag) to separate metal/piercing
  from ink/tattoo. Kept the uneven flash-wall grid, fresh/healed tags, hover metadata + filters.
- **Hygiene (`hygiena.astro`):** added a clinical **procedure board** status strip above the protocol
  (Sterilizace autokláv 134 °C / Cyklus kontrolováno / Materiál jednorázový / pulsing "PROVOZ OK"),
  and gave protocol cards a procedure-sheet top rule. Reduced-motion guard on the pulse.
- **Contact (`kontakt.astro`):** the plain type `<select>` became a bold **service chooser** — three
  selectable radio-cards (A Tetování / B Piercing / C Konzultace, piercing styled metallic via
  `:has()`), framed as step "01 — Co chcete řešit?" then "02 — Detaily" over the existing
  placement/size/reference fields, so it reads like a real booking flow. Reset handler updated to
  uncheck radios.

**Touched:** `src/pages/ukazky/tetovani/{index,portfolio,hygiena,kontakt}.astro`

**Note:** The bash mount served a stale snapshot of these files (file-tool edits didn't propagate to
the Linux mount; `wc`/`node` disagreed and showed truncated copies), so the @astrojs/compiler run
hit stale content. Verified the TRUE files via the Read tool instead: all four are complete, end with
`</Hrot>`, and the edited regions are well-formed; edits reuse patterns already compiling in these
files (`class:list` object form, `:global`, `:has()` is plain CSS). Confirm visually with `npm run dev`.

### Forma (trainer) v3 — premium calm-coach identity + page-wide progress system
Biggest pass yet, to lift Forma from "weakest demo" to a distinct calm/technical coaching brand.

- **Hero = split + custom training dashboard.** Left: oversized tight headline. Right: a real
  "tréninková nástěnka" card — live dot, progress 0→100 bar with knob + scale + animated count-up
  (0→62), "Příští trénink" row with day + Síla pill + 60:00 timer pill (blinking dot), a 7-bar mini
  weekly rhythm, and coaching notes (✓ technika / ↑ +2,5 kg / ◷ 3×8).
- **Recurring 0→100 system.** A fixed left **progress rail** with tick marks + a live %
  readout, scroll-bound via a passive rAF handler (fills naturally to 100 at page end, never
  resets; hidden < 1320px and under reduced-motion). Plus the dashed **milestone stepped line**
  and the reveal-animated `.fo-track` bars in "Co spolu sledujeme" — one shared progress language.
- **Program cards redesigned:** big outlined 01/02/03 over the photo, "best for" tag chips,
  structured data chips (Délka / Formát / Cena, price chip in lime), hover lift + lime border glow.
- **Weekly rhythm → training calendar:** 7 typed cells — Síla heavier (lime fill + left bar + 3
  dots), Kondice mid, Mobilita/Lehce softer, Volno quiet/dashed; intensity dots + day notes.
- **Brand texture:** faint measurement grid (masked) on the page, rubber-floor dot texture on the
  dark week band, soft shadows, signature measurement-tick section labels ("Programy / 01" …),
  more deliberate section spacing. No generic gradients.

**Touched:** `src/pages/ukazky/trener.astro`

**Note:** This file is now ~48 KB and the **file tools truncate writes to it at ~24 KB** (corrupting
the tail — the long-standing issue noted earlier). Workaround used: write full content to the
scratch `outputs/` dir (Write handles up to ~73 KB there), then `cp` to the repo path via shell.
Validated via `@astrojs/compiler` transform() — 0 errors, no NUL, `</html>`/`</style>`/`</script>`
all present. All 6 photo imports used. Confirm with `npm run dev`.

### Forma (trainer) v2 — warmer/human + a real progress visual system
Pushed the trainer page past brutalist-fitness toward personal & trustworthy, keeping the bold
condensed type and lime accent.

- **Warmth:** palette shifted from cool grey-green to warm paper/sand (`--fo-bg #f4f0e7`,
  `--fo-sand`, warm ink `#1a1611`, warm charcoal band), softer 16px radii (`--fo-r`), warm radial
  hero glow, rounded pills/chips. Personal touch: trainer named "Tomáš" — hero byline
  ("vede Tomáš · 8 let praxe · 1. trénink na zkoušku"), photo name chip, first-person signed
  contact note ("Ozvu se vám já, ne recepce. — Tomáš"), footer + brand sub.
- **Header CTA fix:** the broken solid-black `.fo-btn--ghost` block replaced with a clean lime
  `.fo-btn--pill` ("Začít →") with arrow nudge on hover (removed the ghost modifier).
- **Hero image treatment (custom, not stock):** offset `--fo-sand` panel behind the frame
  (`.fo-hero__art::before`), inner ring + bottom gradient (`.fo-herofig::after`), saturate/contrast
  bump, a lime "Vede Tomáš" pill, and an overlapping floating **progress card** ("Váš postup 6/12
  týdnů" with an animated bar) anchored over the photo corner.
- **Floating green dot:** removed the meaningless `.fo-hero__title-em::after` dot; the progress idea
  it gestured at is now a real system.
- **Progress system across the page:** reusable `.fo-pcard` + `.fo-track` language. New measurable
  **milestone timeline** (`.fo-mile`, lime dots on a rule: 1. trénink / 4 týdny / 12 týdnů / ∞ návyk
  with outcome copy) replaces the old static tick-rule. New **"Co spolu sledujeme"** section
  (`#fo-postup`) with three progress cards (Technika 8/10, Síla +18 %, Návyk 9 týdnů) whose bars
  animate on scroll-reveal. Dropped the vague hero `0 → 100` meter in favor of the meaningful card.
  Added a "Postup" nav link.

**Touched:** `src/pages/ukazky/trener.astro`

**Note:** Full rewrite via Write tool (avoids this file's known Edit-tail corruption). Validated via
`@astrojs/compiler` transform() — 0 errors, no NUL, 7/7 sections, all 6 photo imports used.
`astro build` still blocked in sandbox (rollup binary). Confirm with `npm run dev`.

### Fixed café marquee early-reset (seamless infinite loop)
The flat single-track marquee used a uniform `gap`, so `translateX(-50%)` landed half a gap
short of the duplicate's start → visible jump/reset around "Flat white"/"Filtr V60." Rebuilt as
a proper tiling marquee: `tickerItems` defined once in frontmatter and rendered as two identical
`.kv-ticker__group` blocks inside one `.kv-ticker__track`. Track is `display:flex; width:max-content`
(content-based, not viewport); spacing moved from `gap` to per-child `margin-right` so the groups
tile with no extra inter-group gap, making `-50%` exactly one group wide. Animation is explicit
`translateX(0)→translateX(-50%)`, `linear`, `overflow:hidden` on the wrapper. Subtle cream/brown
style preserved. 0 compiler errors.

**Touched:** `src/pages/ukazky/kavarna.astro`

### Softened the café hero marquee into a subtle menu-tape divider
The post-hero ticker was too heavy (dark `--ink` band, large italic Fraunces) and split the
page. Restyled `.kv-ticker` to a quiet editorial strip: muted cream/brown background
(`paper-2`×`panel` mix), hairline `line-soft` borders (no more solid ink rules), small
uppercase mono type (.8rem, +.16em tracking), more gap/whitespace, slower 46s scroll. Swapped
the aggressive `✶` separators for small muted `●` dots (crema, .55 opacity). Café compiles 0 errors.

**Touched:** `src/pages/ukazky/kavarna.astro`

### Art-directed redesign of the kavárna (café) and trenér (Forma) demo pages
Rebuilt both pages from safe card-grid layouts into custom, art-directed pages per the
"premium studio, not a template" brief (every section a unique layout, oversized type,
asymmetry/overlap, images as design elements). Café pushed maximal/editorial; trainer kept
commercially believable and conversion-focused but de-templated.

- **kavárna.astro** — full rewrite as an editorial "kávový zin." New type system: Fraunces
  (display, italic/optical) + Instrument Sans (body) + Spline Sans Mono (labels); kept the
  cream/clay/espresso palette. Sections, each a distinct layout: sticky masthead/tiráž; cover
  hero with giant mixed roman/italic headline, rotated photo + crop marks + a rotating SVG
  circular roast seal (textPath) with a coffee-bean center; an italic marquee ticker; an
  oversized pull-quote credo; a typographic menu *spread* (vertical side-label, dot-leader
  rows, rotated bleed photo, asymmetric grid-areas — no card grid); a rotated/overlapping
  bean photo-collage reportage; a pasteboard "nástěnka" gallery (4 pinned, taped, rotated
  photos on an overlapping CSS grid — the hard-to-template section); an editorial colophon
  visit block with dot-leader hours + SVG map; a dark closing CTA spread. Page-wide SVG paper
  grain overlay, IntersectionObserver reveals, reduced-motion guards.
- **trener.astro** — rewrite keeping Forma's lime/charcoal + Big Shoulders identity and all
  conversion elements (clear CTAs, price transparency, first-session offer, phone/email/addr).
  Introduced a "measurement/tracking" visual language: a tick-rule milestone strip (00/04/12/∞),
  oversized index numerals. Programs are now alternating full-width editorial rows (photo left/
  right, big kód, inline meta) instead of a 3-up card grid. Week section is a CSS training-load
  **bar chart** (per-day intensity, staggered grow animation) instead of 7 equal boxes. Pro koho
  uses an overlapping 2-photo composition with a lime "1. trénink na zkoušku" tag + numbered list.
  Contact panel refined. Kept the hero progress meter.

**Touched:** `src/pages/ukazky/kavarna.astro`, `src/pages/ukazky/trener.astro`

**Note:** Both validated through `@astrojs/compiler` `transform()` — 0 errors, no NUL bytes,
balanced `<section>`/`<Image>` tags (café 7/9, trainer 5/5). Full `astro build` still can't run
in this sandbox (missing `@rollup/rollup-linux-x64-gnu`). Brand recognizability, Czech copy, and
all existing photo assets/imports preserved; Showcase wiring untouched (imports by path). Confirm
visually with `npm run dev` on Windows. Café uses the wider 1180px container; trainer too.

### Wired real photography into the Ateliér Hrot demo
Jacob added 12 portfolio photos to `src/pages/ukazky/tetovani/` (matching the brief's suggested
filenames). Swapped the placeholder SVG `Flash` motifs for the real photos via `astro:assets`
`Image` (auto-webp, responsive `widths`/`sizes`, lazy except hero) on the image-led pages, and
kept the SVG signature language (Needle line, schematic hygiene icons, map placeholder) where it
carries meaning.

- `portfolio.astro`: full rewrite of the wall — 12 photos mapped to categories/tags, filters and
  hover-metadata intact; cards are now photo-cover with a dark gradient meta overlay; one landscape
  shot (`fine-line`) set `--wide`, dramatic verticals (`backwork`, `ornament`, `flash-sheet`)
  `--tall`, `blackwork` `--big`. Subtle `saturate(.92) contrast(1.04)` baseline, restores on hover.
- `index.astro`: hero 3-card stack now uses real photos (studio / blackwork / piercing, with mono
  caption codes) and the 4-up portfolio preview uses photos; SVG kept for the end-CTA arrow and the
  hero needle divider.
- `sluzby.astro`: each of the 6 service cards now shows a representative photo (cover, 1:1).
- `Showcase.astro`: gave the Hrot multipage card a real hero preview (`portfolio-arm-piece-01`) via
  the existing `c.img ? photo : svg` branch, matching the other live demo cards.
- `Flash.astro`/`Needle.astro` remain (Needle in active use; Flash now only the home end-CTA arrow).

**Touched:** `src/pages/ukazky/tetovani/{index,portfolio,sluzby}.astro`, `src/components/Showcase.astro`
(+ 12 image assets added by Jacob under `src/pages/ukazky/tetovani/`)

**Note:** Same sandbox build limit (missing rollup linux binary). Validated all four edited files
through `@astrojs/compiler` `transform()` — 0 errors. Image files confirmed present (12×, ~1122×1402
px). Confirm visually with `npm run dev` on Windows.

### Added Ateliér Hrot — multipage tattoo/piercing demo (`/ukazky/tetovani`)
New 7-page demo with a deliberately distinct identity from Studio Luma (kadeřnictví):
dark editorial + bone/steel clinical zones, grotesque + mono type (Bricolage Grotesque /
IBM Plex Sans / IBM Plex Mono), sharp 3px radii, mono technical labels, incision dividers —
the opposite of the salon's warm-serif pastel softness. Signature "Hrotová linka" (needle-trail
SVG ending in a sharp point) recurs as nav active mark, hover underline, scroll-progress bar,
process connectors, and section dividers.

- New route folder `src/pages/ukazky/tetovani/` with own `_layout/` (not the Mossven Layout),
  all classes prefixed `hr-` to avoid collisions.
- `_layout/Hrot.astro`: shared nav (Úvod/Portfolio/Služby/Ceník/Hygiena/Péče/Kontakt with
  00–06 index + Hrot-line active state), studio-index footer, full token system + global CSS,
  scroll-progress accent, IntersectionObserver reveals, mobile menu, reduced-motion support.
- `_layout/Needle.astro`: signature needle-trail (divider/seam/needle variants).
- `_layout/Flash.astro`: 12 line-art / blackwork flash motifs in SVG (serpent, moth, sprig,
  mandala, dagger, ear, nose, crescent, arrow, eye, tray, inkcaps) — carries portfolio identity
  instead of stock photos (no real tattoo photography available; honest for a demo).
- Pages: `index` (hero thesis, Proč Hrot, portfolio preview, services, hygiene promise, 5-step
  process, price preview, booking CTA), `portfolio` (JS-filtered flash-sheet wall: Vše/Jemné
  linky/Blackwork/Ornament/Piercing/Zahojené/Flash + hover metadata + zahojeno/čerstvé tags),
  `sluzby` (6 services with pro-koho/trvání/příprava spec blocks), `cenik` (printed rate-sheet
  with dotted leaders + notes; demo prices), `hygiena` (steel/bone clinical protocol cards +
  contraindication warning block, dried-blood accent), `pece` (tattoo/piercing tabs + healing
  timeline + calm message block), `kontakt` (full booking form per spec + hours + map/IG
  placeholders + expectations; demo submit handler).
- Wired the existing Showcase "Ateliér Hrot" card live (added `href`/`aria` so it renders as a
  live multipage demo instead of "Připravujeme").

**Touched:** `src/pages/ukazky/tetovani/**` (new: `_layout/Hrot.astro`, `_layout/Needle.astro`,
`_layout/Flash.astro`, `index.astro`, `portfolio.astro`, `sluzby.astro`, `cenik.astro`,
`hygiena.astro`, `pece.astro`, `kontakt.astro`), `src/components/Showcase.astro`

**Note:** Full `astro build` can't run in the sandbox (missing `@rollup/rollup-linux-x64-gnu`
native binary — same platform issue noted in prior entries). Validated all 10 new files +
Showcase through `@astrojs/compiler` `transform()` (0 errors). Confirm visually with
`npm run dev` on Windows. All imagery is SVG/CSS (no external photo assets needed). Prices/
contact details are fictional, marked as demo on the pages.

### Natural-Czech copy pass on demo pages (kadeřnictví, trenér, truhlář)
Fixed phrasing that read as slightly literal/AI-ish per native-speaker review. Studio Luma
team (`tym.astro`): reworked Klára/Nela/Eva `focus`/`line`/`book` strings and changed the
member label to "Nejčastěji se k ní objednáte na" (book items lowercased to fit); updated the
page meta description for Klára. Kadeřnictví: hero now "Střih, který drží tvar, a barva, která
vám sedne i po odchodu ze salonu." (`index.astro`); home + galerie heading "Styl, který
poznáte na první pohled"; team focus chip on home → "Přirozené střihy a jemné barvení";
kontakt H1 "Pojďme se objednat" → "Domluvme termín". Sluzby: "Pro každou, kdo…" → "Pro
každého, kdo… drží tvar", and color promise softened from "jistě a bez poškození vlasů" to
"s ohledem na kondici vlasů a co nejšetrnějším postupem". Trenér (`trener.astro`): meter label
"tvůj postup" → "váš postup" (tone consistency), "nezačínala z formy" → "ve formě", ceny note
reworded. Truhlář (`truhlar.astro`): "staré dvířka" → "stará dvířka", hero em "řezaný přesně."
→ "který sedí přesně.", "opravy ze dřeva" → "opravy dřevěného nábytku" (hero sub + meta).

**Touched:** `src/pages/ukazky/kadernictvi/{tym,index,galerie,kontakt,sluzby}.astro`,
`src/pages/ukazky/trener.astro`, `src/pages/ukazky/truhlar.astro`

**Note:** Text-only edits inside existing template/JS literals. `astro check`/build couldn't run
in this sandbox (missing `@rollup/rollup-linux-x64-gnu` native binary — platform issue, not these
changes). Verified by grep: all 15 old phrases gone, new phrases present. trener.astro edited via
`python3` (Edit-tool truncation guard, per earlier note).

### Upgraded landing showcase previews to each demo's hero photo
The three single-page cards in `Showcase.astro` (Dílna Vorel, Kavárna Zrnko, Forma) now use
the demo's own hero image as the browser-frame preview, matching the Studio Luma multi-page
card (`.ux-prev--photo` + `.ux-shot`, existing CSS reused). Imported `truhlar-hero-workshop`,
`kavarna-hero-kava-interier` and `trener-one/trener-hero-koukink`; added `img`/`imgAlt` to each
landing card and wrapped the preview in `{c.img ? photo : svg-art}` so the CSS/SVG art stays as
a fallback. Czech alt text. Edited via `python3` write (mount Edit-tool truncation guard);
validated div 36/36, svg 3/3, ternaries balanced, no NUL.

**Touched:** `src/components/Showcase.astro`

### Swapped trenér (Forma) program card photos
Per request: card 01 "1:1 osobní trénink" now uses `trener-silovy-trenink` and card 02
"Trénink ve dvojici" uses `trener-technika-cviku` (03 unchanged). Re-added the `fotoSila`
import; all imports in use. With all three cards now carrying a photo the SVG duo panel no
longer renders (kept as a harmless fallback). Edits done via `python3` write (file is over the
Edit-tool truncation cap). Validated: CSS 119/119, sections 5/5, figures 4/4.

### Moved trenér (Forma) program photos into the cards
Reworked the photo placement on the programy section per feedback: instead of a separate
photo strip, each program card now carries its own image at the top (full-bleed), so it reads
as one intentional unit (image → kód → název → meta).

- 01 "1:1 osobní trénink": technique-correction photo (`fotoTechnika`).
- 02 "Trénink ve dvojici": no suitable two-person photo, so a branded SVG "duo" panel
  (charcoal + two lime figures) keeps the card the same height and the three `01/02/03`
  labels aligned, rather than reusing a one-client image.
- 03 "Plán na doma": training-log/notebook photo (`fotoPlan`).
- Removed the separate `.fo-shots` strip and the duplicate notebook in the "Jak vypadá týden"
  section (the notebook now lives on card 03); dropped now-unused `fotoSila`/`fotoMobilita`
  imports and `.fo-shots`/`.fo-week__media` CSS. Card gets `overflow:hidden` for the
  full-bleed image; `.fo-prog__media` uses negative margins to reach the card edge.

**Touched:** `src/pages/ukazky/trener.astro`

**Note:** Edit-tool writes to this file truncate at ~23.7 KB (corrupting the tail / adding NUL
bytes), so the CSS tail was reassembled with shell `cat >>`. Keep further edits to this file
shell-based. Tags/braces validated statically (CSS 119/119, sections 5/5, figures 4/4, svg 1/1).

### Added supportive coaching photography to the trenér (Forma) demo page
Wired the 7 photos in `src/pages/ukazky/trener-one/` into the demo to make the trainer feel
real, calm and beginner-friendly, without redesigning the page (kept the lime/charcoal Big
Shoulders identity, copy, and structure). One consistent visual motif: same trainer + same
client, bright airy studio, sage-green/black palette, no gymbro/transformation imagery.
Photos use Astro's `Image` (auto-webp, responsive `widths`/`sizes`, lazy except hero).

- Hero: framed `3:2` photo band (`.fo-herofig`) below the hero CTA — trainer coaching a
  kettlebell squat. Kept the `0 → 100` progress meter.
- Programy: 3-up photo strip (`.fo-shots`) under the program cards with lime pill captions
  (technika / síla / mobilita). Captions are `span.fo-shot__cap` (valid inside `li`).
- Týden (dark band): one subtle supporting photo (`.fo-week__media`) — training log/notebook,
  centered and constrained so the day strip still reads first.
- Pro koho: warmed the section into a 2-col (`.fo-who__photo` | `.fo-who__col`) with a
  beginner-friendly stretching photo beside the header + list.
- Kontakt: wrapped the panel in `.fo-contact__inner` (portrait | panel); tall trainer
  portrait fills the left column (`object-position: center 22%`). Czech alt text throughout.

**Touched:** `src/pages/ukazky/trener.astro`

**Note:** Same sandbox limitation as prior demo entries — `astro check`/`build` can't run here
(npm registry blocked). Validated statically: 7 imports all used, 7 `<Image>` tags, div/figure/
ul/section tags balanced. Confirm visually with `npm run dev` on Windows.

### Added warm photography to the kavárna (Kavárna Zrnko) demo page
Wired the 9 photos in `src/pages/ukazky/kavarna/` into the demo to sell café atmosphere,
keeping the calm cream identity, type, and layout. Photos use Astro's `Image` (auto-webp,
responsive `widths`/`sizes`, lazy except hero). Followed `SKILL.md` (frontend-design).

- Hero: replaced the illustrated SVG cup (steam animation) with a real warm hero photo
  in a softly rotated rounded frame.
- Menu: added a 3-up square photo strip below the menu card (espresso, domácí koláč, toast)
  with pill captions — kept it light so the menu still scans cleanly.
- Zrno: replaced the small SVG bean mark with a bean/preparation detail photo, section now
  reads as image + text.
- Galerie ("Jak to u nás vypadá"): replaced the 3 SVG line cards with real photo cards
  (interiér, šálek, vitrína); updated lead copy away from "not photographs."
- Visit/contact: added a subtle entrance photo above the location map.
- Removed now-dead CSS (`.kv-cup*`, `.kv-steam*`, `kv-steam` keyframes, `.kv-bean*`,
  `.kv-gcard__svg*`). Czech alt text; matching radii; responsive.

**Touched:** `src/pages/ukazky/kavarna.astro`

**Note:** Same sandbox limitation as the truhlář entry — `astro check`/`build` can't run here
(npm registry blocked, Linux rollup binary missing). Validated statically: JSX tag balance,
all 9 imports resolve, no orphaned refs. Confirm visually with `npm run dev` on Windows.

### Adopted `SKILL.md` (frontend-design) as the project design standard
Jacob added `SKILL.md` (the `frontend-design` skill) to the repo root. `CLAUDE.md` now
instructs every agent to read and apply it for any frontend/UI work (pages, components,
demos, landing sections, artifacts) — it's the design bar, not optional.

**Touched:** `CLAUDE.md` (added "Always: frontend-design skill" section)

### Added real craft photography to the truhlář (Dílna Vorel) demo page
Wired the 13 existing photos in `src/pages/ukazky/truhlarstvi/` into the demo page so it
feels like a real carpenter's site, without changing the blueprint visual identity, layout,
typography, or palette. Photos use Astro's `Image` component (auto-webp, responsive
`widths`/`sizes`, lazy-loaded except the hero) so the layout isn't slowed.

- Hero: large framed workshop photo band below the hero; kept the signature SVG plan drawing.
- Služby: 3-up photo strip (vestavby/kuchyně, stoly/police, opravy) under the text cards.
- Materiály: 4-up wood/finish photo strip alongside the existing CSS gradient swatches.
- Ukázky: replaced the 4 SVG line-drawing cards with real photo portfolio cards + captions;
  updated the lead copy from "not photographs" to honest demo-example wording.
- Kontakt: warm closing photo of a finished piece above the contact panel.
- Removed now-dead `.dv-card__svg*` CSS rules.
- Czech semantic alt text throughout; consistent borders/corners/shadows; responsive grids.

**Touched:** `src/pages/ukazky/truhlar.astro`

**Note:** Could not run `astro check`/`build` in the sandbox — npm registry is blocked there
and `node_modules` only has the Windows rollup binary, not the Linux one. Validated
statically instead (JSX tag balance, all imports resolve, no orphaned refs). Build on the
Windows machine / `npm run dev` to confirm visually.

---

## Before this changelog existed

This file was created on 2026-06-20. Earlier history lives in git. Recent commits for context:

- `f451a55` Refine contact form, care plan copy, and optional field labels
- `74a32fc` Add WhoFor section, hero free-check CTA, and refine landing copy
- `e4ed8e3` Refine landing sections, demo pages, and global styles
- `1798d40` Improve landing copy/structure; Mossline hub visual with Web centered
- `7951d64` Tweak copy on kadernictvi, kavarna, and truhlar demo pages
- `97939b0` Optimize kadernictví images with astro:assets Image component
- `3a80668` Add kadernictví (hairdresser) demo page and Luma ribbon component
- `f63f2cf` Add Showcase section and demo pages (ukázky)
