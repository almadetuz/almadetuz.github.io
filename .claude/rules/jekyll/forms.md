---
paths:
  - "_includes/form_*.html"
  - "_includes/mail_form*.html"
  - "_includes/*signup*.html"
  - "assets/js/forms.js"
  - "assets/js/api.js"
  - "u/**/*.html"
  - "**/*.md"
---

# Form and Signup Rules

This site uses two form patterns. Use the right one — don't mix them.

## Pattern 1: Custom signup API (`form_api_signup.html`)

Posts to `/u/confirmar.html`. Handled client-side by `FormSignup.add(...)` in `forms.js`, which sends the payload to the project's signup API (then Mailchimp downstream).

```liquid
{% include form_api_signup.html
  form_id=42
  form_activity_code="<activity-code>"
  title="Sí, quiero recibirlas"
  button="Suscribirme"
  generic_error_message="Algo ha fallado, vuelve a intentarlo en un rato."
%}
```

Required parameters:

- `form_id` — must be unique per page. Used as a suffix for every input/button id.
- `form_activity_code` — identifies the campaign/audience inside the signup API.
- `title`, `button`, `generic_error_message` — Spanish copy.

Required form structure (the include already gives you these — don't strip them):

- `<input type="email" required>` with browser validation.
- `<input type="checkbox" name="privacy" required>` linking to `/legal/privacidad.html`.
- A spinner inside the submit button (toggled by `forms.js`).
- An `.invalid-feedback` div for the API-returned error message.

## Pattern 2: Mail form (`mail_form.html`, `mail_form_lead.html`)

For pages that go through Mailchimp's hosted endpoint with group/audience IDs.

```liquid
{% include mail_form.html
  title="Infusiones de Tüz"
  subtitle="Cada poco tiempo te mando una historia"
  button="Sí, quiero recibirlas"
  line_bottom="Sin spam, sólo infusiones."
  class="bg-rose"
  form_id=1
  context_group_id=2225
  context_id=64
%}
```

Required:

- `form_id`, `context_group_id`, `context_id`. Optional: `user_id`, `audience_id` (have sane defaults).
- The privacy checkbox + GDPR copy is built into the include — don't override it away.

`mail_form_lead.html` is the lead-capture variant used inside `lead.html` layouts. Use it when the page exists primarily to capture an email — it tracks `Lead` correctly.

## Form ID uniqueness

`form_id` must be unique on the page. The include uses it to namespace ids (`api-signup-email-{{ form_id }}`, `api-signup-submit-{{ form_id }}`, etc.) — duplicates cause silently broken validation.

## Honeypot

`forms.js` includes a hidden `name` (or similar) field that bots fill in. The signup API rejects submissions where it's non-empty. Don't remove it. Don't add `display: none` via inline style — use the existing CSS rule.

## Privacy checkbox — non-negotiable

Every email-capture form on this site must have:

- A required `<input type="checkbox" name="privacy">`.
- A label that explicitly references `/legal/privacidad.html` ("política de protección de datos").
- A short paragraph below the form citing the RGPD (GDPR).

This is shipped in both `form_api_signup.html` and `mail_form.html`. If you build a new form from scratch (avoid this), copy the pattern verbatim.

## Validation

- Use Bootstrap's `novalidate` + `.invalid-feedback` pattern.
- HTML `required` + `type="email"` + the checkbox `required` provides the baseline.
- API errors are surfaced into a single `.invalid-feedback` element below the submit button — don't add toasts or alerts.

## Submission UX

- Submit button starts disabled (`.disabled` class). `forms.js` enables it once the privacy checkbox is checked and email is non-empty.
- Spinner shown during submission, hidden on success/error.
- On success, the form `action` (`/u/confirmar.html` or the Mailchimp page) takes over. No client-side redirect dance.

## Don'ts

- Don't add a form that posts to a URL not in this repo (or to a third-party endpoint without coordinating).
- Don't capture name, phone, address, or any field beyond email + consent — the signup flow is intentionally minimal.
- Don't bypass `FormSignup.add(...)` — the analytics hooks (`FormView`, `FormSubmit`, `FormError`) are wired through it.
- Don't add `autocomplete="off"` on the email input.
