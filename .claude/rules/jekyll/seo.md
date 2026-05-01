---
paths:
  - "**/*.md"
  - "_includes/seo.html"
  - "_layouts/**/*.html"
---

# SEO and Open Graph Rules

The SEO partial (`_includes/seo.html`) is included by `default.html` for every page. Page-level SEO is driven entirely by front matter — never inject `<meta>` tags manually from a content page.

## Title and description

- `<title>` = `{{ page.title }}`. Keep it ≤60 characters where possible.
- `<meta name="description">` = `page.seo_description` or `site.description` fallback. Always set `seo_description` on public pages (Spanish, ≤160 chars).
- Title and description should differ from the H1 enough to add value (search snippets vs page heading).

## Canonical URLs

- The partial emits `<link rel="canonical">` from `site.url + page.url`. Don't override this.
- Two pages must not share the same canonical. If a song has both an album-link and a platform-link page, choose one canonical and `sitemap: false` the other.

## Open Graph

| Field | Source | Required for |
| --- | --- | --- |
| `og:site_name` | `site.title` | Always (auto) |
| `og:title` | `page.title` | Always (auto) |
| `og:description` | `page.seo_description` | Public pages |
| `og:url` | derived | Always (auto) |
| `og:image` | `page.seo_image` (fallback `site.seo_image`) | Public pages |
| `og:image:width/height` | `page.seo_image_width/height` | Whenever `og:image` is set |
| `og:type` | `page.seo_type` (fallback `website`) | Music/article pages |
| `og:locale` | `site.lang` (`es_ES`) | Always (auto) |
| `og:audio` | `page.seo_audio` + `seo_audio_type` | Music link pages with previews |
| `og:video:*` | `page.seo_video_url` | Pages with featured video |

## Music-specific tags

Set on `layout: link` pages with `seo_type: music.song`:

```yaml
seo_music_duration: 217
seo_music_album: https://artist.bandcamp.com/album/<slug>
seo_music_album_track: 1
seo_music_release_date: 2025-01-10
seo_music_musician: https://artist.bandcamp.com/
```

## Mobile deep-link metadata (`al:` namespace)

Pick one (or more) of these per music page:

| Front matter key | Emits | Use when |
| --- | --- | --- |
| `seo_mobile_bandcamp_url` | Bandcamp app links (`com.bandcamp.android`, store id `706408639`) | Album/track lives on Bandcamp (default since 2025) |
| `seo_mobile_spotify_url` | Spotify app links (`com.spotify.music`, store id `324684580`) | Spotify-only or legacy pages |
| `seo_mobile_youtube_url` + `seo_web_youtube_url` | YouTube app + web fallback | Video page |

> Don't reuse `seo_mobile_bandcamp_url` to point at Spotify (or vice versa) — the partial emits the **app metadata** matched to the field name. Use the right field for the right destination.

## Twitter Cards

Auto-generated from Open Graph. The site uses `summary` cards by default (square 1280×1280 art works; 1280×720 is also fine).

## Sitemap

`jekyll-sitemap` builds `/sitemap.xml` automatically. Exclude pages with:

```yaml
sitemap: false
```

Always exclude:

- `/d/*` download landing pages
- `/u/*` user signup confirmation pages
- Any draft, internal, or hash-suffixed page that should not be discoverable

## Spanish-language SEO

- Site is `es_ES`. Don't add `<html lang="en">` markup or English meta tags.
- Keep diacritics in titles (`Tüz`, `María`, `corazón`) — they render correctly in search results and matter for the brand.

## Linting checklist

Before publishing a page:

- [ ] `seo_description` set and ≤160 chars
- [ ] `seo_image` exists at the declared path with the declared dimensions
- [ ] Canonical URL is unique
- [ ] If music: correct `seo_type`, `seo_mobile_bandcamp_url` (default), and either `seo_audio` preview or `seo_video_url`
- [ ] If internal/private: `sitemap: false`
