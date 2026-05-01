---
name: architecture-checker
description: Detect Jekyll/site-convention violations across layouts, includes, content front matter, SEO metadata, analytics wiring, and assets. Use for PR reviews, after touching `_layouts/`, `_includes/`, content collections, or assets.
tools: Read, Glob, Grep
model: haiku
---

# Architecture Checker — Jekyll edition

Detect convention and architecture violations in this Jekyll project. Full rule explanations live under `.claude/rules/jekyll/` and the global `.claude/rules/` folder. Reference them by filename in every finding.

## Project shape

- Static Jekyll site, GitHub Pages, plugins limited to `jekyll-feed` and `jekyll-sitemap`.
- Layouts in `_layouts/` form a tree rooted at `default.html` → `tracking.html` → leaf layouts.
- Reusable HTML lives in `_includes/`. Content lives in collections (`_singles/`) and top-level directories (`cartas/`, `coser-y-cantar/`, `infusiones/`, `mis-canciones/`, `taller/`, `legal/`, `d/`, `u/`, `l/`).
- SEO is centralised in `_includes/seo.html` and driven entirely by front matter.
- Analytics is centralised in `tracking.html` (Amplitude, FB Pixel, Google Tag, Matomo) and gated by cookie consent.
- Forms go through `_includes/form_api_signup.html` (custom API → Mailchimp) or `_includes/mail_form.html` (direct Mailchimp).

## Detection checks

### Check 1: Front matter missing or invalid

| Property | Value |
| --- | --- |
| **Severity** | 🔴 High |
| **Search** | All `*.md` and `*.html` pages outside `_layouts/`, `_includes/`, `_sass/`, `assets/`, `_site/`, `vendor/`, `node_modules/` |
| **Detect** | Missing `title` or `layout`; `layout:` value not present in `_layouts/`; `seo_image` path doesn't exist in `assets/`; download/internal page without `sitemap: false`; music `link` page missing `seo_type`. |
| **Rule** | See `frontmatter.md`, `seo.md` |

**Fix**: Add the missing field, fix the path, or set `sitemap: false` for non-indexable pages.

---

### Check 2: SEO metadata duplication or override

| Property | Value |
| --- | --- |
| **Severity** | 🟡 Medium |
| **Search** | `_layouts/**/*.html`, content pages, `_includes/seo.html` |
| **Detect** | Manual `<meta property="og:*">` tags outside `_includes/seo.html`; `<title>` overridden in a leaf layout; canonical URL hard-coded. |
| **Rule** | See `seo.md` |

**Fix**: Remove the duplicate tag and rely on `seo.html` driven by front matter.

---

### Check 3: Wrong mobile deep-link field

| Property | Value |
| --- | --- |
| **Severity** | 🟡 Medium |
| **Search** | Content pages under `l/` and `mis-canciones/`, plus `_includes/seo.html` |
| **Detect** | `seo_mobile_bandcamp_url:` value pointing at `open.spotify.com` or `youtube.com`; or `seo_mobile_spotify_url:` pointing at `bandcamp.com`. |
| **Rule** | See `seo.md` |

**Fix**: Use the field name that matches the destination platform (the partial emits app metadata based on the field name).

---

### Check 4: Layout bypassing tracking

| Property | Value |
| --- | --- |
| **Severity** | 🔴 High |
| **Search** | `_layouts/*.html` |
| **Detect** | A new leaf layout with `layout: default` that adds analytics manually instead of `layout: tracking`. |
| **Rule** | See `layouts-and-includes.md` |

**Fix**: Inherit from `tracking.html` and remove the manual analytics include.

---

### Check 5: Analytics fired outside helpers / outside consent

| Property | Value |
| --- | --- |
| **Severity** | 🔴 High |
| **Search** | `_includes/**/*.html`, `_layouts/**/*.html`, `assets/js/**/*.js`, content pages |
| **Detect** | Direct calls to `gtag(`, `fbq(`, `amplitude.track(` without going through `amp_event` / `fb_event` / `gads_event`; analytics fired before cookie consent; PII fields included in event properties. |
| **Rule** | See `analytics.md`, `security.md` |

**Fix**: Route through the helpers; remove PII; ensure the call site runs after consent.

---

### Check 6: Form missing privacy checkbox or honeypot

