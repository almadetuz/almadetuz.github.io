---
paths:
  - "**/*.html"
  - "**/*.md"
---

# Liquid Templating Rules

## Output and escaping

- `{{ value }}` auto-escapes for HTML — safe for element bodies and quoted attributes.
- For URLs in `href`/`src` query strings: `{{ value | url_encode }}`.
- For full URIs that may contain special chars: `{{ value | uri_escape }}`.
- For values emitted into `<script>` blocks: `{{ value | jsonify }}` (never raw interpolation).
- For values emitted into JS attribute event handlers (`onclick=`): don't. Use `data-*` attributes and read them from JS.
- Never use `| raw` or `| escape: false` — there is no use case in this repo.

## Whitespace control

- Use `{%- … -%}` and `{{- … -}}` to strip whitespace around control tags when generating compact HTML (especially inside `<head>` and inside arrays of meta tags).
- Don't use whitespace control in human-edited content blocks — it makes the source noisy.

## Filters and patterns used in this repo

| Need | Use |
| --- | --- |
| Absolute URL | `{{ page.url | absolute_url }}` |
| Relative URL | `{{ '/path' | relative_url }}` |
| Default value | `{{ include.foo | default: 'fallback' }}` |
| Date format | `{{ page.date | date: '%Y-%m-%d' }}` |
| Cache-bust query | `?v={{ site.time | date: '%s' }}` (used in `_layouts/default.html` for stylesheets) |
| Pluralise / count | `{{ collection | size }}` |

## Conditionals and loops

- Prefer `{% if include.foo %}` over `{% if include.foo != nil %}` — Liquid treats empty strings as truthy, so test with `{% if include.foo and include.foo != "" %}` only when the empty case matters.
- Iterate Jekyll collections with `{% for item in site.singles %}`. Don't iterate `_data` files inside hot loops on every page — extract to an include if reused.
- Avoid nested loops over large collections in templates that render on every build; pre-shape data in `_data/*.yml` instead.

## Performance

- `{% include %}` re-parses on each call — avoid it inside tight loops if the include is heavy. Inline a small partial when looping.
- Use `{% capture %}` sparingly; it allocates strings.
- Don't call `| where` or `| sort` repeatedly with the same arguments inside a loop — capture the filtered list once into a variable.

## Things to avoid

- `{% include_relative %}` outside of `_includes/` — it bypasses the include path checks.
- Building Liquid logic from front matter strings (e.g. `{% include {{ page.partial }} %}`) — this used to fail and is fragile; pick an include explicitly.
- Conditional `{% include %}` based on the URL string of the request — Jekyll is static, there is no request URL at build time. Use `page.url` (the path of the file being built) instead.

## Comments

```liquid
{%- comment -%}
This block does X. Inputs: page.foo, include.bar.
{%- endcomment -%}
```

Use these to document non-obvious template logic, especially in shared includes.
