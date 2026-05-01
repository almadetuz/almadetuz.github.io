---
paths:
  - "**/*.md"
  - "_layouts/**/*.html"
  - "_singles/**/*.md"
  - "cartas/**/*.md"
  - "coser-y-cantar/**/*.md"
  - "infusiones/**/*.md"
  - "mis-canciones/**/*.md"
  - "taller/**/*.md"
  - "legal/**/*.md"
  - "d/**/*.md"
  - "u/**/*.html"
  - "l/**/*.md"
---

# Front Matter Rules

Every Markdown/HTML page in this repo has a YAML front matter block. The required keys depend on the chosen layout. Setting fields that don't apply is fine, but missing required fields causes silent SEO/UX bugs.

## Universal requirements

```yaml
---
title: <string>          # Used for <title>, og:title, twitter:title
layout: <layout-name>    # See _layouts/ for the full list
---
```

`description` falls back to `site.description` if you omit `seo_description` — but every public page should set its own `seo_description` (≤160 chars, Spanish).

## SEO fields (any public page)

```yaml
seo_description: <string, ≤160 chars>
seo_image: /assets/images/<name>.jpg     # Absolute path from site root
seo_image_width: 1280
seo_image_height: 720
```

Use a 1280×720 JPEG sized image for `seo_image` (the site default). Path must start with `/assets/images/`.

## `layout: page` / `layout: landing` / `layout: legal` / `layout: clean`

Same fields as Universal + SEO above. No additional requirements.

## `layout: link` (music platform link page under `/l/`)

Required:

```yaml
layout: link
title: <song or artist name>
seo_description: <string>
seo_image: /assets/images/<artwork>_seo.jpg
seo_image_width: 1280
seo_image_height: 1280            # Square artwork
seo_type: music.song              # or music.album, music.playlist
```

Recommended (any subset, depending on what the link points to):

```yaml
seo_audio: /assets/audio/<preview>.mp3
seo_audio_type: audio/mpeg
seo_music_duration: <seconds, integer>
seo_music_album: <album URL>
seo_music_album_track: <integer>
seo_music_release_date: <YYYY-MM-DD>
seo_music_musician: <artist URL>

# Mobile deep-link targets (any subset)
seo_mobile_bandcamp_url: https://artist.bandcamp.com/album/<slug>
seo_mobile_spotify_url:  https://open.spotify.com/album/<id>
seo_mobile_youtube_url:  youtube://<video-id>
seo_web_youtube_url:     https://youtube.com/watch?v=<video-id>
```

> Bandcamp is the primary album destination as of 2025. Use `seo_mobile_bandcamp_url` unless there is a specific reason to point at Spotify.

## `layout: download` (audio download page under `/d/`)

```yaml
layout: download
title: <string>
mp3_url: /assets/audio/<file>.mp3
audio_title: <string>              # Optional — header above the player
download_filename: <name>.mp3      # Optional, default 'cancion.mp3'
auto_download: true                # Optional — triggers download ~1.5s after load
sitemap: false                     # REQUIRED — these pages must not be indexed
```

URLs under `/d/` should include a short hash suffix (`dentro-cc373161`) so that the path is not guessable from the song slug.

## `layout: lead` (lead capture page)

```yaml
layout: lead
title: <string>
seo_description: <string>
seo_image: /assets/images/<lead>_seo.jpg
seo_image_width: 1280
seo_image_height: 720
fb_learn: true                     # Optional — flips the FB Pixel into "Learn" optimisation
```

The layout fires `Lead` (Amplitude + FB Pixel + Google Ads `lead` conversion) on `DOMContentLoaded`. Don't double-fire it from page content.

## `layout: confirm` / `layout: suscribed`

Standard Universal + SEO fields. These are post-action pages — keep `seo_description` short and confirm-y.

## Singles (`_singles/`)

```yaml
---
title: <song title>
layout: page
year: <YYYY>
sitemap: false                     # If the canonical URL lives elsewhere (e.g. /cartas/)
---
```

## Linting checklist

When adding a page, verify:

- [ ] `title` is set and unique on the site.
- [ ] `layout` matches one of the files in `_layouts/`.
- [ ] `seo_description` is set on any page that should be shareable.
- [ ] `seo_image` exists in `assets/images/` with the declared dimensions.
- [ ] If the page is a download/confirmation/internal helper, `sitemap: false` is set.
- [ ] Music pages use `seo_mobile_bandcamp_url` (not `seo_mobile_spotify_url`) unless there's a documented reason.