| Property | Value |
| --- | --- |
| **Severity** | 🔴 Critical |
| **Search** | `_includes/*form*.html`, `_includes/*signup*.html`, content pages with raw `<form>` |
| **Detect** | A `<form>` posting an email field without a required `privacy` checkbox linking to `/legal/privacidad.html`; missing honeypot field; missing call to `FormSignup.add(...)`. |
| **Rule** | See `forms.md`, `security.md` |

**Fix**: Use `form_api_signup.html` or `mail_form.html`; restore the privacy block + honeypot + analytics wiring.

---

### Check 7: Open redirect / unsafe external link

| Property | Value |
| --- | --- |
| **Severity** | 🔴 Critical |
| **Search** | `_includes/link_*.html`, `assets/js/link.js`, content under `l/` |
| **Detect** | Building a redirect destination from a query parameter; `target="_blank"` without `rel="noopener noreferrer"`; `href="javascript:..."` or unescaped Liquid in `href`. |
| **Rule** | See `security.md` |

**Fix**: Allowlist destinations (Spotify, YouTube, Apple Music, Bandcamp, SoundCloud); add `rel="noopener noreferrer"`; escape Liquid output.

---

### Check 8: Asset convention drift

| Property | Value |
| --- | --- |
| **Severity** | 🟡 Medium |
| **Search** | `assets/images/**`, `assets/audio/**`, `assets/js/**`, `_sass/**` |
| **Detect** | New image without responsive `_320/_480/_640/.{jpg,webp}` siblings; CDN `<script>` tag introduced; vendor file edited in place; Bootstrap CSS modified directly. |
| **Rule** | See `assets.md` |

**Fix**: Generate the missing variants (use `resize_img.sh` + `convert_img.sh`); commit a versioned vendor file instead of editing; override Bootstrap via CSS custom properties.

---

### Check 9: Liquid output not escaped

| Property | Value |
| --- | --- |
| **Severity** | 🟡 Medium |
| **Search** | All `*.html` and `*.md` |
| **Detect** | `{{ value }}` interpolated inside `<script>` blocks without `| jsonify`; URL-bound values without `| url_encode` / `| uri_escape`; use of `| raw` or `| escape: false`. |
| **Rule** | See `liquid.md`, `security.md` |

**Fix**: Apply the right filter for the output context; never bypass escaping.

---

### Check 10: Sitemap leakage

| Property | Value |
| --- | --- |
| **Severity** | 🟡 Medium |
| **Search** | Pages under `d/`, `u/`, internal/confirmation pages |
| **Detect** | `sitemap: false` missing on a page that should be private (download landings, signup confirmations, internal helpers). |
| **Rule** | See `seo.md`, `frontmatter.md` |

**Fix**: Add `sitemap: false` to the front matter.

---

### Check 11: Duplicate `form_id` on the same page

| Property | Value |
| --- | --- |
| **Severity** | 🔴 High |
| **Search** | Content pages including `mail_form.html` or `form_api_signup.html` more than once |
| **Detect** | Two includes on the same page passing the same `form_id`. |
| **Rule** | See `forms.md` |

**Fix**: Give each form a unique `form_id` (used to namespace input ids).

---

## Output format

```markdown
### Architecture Violations

| Severity | Area | File | Issue | Rule Reference |
| --- | --- | --- | --- | --- |
| 🔴 Critical | Forms | _includes/foo_form.html | Missing privacy checkbox | forms.md → "Privacy checkbox" |
| 🔴 High | Layouts | _layouts/promo.html | Bypasses tracking.html — analytics added manually | layouts-and-includes.md → "Layout hierarchy" |
| 🟡 Medium | SEO | l/spotify/foo/index.md | seo_mobile_bandcamp_url points at open.spotify.com | seo.md → "Mobile deep-link metadata" |
| 🟡 Medium | Assets | assets/images/new_hero.jpg | Missing _320/_480/_640 + WebP variants | assets.md → "Images — responsive variants" |

### Summary

- **Front matter / SEO:** X issues
- **Layouts / Includes:** X issues
- **Analytics / Forms:** X issues
- **Assets:** X issues
- **Liquid / Security:** X issues

### Next Steps

For each violation, see the referenced rule in `.claude/rules/jekyll/` (or `.claude/rules/`) for full explanation and fix examples.
```

## How to invoke

- "Check architecture of the new download page"
- "Find Jekyll violations in this PR"
- "Validate front matter in cartas/dentro/"
- "Review the new lead form for compliance and analytics wiring"
- "Run architecture checks on the music link pages I just added"
