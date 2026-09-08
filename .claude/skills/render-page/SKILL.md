---
name: render-page
description: Turns a finished copy doc from `_drafts/` into a real, working Jekyll page in this repository - correct front matter, the existing includes for containers, hero images and signup forms, the site's own CSS classes, and a build that passes. Use this whenever the user wants copy turned into an actual page, or says things like "monta la página", "render this draft", "pásalo a Jekyll", "convierte el copy en página", "build the landing from the draft", "ya está el copy, hazme la página", "publica esto en /taller/", or points at a file in `_drafts/` and asks for a page. Use it too when someone hands over raw Markdown prose that needs to become a site page, or when an existing page needs rebuilding to match the site's conventions. It is the second half of the landing-page-copy workflow: that skill writes the words, this one builds the page.
---

# Render page

You take a copy doc - the Markdown spec that `landing-page-copy` writes into `_drafts/` - and build the real page from it: front matter, includes, classes, forms. The copy is already decided. Your job is that the page renders, matches the site, and carries the copy without losing its voice.

The two failure modes: pasting the copy doc into a file more or less verbatim (it contains reasoning, section maps, alternative headlines and open questions that must never reach a reader), and hand-rolling HTML instead of using the includes the site already has (it looks fine and breaks the moment anyone changes the CSS).

## Workflow

### 1. Read the copy doc and separate copy from notes

The doc mixes two things. Everything except the actual page copy stays behind:

