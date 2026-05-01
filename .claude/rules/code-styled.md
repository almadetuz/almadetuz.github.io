---
paths:
  - "**/*.md"
  - "**/*.html"
  - "**/*.scss"
  - "**/*.css"
  - "**/*.js"
  - "**/*.yml"
---

# Code Style Rules — Jekyll Project

These are the conventions actually used in this repo. Match them; do not invent new ones.

## File and directory naming

| Type | Convention | Example |
| --- | --- | --- |
| Includes | `snake_case.html` | `link_track_buttons.html`, `mail_form.html` |
| Layouts | `lowercase.html` | `default.html`, `download.html` |
| Content (Markdown) pages | `kebab-case.md` | `madrid-16-nov.md`, `dentro-cc373161.md` |
| Singles collection items | `snake_case.md` | `brillamos_por_igual.md`, `dentro.md` |
| SASS partials | `lowercase.scss` (no leading underscore in this repo) | `main.scss`, `carousel.scss` |
| JS files | `lowercase.js`, version suffix for vendored libs | `forms.js`, `bootstrap.bundle.v5.3.3.min.js` |
| Images | `description_size.ext` | `dentro_single_480.webp`, `alma_de_tuz_seo.jpg` |
| Audio | `description.mp3`, with `_preview` for samples | `dentro_preview.mp3` |
| Data files | `lowercase.yml` | `navigation.yml`, `legal.yml` |
| Album subdirectories | `kebab-case/` | `dentro-del-laberinto/`, `la-penultima/` |

> Mixed conventions exist for historical reasons (e.g. snake_case singles vs kebab-case content pages). When adding to an existing folder, match what's already there. When creating a new folder, prefer kebab-case for URL-bearing content and snake_case for non-URL assets.

## Front matter

- Always include `title` and `layout` (the default layout is set in `_config.yml`, but be explicit on content pages).
- Use the `seo_*` family for metadata — see `_includes/seo.html` for the full list.
- For pages that must not be indexed (download landings, internal confirmations) set `sitemap: false`.
- Dates and IDs in front matter use ISO formats: `seo_music_release_date: 2025-01-10`.
- See [`jekyll/frontmatter.md`](./jekyll/frontmatter.md) for the per-layout requirements.

## Liquid and includes

- Pass parameters by name with quoted strings. Numeric IDs may be unquoted:
  ```liquid
  {% include mail_form.html
    title="Infusiones de Tüz"
    button="Sí, quiero recibirlas"
    form_id=1
    context_group_id=2225
  %}
  ```
- Use `{{ include.foo | default: '...' }}` for optional parameters.
- Wrap optional sections in `{% if include.foo %}…{% endif %}`.
- Prefer `{% include %}` over duplicating HTML; prefer existing includes over inventing new ones.
- See [`jekyll/liquid.md`](./jekyll/liquid.md) and [`jekyll/layouts-and-includes.md`](./jekyll/layouts-and-includes.md).

## HTML

- Indent with 2 spaces.
- Quote all attribute values with double quotes.
- Use Bootstrap utility classes for spacing/colour where possible (`bg-rose`, `text-soft-white`, `mb-3`) before reaching for custom CSS.
- `<img>` tags use `loading="lazy"` for below-the-fold media; `<video>` tags use `loading="lazy"` and a `poster=""`.
- All external links: `target="_blank" rel="noopener noreferrer"`.

## SASS / CSS

- Variables in `assets/css/styles.scss`: kebab-case prefixed by category (`$color-auburn`, `$bp-tablet`, `$font-h1-titular`).
- Mobile-first media queries: start with the small layout, override at `min-width: $bp-mobile` and up.
- Override Bootstrap via CSS custom properties (`--bs-btn-bg`) — do not edit the Bootstrap CSS file.
- Keep partials small and focused: typography in `fonts.scss`, forms in `form.scss`, video in `video.scss`, etc.

## JavaScript

- Indent with 2 spaces; use `const`/`let`, no `var` in new code (existing globals like `web_event_prop` stay as they are — declared in `_layouts/default.html`).
- Module-style namespaces are camelCase or PascalCase per convention (`FormSignup.add(...)`, `ScrollEvent.add(...)`).
- Function/variable names: `camelCase`. Event names sent to Amplitude/FB: `PascalCase` (`'PageView'`, `'FormSubmit'`, `'Lead'`).
- Vendor libraries are committed as versioned files (`axios.v1.6.8.min.js`) — do not load from CDNs. When upgrading, add the new versioned file and update the `<script>` tags.
- Wrap analytics calls behind the existing helpers (`amp_event`, `fb_event`, `gads_event`) — they handle the consent check.

## Markdown content

- Use `kramdown` attribute lists for image classes and headings:
  ```markdown
  ![Album art](/assets/images/album_480.jpg){: .img-right }

  ## Section heading
  {: .titular .text-start }
  ```
- Two trailing spaces or a `\\` for hard line breaks (the repo uses both — match the surrounding file).
- Spanish copy: keep accents (`é`, `ñ`, `ü`, `¿`, `¡`) — the site's identity is "Tüz" and other diacritics matter.

## Commits

The repo's recent commits are short imperative phrases ("fix sitemap", "Improve form lead"). Match that style — don't introduce a different convention (no `feat(scope):` prefixes unless the user asks for them).
