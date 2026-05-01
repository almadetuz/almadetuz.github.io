---
description: Review pending Jekyll/HTML/SCSS/JS changes against project conventions
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---

I'll review the pending changes (staged + unstaged) for this Jekyll project.

## Steps

1. **Read any related plan** under `.claude/plans/` if one exists (skip silently if not).
2. **Get changed files** with `git status --short` and `git diff --stat`.
3. **Read the diff** with `git diff` (staged + unstaged) plus `git diff --cached`.
4. **Run the rules**:
   - `.claude/rules/security.md`
   - `.claude/rules/code-styled.md`
   - All applicable files under `.claude/rules/jekyll/` based on which paths changed.
5. **Sanity-build** if Jekyll/Liquid changes exist: confirm there are no obvious build-breakers (mismatched `{% if %}` / `{% endif %}`, missing front matter, unknown layout names) by reading the affected files end-to-end.
6. **Provide review** with the structured output below.

## Review focus (Jekyll-specific)

### Content & front matter
- `title` and `layout` present; `layout` exists in `_layouts/`.
- `seo_description` present and ≤160 chars on public pages.
- `seo_image` path exists with the declared dimensions.
- Internal/download pages have `sitemap: false`.
- Music link pages: correct `seo_type`, `seo_mobile_bandcamp_url` for Bandcamp destinations, etc.

### Layouts & includes
- New layouts inherit from `tracking.html` (or `default.html` for very specialised needs).
- No duplication of `_includes/seo.html`, header/footer, or analytics blocks.
- Includes use named parameters with `{{ include.foo | default: '...' }}` for optional ones.
- No new include where an existing one in the right family would do.

### Liquid & escaping
- Values in `<script>` blocks use `| jsonify`; values in URLs use `| url_encode` / `| uri_escape`.
- No `| raw` or `| escape: false`.
- `{% include %}` not abused inside hot loops.

### Analytics
- Events go through `amp_event` / `fb_event` / `gads_event`.
- `web_event_prop` is reused; no PII in custom properties.
- Cookie consent is honoured; no tracker fires before consent.
- `transaction_id` / UTM persistence in `_layouts/default.html` is not modified without good reason.

### Forms
- New email-capture forms use `form_api_signup.html` or `mail_form.html`.
- Privacy checkbox + GDPR copy + honeypot present.
- `form_id` unique per page; `FormSignup.add(...)` registered.

### Assets
- New images ship with `_320/_480/_640/.{jpg,webp}` variants.
- Vendor JS/CSS not edited in place — versioned filenames bumped instead.
- No CDN `<script>` introduced.
- Stylesheet load order in `default.html` preserved.

### Security
- No secrets, tokens, signing keys, or non-public IDs committed.
- All `target="_blank"` links have `rel="noopener noreferrer"`.
- No open-redirect surface in `/l/` pages or `link.js`.

### General code quality
- Indentation, naming, and file placement match `code-styled.md`.
- Spanish copy keeps diacritics and is grammatical.
- No accidental `_site/` or `vendor/` files staged.

## Output format

```
## Summary
<one paragraph: what changed, scope, and overall risk>

## Findings

### [Critical|High|Medium|Low] <Title>
- File: path/to/file.ext (line N if relevant)
- Issue: <what is wrong>
- Rule: <rule filename → section>
- Suggestion: <concrete fix>

## Recommendation
Approve | Request changes | Needs discussion

## Suggested follow-ups (optional)
- <item> (rationale)
```

Use the same severity scale as `architecture-checker`:
🔴 Critical / 🔴 High / 🟡 Medium / 🔵 Low.
