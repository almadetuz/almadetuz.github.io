# Includes, classes and a worked example

Everything here is verified against `_includes/` and `_sass/`. Parameter names that do not exist render as empty strings with no error, so check rather than guess.

- [Containers](#containers)
- [Hero with background image](#hero-with-background-image)
- [Signup form](#signup-form)
- [Buttons](#buttons)
- [Images in prose](#images-in-prose)
- [CSS classes](#css-classes)
- [Worked example](#worked-example)

## Containers

Every block of prose lives between these. The opening include emits `<div markdown="1">`, which is what makes Markdown work inside it.

```liquid
{% include block_container_start.html %}

Prose in Markdown. Headings, bold, lists, line breaks all work here.

{% include block_container_end.html %}
```

| Parameter | Default | Use |
|---|---|---|
| `class_container` | `container-fluid mt-3 mb-3 rounded-2` | Rarely overridden. `container-fluid` alone removes the vertical margins. |
| `class_bg` | *(none)* | `bg-white`, `bg-rose`, `bg-yellow`, `bg-dark` - alternate to separate sections visually |
| `class_row` | `row pt-2` | `row` to drop the top padding |
| `class_col` | `col` | Bootstrap column classes |

`block_container_next.html` closes the current row and opens a new one without closing the container - use it for a two-part block. It takes `class_row` and `class_col`.

Alternating `class_bg="bg-white"` on every second block is how the long pages get their rhythm.

## Hero with background image

```liquid
{% include block_title_image.html
   image='/assets/images/foto_amanda_faro_ukelele_480.jpg'
   title='¿Y si la mejor manera de desconectar fuera redescubrir lo que nuestras abuelas ya sabían?'
%}
```

| Parameter | Default | Notes |
|---|---|---|
| `image` | *(required)* | Absolute path from site root. 480px-wide variant is the usual choice. |
| `title` | *(required)* | The headline. Plain text or inline HTML - it is an attribute, so use `<br>` not a line break. |
| `tag` | `h1` | `h1` for the page's one hero, `h2` for every later one. One `h1` per page. |
| `tag_class` | `titular text-start` | `titular text-center` to centre it |
| `text_class` | `text-white` | The overlay darkens the photo, so white text is usually right |
| `height` | `400px` | |
| `height_mobile` | *(same as `height`)* | Below 400px wide. A portrait photo needs a tall box (e.g. `140vw`) or it shows up as a thin strip. |

Used mid-page as a section break, not only at the top - see `coser-y-cantar/madrid-16-nov/index.md`, which has four.

## Signup form

```liquid
{% include mail_form_lead.html
   title="Infusiones de Tüz"
   subtitle="<strong>Cuándo</strong>: Sábado 16 Nov 2024<br><strong>Dónde</strong>: Aravaca, Madrid<br><strong>Precio</strong>: 100€<br><br>Déjanos tu email y te contamos lo que hay que hacer para venir."
   button="Quiero apuntarme"
   line_bottom="Darse de alta es gratis, darse de baja también."
   class="bg-rose"
   form_id="1"
   context_type="web"
   context_name="coser-y-cantar"
%}
```

| Parameter | Notes |
|---|---|
| `title` | The offer's name. Inline HTML allowed (`<i>`, `<br>`). |
| `subtitle` | Where the practical facts go: cuándo, dónde, duración, grupo, precio. `<br>` for line breaks. |
| `button` | First person, specific: "Quiero apuntarme", "Sí, quiero recibirlas". Never "Enviar". |
| `line_bottom` | The reassurance under the button. |
| `class` | `bg-rose` on this site. |
| `form_id` | **Unique per page.** `"1"`, `"2"`, `"3"`… It namespaces every element id; duplicates break validation silently. |
| `context_type` | `"web"` |
| `context_name` | Identifies the page in analytics. Same value on every form on the page. |
| `gdpr_id`, `error_title`, `success_title`, `success_message` | Optional, sane defaults. |

The privacy checkbox, the RGPD paragraph and the honeypot are inside the include. They are legally required and must not be stripped or overridden.

Two other form includes exist and are **not** the default: `mail_form.html` (raw Mailchimp, needs `audience_id`/`gdpr_id` - only when reusing an existing audience) and `form_api_signup.html` (custom signup API, needs a `form_activity_code`). Use `mail_form_lead.html` unless the user names one of the others.

## Buttons

Cards linking to other pages, in a grid:

```liquid
{% include block_buttons_start.html %}
{% include button_image.html
   title="Mis canciones"
   url="/mis-canciones"
   image="/assets/images/amanda_btn_la_montana_320.jpg"
   title_class="text-soft-black"
%}
{% include block_buttons_end.html %}
```

`button_image.html`: `title`, `url`, `image` (320px variant), `title_class`, `icon` (Font Awesome, default `fa-chevron-circle-right`), `icon_class`.

`button_link.html` is a tracked CTA button - it fires `CTAClick`/`InitiateCheckout` analytics events and needs a unique `cta_id`. It is for checkout and purchase flows, not for email capture. Parameters: `text`, `url`, `cta_id`, `cta_prefix` (default `checkout`), `class`, `subtext`, `target`, plus `fb_*` and `gads_event_name` overrides.

`scroll_down_arrow.html` drops a chevron that scrolls one screen down. Optional `class`: `scroll-down-arrow-center|left|right`.

## Images in prose

Plain kramdown inside a container block:

```markdown
![Amanda](/assets/images/amanda_foto_alas_en_mi_480.jpg){: .img-right }
```

Content pages use this rather than `<picture>`/`srcset` - the responsive-variant includes are for the music link pages.

Classes: `img-left`, `img-right`, `img-center`, `img-center-320`, `img-center-480`, `img-center-640`. They float and resize responsively (below the mobile breakpoint the floats collapse).

Image paths follow `assets/images/<description>_<width>.{jpg,webp}` with widths 320/480/640 and a ~1024 "full" variant. Share images are `<slug>_seo.jpg` at 1280×720.

## CSS classes

Site classes, defined in `_sass/main.scss` and `_sass/fonts.scss`:

| Class | What it does |
|---|---|
| `titular` | Display type for the main headline |
| `subtitular` | Secondary display type |
| `bg-rose`, `bg-white`, `bg-yellow`, `bg-dark` | Section backgrounds |
| `text-white`, `text-soft-white`, `text-soft-black` | Text colours |
| `img-left`, `img-right`, `img-center`, `img-center-320/480/640` | Floated and centred images |

Everything else comes from Bootstrap 5.3: `fw-bold`, `text-center`, `text-start`, `text-end`, `mt-3`, `mb-3`, `rounded-2`, `col-sm-6`, `container-fluid`, `row`, `col`.

Applied to a Markdown element with a kramdown attribute list on the line below:

```markdown
## Crear me cura cuando lo hago desde lo más profundo de mi ser
{: .fw-bold .text-center }
```

If a class is not in the tables above and not a Bootstrap utility, it does not exist. Do not invent one, and do not add inline `style=`.

## Worked example

A section of a copy doc:

```markdown
### 3. La propuesta
**H2:** Coser y Cantar: Mi vida a puntadas
**Cuerpo:**
Te proponemos redescubrir ese ritual de conexión y autocuidado en un espacio
de arteterapia creativa.

En un ambiente íntimo, a través del movimiento, la costura y la voz.

> Por qué: nombra la oferta después de que el problema ya está instalado.
```

Becomes:

```liquid
{% include block_container_start.html %}

## Coser y Cantar:<br>Mi vida a puntadas
{: .fw-bold .text-center }

Te proponemos redescubrir ese ritual de **conexión** y **autocuidado** en un espacio de **arteterapia creativa**.

En un ambiente **íntimo**, a través del **movimiento**, la **costura** y la **voz**.

{% include block_container_end.html %}
```

What happened: the `> Por qué:` line was dropped (it is reasoning for the human), the `**H2:**` label became an actual `##` heading with its attribute list, the bold from the copy doc survived, and the whole thing sits inside a container so kramdown renders it.
