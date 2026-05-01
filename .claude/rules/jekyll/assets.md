---
paths:
  - "assets/**/*"
  - "_sass/**/*"
  - "_includes/**/*.html"
  - "**/*.md"
  - "**/*.html"
---

# Asset Rules

## Images — responsive variants

Every content image that displays larger than a thumbnail needs both WebP and JPEG, in the standard widths:

```
<name>_320.{jpg,webp}
<name>_480.{jpg,webp}
<name>_640.{jpg,webp}
<name>.{jpg,webp}      # ~1024w "full" variant
```

- Generate variants with `resize_img.sh` and `convert_img.sh` (committed at the repo root, excluded from the build).
- Reference them via `link_track_image.html` (or analogous includes) — pass the full `srcset` strings as parameters.
- Use `loading="lazy"` for everything below the fold.
- Album art lives under `assets/images/<album-slug>/`; standalone images live directly under `assets/images/`.

## SEO images

- Always 1280×720 JPEG (16:9) for `seo_image` on non-music pages — matches the site default.
- Music pages use 1280×1280 square artwork as `seo_image`.
- Filename suffix `_seo.jpg` makes the intent obvious (e.g. `dentro_seo.jpg`).

## Audio

- Previews: 30–60s, `.mp3`, named `<song>_preview.mp3`.
- Full tracks (download flow): full-length `.mp3`, named `<song>.mp3`, served from `/d/` landing pages — don't link them from public navigation.
- Reference audio in front matter via `seo_audio` for music link pages.

## Video

- `.mp4`, web-optimised, with a poster JPEG (`<name>_poster.jpg`).
- Always set `<video poster="…" loading="lazy" muted playsinline>` for autoplay carousels.

## CSS / SASS

- Edit only files under `_sass/`, `assets/css/styles.scss`, or new partials added to `_sass/`.
- Never edit `assets/css/bootstrap.v5.3.3.min.css`, `bootstrap-icons.v1.13.1.min.css`, `normalize.css`, or `cookieconsent_v3.css`.
- Stylesheet load order in `_layouts/default.html`:
  1. `normalize.css`
  2. `bootstrap.v5.3.3.min.css`
  3. `bootstrap-icons.v1.13.1.min.css`
  4. `cookieconsent_v3.css`
  5. `styles.css` (compiled from `styles.scss`)
- Cache-busting `?v={{ site.time | date: '%s' }}` is used on every locally-edited CSS file. Keep it.

## JavaScript

- Editable files: `assets/js/api.js`, `forms.js`, `link.js`, `cta.js`, `scroll_v1.js`, `amplitude_v261.js`.
- Vendor files (committed, never edited inline): `bootstrap.bundle.v5.3.3.min.js`, `axios.v1.6.8.min.js`, `analytics-browser-2.6.1-min.js`, `intersection-observer.min.js`, `verge.min.js`, `cookieconsent_v3.js`, `songkick_injector_20230525.js`.
- Upgrades: drop the new file with a versioned name next to the old one and update the `<script>` tags in the relevant include — do not overwrite the old version's filename.
- Don't add a CDN `<script src="https://…">` tag. All vendor JS is committed.

## Fonts

- Self-hosted under `assets/css/fonts/` and `assets/webfonts/`.
- Add new fonts via `_sass/fonts.scss` only — never `<link href="…fonts.googleapis.com…">`.

## Where things go

| Asset type | Location |
| --- | --- |
| Page content image | `assets/images/<context>_<size>.{jpg,webp}` |
| Album artwork | `assets/images/<album-slug>/<track>_<size>.{jpg,webp}` |
| SEO/share image | `assets/images/<context>_seo.jpg` |
| Audio preview | `assets/audio/<song>_preview.mp3` |
| Full audio (downloads) | `assets/audio/<song>.mp3` |
| Video | `assets/videos/<name>.mp4` + `_poster.jpg` |
| Custom JS | `assets/js/<name>.js` |
| Custom CSS partial | `_sass/<name>.scss` |
