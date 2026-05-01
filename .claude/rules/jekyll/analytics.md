---
paths:
  - "_layouts/**/*.html"
  - "_includes/**/*.html"
  - "assets/js/**/*.js"
---

# Analytics Rules

## The four trackers

| Tracker | Include | Helper | Notes |
| --- | --- | --- | --- |
| Amplitude | `amplitude_js.html` | `amp_event(name, props)` | Primary product analytics |
| Facebook Pixel | `fb_js.html` | `fb_event(name, ...)` | Conversion + remarketing |
| Google Tag / Ads | `google_tag.html` | `gads_event(action, label)` | Google Ads conversions |
| Matomo | `matomo_js.html` | direct `_paq.push(...)` | Privacy-focused, optional |

All four are wired in `tracking.html` and gated by cookie consent (`cookieconsent_v3`). Don't fire them from anywhere else.

## Standard event properties

`web_event_prop` is built once in `_layouts/default.html` and contains:

```
page_title, page_domain, page_location, page_path, page_url,
utm_source, utm_medium, utm_campaign, utm_term, utm_content, utm_id,
referrer, referring_domain
```

Pass it to every Amplitude event:

```javascript
amp_event('PageView', web_event_prop);
amp_event('CustomEvent', { ...web_event_prop, custom: 'value' });
```

## UTM and click ID persistence

Stored in `localStorage.adt_last_utms`. Persisted keys:

```
utm_source, utm_medium, utm_campaign, utm_term, utm_content, utm_id,
fbclid, campaign_id, ad_id, transaction_id
```

- `transaction_id` is a fresh UUID minted only when a new `fbclid` arrives — used for Meta CAPI dedup. Don't change this without coordinating with the server-side CAPI integration.
- Don't add ad-hoc keys to this object — extending it requires updating the form payload too.

## Standard event names (PascalCase)

| Event | When |
| --- | --- |
| `PageView` | Generic page load (most layouts) |
| `Lead` | Lead-capture page view (`lead.html` layout) |
| `FormView` | Email-capture form scrolled into view |
| `FormSubmit` | Form successfully submitted |
| `FormError` | Form failed validation or API call |
| `LinkClick` | Music platform button click |
| `DeepLink` | Mobile deep-link attempt (success/failure) |

When adding a new event, use PascalCase and reuse one of these if it fits — don't shadow them with similar names like `pageview` or `Form_Submit`.

## Environment guard

```javascript
var environment = document.location.host.includes("{{ site.host }}") ? "production" : "devel";
```

Use this guard if you ever need to log debug events only in dev. Production tracking must be the default; never wrap a real production event in an environment check that suppresses it.

## Forms — required wiring

A new form must:

1. Live inside `<form id="…" novalidate>` with a unique `form_id`.
2. Call `FormSignup.add(prefix, form_id, form_activity_code)` so `forms.js` registers it.
3. Fire `FormView` (via the existing scroll observer) and `FormSubmit`/`FormError` from the registered handlers — don't roll your own.
4. Honour the privacy checkbox and honeypot — see `_includes/form_api_signup.html` for the canonical pattern.

## What never goes into events

- Email addresses, names, phone numbers, free-text user input.
- Any PII or anything that could be combined with another value to identify a user.
- Internal-only IDs that aren't meant to be public.

If a debugging case really needs PII, log it client-side to the console (gated by the `devel` environment) and do not send it to any tracker.
