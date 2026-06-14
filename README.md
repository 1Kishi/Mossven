# Mossven

Czech-first, EU-ready managed web hosting and website-care landing page, built with **Astro 5** and **Tailwind CSS v4**. Bilingual CZ/EN with an instant client-side toggle, light/dark themes, and the signature "Mossline" forest visual.

## Run it

```bash
npm install
npm run dev      # local dev server at http://localhost:4321
npm run build    # production build to ./dist
npm run preview  # preview the production build
```

> The project was scaffolded in an environment without npm registry access, so dependencies are not installed yet. Run `npm install` once locally and you're set.

## Project structure

```
src/
  pages/index.astro        – assembles the page from section components
  layouts/Layout.astro     – <html> shell, fonts, head, theme/lang anti-flash, script include
  components/              – one .astro component per section
    Header, Hero (Mossline), Problem, NotJustHosting, Services,
    BeforeAfter, SplitWork, Industries, WebPackages, MonthlyCare,
    Founder, Process, Faq, Contact, Footer
  i18n/translations.ts     – single CZ/EN string table + t() helper
  scripts/app.ts           – theme toggle, language toggle, Mossline drawing,
                             daylight-dust / firefly canvas, scroll reveals, form
  styles/global.css        – Tailwind import + @theme tokens + the full design system
public/
  favicon.svg
```

## How things work

**Styling.** `global.css` imports Tailwind v4 and maps the Mossven palette and fonts into the Tailwind theme via `@theme` (so utilities like `text-moss`, `bg-lichen`, `font-display` are available). The light/dark theming, keyframes, the Mossline, the pseudo-element textures and the particle canvas live in authored component CSS below the import — these are not things Tailwind utilities express cleanly, so they stay as real CSS.

**Languages.** Czech renders by default (server-side). The CZ/EN buttons swap every `data-i18n` element's text live from `translations.ts` and remember the choice in `localStorage`. To add or edit copy, edit `src/i18n/translations.ts` (keep the `cs` and `en` key sets in sync) and the matching `data-i18n` element.

**Theme.** A tiny inline script in `<head>` sets `data-theme` before paint to avoid a flash; the toggle and the particle style (daylight dust in light, fireflies in dark) follow it.

## Still to do before launch

- **Footer legal:** fill the `[doplnit]` placeholders in `Footer.astro` (IČO, address, VAT status), and point the Obchodní podmínky / Zásady / Cookies links at real pages.
- **Contact form:** `app.ts` shows the success message client-side only. Wire the form to an email service or form endpoint (e.g. Formspree, Resend, or an Astro server endpoint) to actually receive enquiries.
