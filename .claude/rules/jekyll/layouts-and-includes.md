---
paths:
  - "_layouts/**/*.html"
  - "_includes/**/*.html"
  - "**/*.md"
---

# Layouts and Includes

## Layout hierarchy

```
default.html (base — head, CSS, UTM globals, form_js, bootstrap_js)
└── tracking.html (cookie consent + analytics init)
    ├── page.html       — generic content (header + main + footer)
    ├── landing.html    — page + more.html block in footer
    ├── legal.html      — page + cookie preferences modal
    ├── link.html       — clean music-link page (white bg, deep linking)
    ├── confirm.html    — post-action confirmation
    ├── lead.html       — fires Lead conversion event
    ├── checkout.html   — purchase flow
    ├── suscribed.html  — subscription welcome
    ├── clean.html      — main only, no header/footer
    └── download.html   — audio player + download button (page page-download)
```

Rules:

- All page-style layouts inherit from `tracking.html` (don't bypass it — that's how analytics + consent get wired in).
- Don't introduce a new layout when an existing one + a tweaked `body_class` will do.
- A new layout requires:
  - `layout: tracking` (or `default` for very specialised pages)
  - A `body_class:` that maps to a CSS rule
  - SEO is already handled in `default.html` via `_includes/seo.html`; don't re-declare meta tags

## When to create a new include

Create `_includes/<name>.html` only when the snippet is:

1. **Reused** in 2+ places, OR
2. **Parameterisable** in a way that's clearer than copying HTML, OR
3. **Domain-meaningful** on its own (`mail_form`, `link_track_image`, `product_pendientes_alma_beloved`).

Don't create an include for a single-use 4-line snippet — inline it.

## Include parameter conventions

```liquid
{% include component.html
  required_param="value"
  numeric_id=42
  optional_param="value"
%}
```

- Quote string parameters with double quotes.
- Numeric IDs (`form_id`, `context_group_id`) may be unquoted.
- For optional parameters, use `{{ include.foo | default: 'sane-default' }}`.
- Wrap optional sections with `{% if include.foo %}…{% endif %}`.
- Document non-obvious parameters at the top of the include with a Liquid comment:
  ```liquid
  {%- comment -%}
  Params:
    title (required) — heading
    form_id (required) — must be unique per page
    context_group_id (optional) — Mailchimp group
  {%- endcomment -%}
  ```

## Existing include families — do not duplicate

| Family | Files | Use for |
| --- | --- | --- |
| Page chrome | `header.html`, `footer.html`, `navigation.html`, `more.html` | Site-wide layout fragments |
| Analytics | `amplitude_js.html`, `fb_js.html`, `google_tag.html`, `matomo_js.html`, `cookie_js.html`, `scroll_js.html` | Tracking + consent |
| SEO | `seo.html` | Already included by `default.html` — never include again |
| Forms | `mail_form.html`, `mail_form_lead.html`, `form_api_signup.html`, `form_js.html` | Email capture |
| Container blocks | `block_container_start/end/next.html`, `block_buttons_start/end.html`, `block_title_image.html` | Bootstrap-grid wrappers |
| Buttons | `button_image.html`, `button_link.html`, `scroll_down_arrow.html` | Calls to action |
| Links / music | `link_track*.html`, `link_js.html`, `link_video.html`, `artist_links.html`, `song_links.html` | `/l/` pages and music platform deep linking |
| Products | `product_pendientes_alma_beloved.html`, `product_pendientes_alma_en_flor.html`, `product_colgante_alma_ciclica.html` | Merchandise |

If a new feature looks like one of these, extend the existing include — do not fork it.

## Order of includes inside a layout

For `tracking`-derived layouts the canonical order is:

1. `header.html`
2. `<main>{{ content }}</main>`
3. `more.html` (landing only)
4. `footer.html`

Analytics, cookie consent, and Bootstrap JS are attached by `default.html`/`tracking.html` — leaf layouts must not re-include them.