| In the doc | Goes into the page? |
|---|---|
| `## Copy` sections - H1, subtitles, body, CTAs | **Yes**, this is the page |
| Microcopy del formulario | **Yes**, as `mail_form_lead` parameters |
| SEO block | **Yes**, as front matter |
| Front matter of the doc itself (`title`, `status`) | No - the page gets its own |
| Mapa de secciones table | No - it is a plan, not content |
| `> Por qué:` lines under each section | No - reasoning for the human |
| H1 variants B and C | No - pick one (the doc's main H1 unless the user chose otherwise), the rest are for testing |
| Supuestos y huecos | No - but carry them into your report |

If you cannot tell whether a line is copy or commentary, it is commentary. Readers never benefit from seeing the scaffolding.

### 2. Work out where the page goes

The doc's SEO block should name the destination path. If it does, use it. If not, derive it from the slug and ask yourself which existing directory it belongs beside - `taller/`, `coser-y-cantar/`, `booking/`, `cartas/`, `infusiones/`.

Pages are directories with an `index.md`, never `slug.md`, because that is what gives the clean URL: `taller/coser-y-cantar-madrid/index.md` serves at `/taller/coser-y-cantar-madrid/`.

Never overwrite an existing `index.md` without reading it first and telling the user what is being replaced.

### 3. Write the front matter

```yaml
---
title: Coser y Cantar
layout: page
sitemap: false
seo_description: "Espacio de arteterapia creativa: costura, voz, cuerpo y música en vivo"
seo_image: /assets/images/coser_y_cantar_seo.jpg
seo_image_width: 1280
seo_image_height: 720
---
```

- `layout: page` for every landing page. It is what all of them use, and it wires in the header, footer, cookie consent and the `PageView` analytics event. Do not reach for `lead` - that layout fires a `Lead` conversion on page load, which is for post-signup pages; on a landing page the form fires it at the right moment.
- `sitemap: false` when the page is edition-specific (a dated workshop), internal, or duplicates a canonical URL that lives elsewhere. Evergreen public pages (`infusiones/`, `mis-canciones/`) are indexed - omit the key.
- `seo_description` in Spanish, ≤160 characters, taken from the doc's SEO block.
- `seo_image` is 1280×720 for a non-music page, and must be declared with its width and height. If the image does not exist yet, still write the path you expect (`/assets/images/<slug>_seo.jpg`) and report it as missing - a broken share image is a fixable one-line problem, a forgotten one is invisible.

Never write `<meta>` or `<title>` tags into the page. `_includes/seo.html` builds all of that from front matter, and a hand-written tag would duplicate it.

### 4. Translate the copy, section by section

The mapping from copy doc to markup:

| Copy doc element | Renders as |
|---|---|
| Hero with a photo behind the headline | `block_title_image.html` with `image`, `title`, and `tag='h1'` for the first one |
| A block of prose | `block_container_start.html` … prose … `block_container_end.html` |
| A block that needs to stand out | the same, plus `class_bg="bg-white"` |
| Section heading inside prose | `## Texto` followed by a kramdown attribute line |
| A pulled-out line or refrain | `### Texto` + `{: .fw-bold .text-center }` |
| CTA / signup block | `mail_form_lead.html` |
| Photo beside text | `![Alt](/assets/images/x_480.jpg){: .img-right }` |
| Link to another page | `button_image.html` wrapped in `block_buttons_start/end.html` |

**All prose must live inside a container block.** The container includes open a `<div markdown="1">`, which is what lets kramdown process Markdown inside them. Text written between `block_container_end.html` and the next `block_container_start.html` sits in raw HTML context and renders as a wall of unformatted text.

Exact parameters for every include, with defaults and examples, are in `references/includes.md`. Read it before writing - guessing a parameter name produces an empty string, silently.

### 5. Keep the voice intact

The copy doc's line breaks and emphasis are deliberate; this site's pages are written in short lines that break mid-thought. Preserve them:

- End a line with `\\` to force a line break inside a paragraph. This is the site's signature rhythm - `coser-y-cantar/madrid-16-nov/index.md` uses it constantly. A paragraph reflowed into one long line is a real loss.
- `<br>` inside include parameters (`title=`, `subtitle=`), since those are HTML attributes, not Markdown.
- Keep `**bold**` and `_italics_` exactly where the copy doc put them - they carry the skim-reading argument.
- Keep every accent and `ü`. `Tüz` is the brand.

Headings take a kramdown attribute list on the following line to pick up the site's typography:

```markdown
## Sin agenda, sin prisa,<br>sin necesidad de _"ser productivas"_.
{: .fw-bold .text-center }
```

Available classes are listed in `references/includes.md`. Use those; do not invent class names and do not write inline `style=` attributes.

### 6. Place the forms

Every signup block is `mail_form_lead.html` with `class="bg-rose"`:

```liquid
{% include mail_form_lead.html
   title="<i>Coser y Cantar:<br>Mi vida a puntadas</i>"
   subtitle="<strong>Cuándo</strong>: Sábado 16 Nov<br><strong>Precio</strong>: 100€<br><br>Déjanos tu email y te contamos cómo venir."
   button="Quiero apuntarme"
   line_bottom="Darse de alta es gratis, darse de baja también."
   class="bg-rose"
   form_id="1"
   context_type="web"
   context_name="coser-y-cantar"
%}
```

- **`form_id` must be unique on the page.** Number them `"1"`, `"2"`, `"3"` down the page. The include uses it to namespace every element id, so a duplicate silently breaks validation on both forms.
- `context_name` is the same on every form on the page - it identifies the page in analytics, not the individual form.
- The `subtitle` carries the practical facts (cuándo, dónde, precio, plazas). That is where they belong on this site.
- Repeat the form every 400-600 words on a long page, and always right after the strongest emotional beat. Keep the same `button` promise throughout unless the copy doc deliberately varies it.
- The privacy checkbox, GDPR text and honeypot are inside the include. Never build a form by hand, and never strip those.

### 7. Images: placeholders, not guesses

The copy doc does not specify photos, and picking the wrong face for a personal story is worse than leaving a gap. Write a `TODO_` placeholder and flag it:

```liquid
<!-- TODO: imagen de fondo del hero, 480px de ancho -->
{% include block_title_image.html
   image='/assets/images/TODO_hero_480.jpg'
   title='¿Y si la mejor manera de desconectar fuera redescubrir lo que nuestras abuelas ya sabían?'
%}
```

The page will build with a broken image, which is the point: it is visible and one line to fix. Collect every placeholder into your report.

If the copy doc names a specific existing image, or the user tells you which to use, use it - check the file exists first.

### 8. Build

```bash
bundle exec jekyll build
```

It takes a couple of seconds. It catches Liquid syntax errors, bad include names and malformed front matter - the failures that are invisible on reading. If it fails, fix it and build again; do not report a page that does not build.

Two lines in the output are normal and not your problem: `To use retry middleware with Faraday v2.0+...` and `Jekyll Feed: Generating feed for posts`. A real failure says `Error:` and names a file. Confirm the page appeared at `_site/<path>/index.html`.

A clean build does not mean a correct page. It only means the templating is valid.

## Report back

After the build passes, tell the user, briefly:

- The path written, and the URL it serves at.
- Which sections became which includes, if you made a non-obvious choice.
- **Every `TODO_` image**, with what each slot needs (hero background, photo beside the story, `seo_image` at 1280×720).
- Anything from the doc's "Supuestos y huecos" that is still open.
- Anything you dropped and why.

Do not paste the page back. The file is the deliverable.

## Constraints

These exist because the site is a small, hand-maintained Jekyll build where consistency is the whole design system:

- **Use the existing includes.** If a block looks like something the site already does, it is - check `references/includes.md` before writing HTML. New includes are for things reused in 2+ places; a one-off does not earn one.
- **Do not add CSS or JS.** No `<style>`, no inline `style=`, no `<script>`, no CDN tags. If the copy genuinely needs a visual treatment that no class provides, say so in your report and let the user decide.
- **Do not touch `_sass/`, `assets/js/`, or the layouts** to make a page work. A page that needs a layout change is a conversation, not a side effect.
- **External links** always get `target="_blank" rel="noopener noreferrer"`.
- **No health claims.** First-person lived experience ("a mí me salvó") is the register; a promise that the workshop treats or cures anything is not, and it is a legal line as well as an ethical one. If the copy doc contains one, do not render it - flag it.

The repo's own conventions are documented in `.claude/rules/jekyll/` (`frontmatter.md`, `layouts-and-includes.md`, `forms.md`, `assets.md`, `liquid.md`, `seo.md`). Read the relevant one when you hit a case this skill does not cover.

## Reference

`references/includes.md` - every include's parameters and defaults, the available CSS classes, and a worked example showing a copy doc section beside the markup it becomes. Read it before writing the page.

Existing pages worth opening to see the conventions in practice:
- `coser-y-cantar/madrid-16-nov/index.md` - the long-form reference: hero images, alternating backgrounds, seven forms, FAQ block.
- `infusiones/index.md` - short evergreen page, `img-left` hero.
- `index.md` - home page, `button_image` grid at the bottom.
