---
paths:
  - "**/*.md"
  - "**/*.html"
  - "**/*.js"
  - "**/*.yml"
---

# Security Rules — Static Jekyll Site

This site is a static Jekyll build deployed to GitHub Pages. The threat model is therefore not "server compromise" but: **secret leakage in the public repo, XSS in rendered Liquid/HTML, unsafe redirects/deep links, and broken privacy/consent compliance (GDPR + ePrivacy)**.

## Key Principles

- **No secrets in the repo.** API keys, signing secrets, write tokens, admin URLs, or any non-public IDs must never be committed. The repo is public — every commit is permanent. If a secret leaks, rotate it before just removing it from a later commit.
- **Public IDs are OK** in client-side code (Amplitude API key, Google Tag ID, Facebook Pixel ID, Mailchimp public IDs). They are designed to be public and rate-limit-protected on the vendor side.
- **Liquid output escaping.** Liquid auto-escapes `{{ variable }}` for HTML by default, but only inside HTML element bodies and quoted attributes. When emitting into URLs, JS, or unquoted attributes you must use the right filter:
  - URLs: `{{ value | url_encode }}` (path/query) or `{{ value | uri_escape }}` (full URI)
  - JS strings: `{{ value | jsonify }}` — never interpolate raw page/include data into a `<script>` block
  - HTML attributes: keep them quoted; never build `href="javascript:..."` from front matter
- **No `raw` HTML from untrusted/external sources.** Don't pipe `| raw` or use `{% include_relative %}` on files outside the repo. All `_includes/` and content come from this repo.
- **Front matter is trusted but reviewed.** Anything you set in front matter ends up in HTML — treat it like code, not user data.
- **External links** that open in a new tab must include `rel="noopener noreferrer"` along with `target="_blank"`.
- **Deep links / redirects** (`/l/...`, `link_js.html`) must point at known platforms (Spotify, YouTube, Apple Music, Bandcamp, SoundCloud). Never accept the destination from a URL query parameter — it would turn the site into an open redirect.
- **HTML forms post only to trusted endpoints.** `form_api_signup.html` posts to `/u/confirmar.html` (handled client-side by `forms.js` + `api.js`). Any new form must specify an explicit `action`; never default it to a user-controlled value.

## Privacy & Consent (GDPR / ePrivacy)

- **Cookie consent must gate all non-essential trackers.** Amplitude, Facebook Pixel, Google Tag, and Matomo only fire after the user grants consent via `cookieconsent_v3`. Do not bypass it for "just one tag".
- **Privacy checkbox is mandatory** on every email-capture form. See `form_api_signup.html` — there is a required `privacy` checkbox linking to `/legal/privacidad.html`. Re-use that pattern; do not ship a form without it.
- **Honeypot.** Lead/signup forms should keep the existing spam-trap pattern in `forms.js` (the API rejects submissions with a non-empty hidden field). Don't remove it when refactoring.
- **No PII in analytics events.** `web_event_prop` intentionally contains URL/UTM/referrer data — never add email, name, phone, or free-text user input. Amplitude/FB events are aggregated, not personal.
- **Legal links must stay reachable** from every public layout's footer (`footer.html`) — privacy and cookies pages come from `_data/legal.yml`.

## Tracking Identifiers

- `localStorage.adt_last_utms` persists UTM/click attribution. Treat it as user-owned data — clearing localStorage must not break the site.
- `transaction_id` is minted from a fresh `fbclid` for Meta CAPI dedup. Don't reuse it across sessions if no new `fbclid` arrives — the existing logic in `_layouts/default.html` is correct, leave it.

## Never Read, Write or Commit

- `.env` files or any credential files
- API keys, signing secrets, OAuth client secrets, or webhook secrets in any committed file (the repo is public)
- PII (emails, names, phone numbers) anywhere in front matter, content, or analytics events
- Build artefacts under `_site/` or `vendor/` (already excluded — keep them excluded)

## Things to Never Do

- Use `{{ user_input | raw }}` patterns or build URLs without escaping query parts.
- Ship a form without the privacy checkbox + link to `/legal/privacidad.html`.
- Fire any analytics or third-party script before cookie consent is granted.
- Add `target="_blank"` without `rel="noopener noreferrer"`.
- Accept a redirect destination from a URL parameter without an allowlist of known hosts.

## When in doubt

Check `_includes/seo.html`, `_includes/form_api_signup.html`, `_includes/cookie_js.html`, and `assets/js/forms.js` — those are the canonical patterns for safe links, forms, and consent on this site.
