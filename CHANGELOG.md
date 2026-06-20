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

## 2026-06-20

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
