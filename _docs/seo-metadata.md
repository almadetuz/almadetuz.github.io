# SEO & Metadata

This document describes the comprehensive SEO optimization and metadata management system implemented in the Alma de Tüz website.

## SEO Architecture Overview

### Multi-Layer SEO Strategy

The site implements a comprehensive SEO approach covering:

1. **Technical SEO**: Site structure and performance
2. **Content SEO**: Optimized content and metadata
3. **Social SEO**: Open Graph and Twitter Cards
4. **Music SEO**: Industry-specific metadata
5. **Local SEO**: Geographic and cultural optimization

### SEO Configuration

#### Global SEO Settings (`_config.yml`)
```yaml
title: Alma de Tüz
lang: es_ES
description: "Arquitecturas sonoras para sanar"
url: "https://www.almadetuz.com"
host: "www.almadetuz.com"

# Twitter integration
twitter:
  username: almadetuz
  card: summary

# Default SEO image
seo_image: /assets/images/alma_de_tuz_seo.jpg
seo_image_width: 1280
seo_image_height: 720
```

## SEO Component System

### Core SEO Component (`seo.html`)

**Purpose**: Comprehensive meta tag generation for all pages

**Implementation**: Located in `_includes/seo.html`, automatically included in `default.html` layout

#### Basic Meta Tags
```html
<meta property="og:site_name" content="{{ site.title }}" />
<meta property="og:title" content="{{ page.title }}" />
<meta property="og:locale" content="{{ site.lang }}" />
<meta name="google" content="notranslate" />
<link rel="canonical" href="{{ site.url }}{{ page.url }}" />
<meta property="og:url" content="{{ site.url }}{{ page.url }}" />
```

#### Dynamic Description Handling
```liquid
{% if page.seo_description %}
  <meta name="description" content="{{ page.seo_description }}" />
  <meta property="og:description" content="{{ page.seo_description }}" />
{% else %}
  <meta name="description" content="{{ site.description }}" />
  <meta property="og:description" content="{{ site.description }}" />
{% endif %}
```

#### Image Optimization
```liquid
{% if page.seo_image %}
  <meta property="og:image" content="{{ site.url }}{{ page.seo_image }}" />
  <meta property="og:image:alt" content="{{ page.title }}" />
  {% if page.seo_image_width %}
    <meta property="og:image:width" content="{{ page.seo_image_width }}" />
  {% endif %}
  {% if page.seo_image_height %}
    <meta property="og:image:height" content="{{ page.seo_image_height }}" />
  {% endif %}
{% elsif site.seo_image %}
  <!-- Fallback to site default -->
{% endif %}
```

## Page-Level SEO Configuration

### Standard Page SEO

#### Front Matter Structure
```yaml
---
title: Page Title
layout: page
seo_description: Unique meta description for this page
seo_image: /assets/images/page_specific_seo.jpg
seo_image_width: 1280
seo_image_height: 720
---
```

#### SEO Best Practices
1. **Unique Titles**: Each page has a distinct, descriptive title
2. **Meta Descriptions**: 150-160 character descriptions
3. **SEO Images**: 1280x720px images optimized for social sharing
4. **Canonical URLs**: Proper canonical tag implementation

### Music-Specific SEO

#### Music Page Metadata
```yaml
---
title: Song Title
layout: link
seo_description: Listen to [Song] by Alma de Tüz on Spotify
seo_image: /assets/images/song_artwork_seo.jpg
seo_type: music.song
seo_audio: /assets/audio/song_preview.mp3
seo_audio_type: audio/mpeg
seo_music_duration: 217
seo_music_album: https://open.spotify.com/album/album_id
seo_music_album_track: 1
seo_music_release_date: 2025-01-10
seo_music_musician: https://open.spotify.com/artist/artist_id
---
```

#### Music Schema Implementation
```html
<!-- Music-specific Open Graph tags -->
<meta property="og:type" content="music.song" />
<meta property="og:audio" content="{{ site.url }}{{ page.seo_audio }}" />
<meta property="og:audio:type" content="{{ page.seo_audio_type }}" />

<!-- Music metadata -->
<meta name="music:duration" content="{{ page.seo_music_duration }}" />
<meta name="music:album" content="{{ page.seo_music_album }}" />
<meta name="music:album:track" content="{{ page.seo_music_album_track }}" />
<meta name="music:release_date" content="{{ page.seo_music_release_date }}" />
<meta name="music:musician" content="{{ page.seo_music_musician }}" />
```

## Social Media Optimization

### Open Graph Implementation

#### Standard Open Graph Tags
- `og:site_name`: Site branding
- `og:title`: Page-specific titles
- `og:description`: Optimized descriptions
- `og:url`: Canonical URLs
- `og:image`: Optimized social images
- `og:type`: Content type specification
- `og:locale`: Language specification

#### Music-Specific Open Graph
- `og:audio`: Audio preview files
- `music:duration`: Track length
- `music:album`: Album references
- `music:musician`: Artist information

### Twitter Cards

#### Twitter Card Configuration
```html
<meta name="twitter:site" content="@{{ site.twitter.username }}" />
<meta name="twitter:title" content="{{ page.title }}" />
<meta name="twitter:description" content="{{ page.seo_description }}" />
<meta name="twitter:image" content="{{ site.url }}{{ page.seo_image }}" />
<meta name="twitter:image:alt" content="{{ page.title }}" />
<meta name="twitter:card" content="summary" />
```

#### Twitter Card Types
- **Summary Card**: Default for most content
- **Summary Large Image**: For visual content
- **Player Card**: For audio/video content (future enhancement)

### Video Content Optimization

#### Video Metadata
```yaml
seo_video_url: https://youtube.com/watch?v=video_id
```

#### Video Open Graph Tags
```html
<meta property="og:video:type" content="text/html">
<meta property="og:video:url" content="{{ page.seo_video_url }}">
<meta property="og:video:secure_url" content="{{ page.seo_video_url }}">
<meta property="og:video:width" content="1280">
<meta property="og:video:height" content="720">
```

## Mobile App Integration

### App Store Optimization

#### Spotify Deep Linking
```html
{% if page.seo_mobile_spotify_url %}
  <meta name="al:android:app_name" content="Spotify" />
  <meta name="al:android:package" content="com.spotify.music" />
  <meta name="al:android:url" content="{{ page.seo_mobile_spotify_url }}" />
  <meta name="al:ios:app_name" content="Spotify" />
  <meta name="al:ios:app_store_id" content="324684580" />
  <meta name="al:ios:url" content="{{ page.seo_mobile_spotify_url }}" />
{% endif %}
```

#### YouTube Deep Linking
```html
{% if page.seo_mobile_youtube_url %}
  <meta property="al:ios:app_name" content="YouTube">
  <meta property="al:ios:app_store_id" content="544007664">
  <meta property="al:ios:url" content="{{ page.seo_mobile_youtube_url }}">
  <meta property="al:android:app_name" content="YouTube">
  <meta property="al:android:package" content="com.google.android.youtube">
  <meta property="al:android:url" content="{{ page.seo_mobile_youtube_url }}">
{% endif %}
```

#### Web Fallback URLs
```html
{% if page.seo_web_youtube_url %}
  <meta property="al:web:url" content="{{ page.seo_web_youtube_url }}">
{% endif %}
```

## Technical SEO Implementation

### Site Structure

#### URL Structure
- **Clean URLs**: Semantic, readable URL patterns
- **Hierarchical Structure**: Logical content organization
- **Canonical URLs**: Proper canonicalization
- **URL Consistency**: Trailing slash handling

#### Sitemap Generation
```yaml
# Automatic sitemap generation via jekyll-sitemap
plugins:
  - jekyll-sitemap
```

#### RSS Feed
```yaml
# Automatic feed generation via jekyll-feed
plugins:
  - jekyll-feed
```

### Performance SEO

#### Page Speed Optimization
- **CSS Optimization**: Minified and concatenated stylesheets
- **Image Optimization**: Multiple formats and sizes
- **JavaScript Optimization**: Deferred loading
- **Font Optimization**: Efficient font loading

#### Core Web Vitals
- **LCP**: Optimized image loading
- **FID**: Minimal JavaScript blocking
- **CLS**: Stable layout design

### Mobile SEO

#### Mobile-First Design
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

#### Mobile Optimization
- Responsive design implementation
- Touch-friendly navigation
- Fast mobile loading times
- Mobile app integration

## Localization and Language SEO

### Spanish Language Optimization

#### Language Declaration
```html
<html lang="es">
```

#### Content Localization
- Spanish-language content throughout
- Culturally relevant references
- Local music industry terms
- Regional artist connections

#### Geographic Targeting
```yaml
lang: es_ES  # Spanish (Spain)
```

## SEO Content Strategy

### Content Optimization Patterns

#### Homepage SEO
```yaml
title: Alma de Tüz
seo_description: La música me salvó la vida
```

**Optimization Elements**:
- Personal brand focus
- Emotional connection
- Musical therapy themes
- Call-to-action integration

#### Music Catalog SEO
```yaml
title: Mis canciones
seo_description: Las canciones de Alma de Tüz. Es sencillo, es sólo amor
```

**Optimization Elements**:
- Music discovery focus
- Emotional storytelling
- Artist authenticity
- Platform integration

#### Workshop SEO
Workshop and event pages optimized for:
- Local search discovery
- Educational content marketing
- Community building
- Registration conversion

### Keyword Strategy

#### Primary Keywords
- "Alma de Tüz"
- "Amanda músico terapeuta"
- "Arquitecturas sonoras"
- "Música sanación"

#### Long-Tail Keywords
- "Talleres música terapéutica Madrid"
- "Canciones autoría femenina"
- "Arteterapia musical"
- "Infusiones de Tüz newsletter"

## SEO Monitoring and Analytics

### SEO Metrics Tracking

#### Google Search Console Integration
- Search performance monitoring
- Technical issue identification
- Mobile usability tracking
- Core Web Vitals monitoring

#### Analytics Integration
```javascript
// SEO-related event tracking
amp_event('SEOEvent', {
  page_title: title,
  page_url: base,
  utm_source: utm_source,
  search_query: referrer_query
});
```

### Performance Monitoring

#### Key SEO Metrics
1. **Organic Traffic**: Search engine visitor growth
2. **Keyword Rankings**: Target keyword positions
3. **Click-Through Rates**: Search result engagement
4. **Page Speed**: Core Web Vitals scores
5. **Mobile Performance**: Mobile search metrics

#### Regular SEO Audits
- Monthly keyword ranking reviews
- Quarterly technical SEO audits
- Annual content optimization reviews
- Ongoing performance monitoring

## Future SEO Enhancements

### Structured Data Implementation

#### Music Schema Markup
```json
{
  "@context": "https://schema.org",
  "@type": "MusicRecording",
  "name": "Song Title",
  "byArtist": {
    "@type": "MusicGroup",
    "name": "Alma de Tüz"
  },
  "duration": "PT3M37S",
  "inAlbum": {
    "@type": "MusicAlbum",
    "name": "Album Name"
  }
}
```

#### Event Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Workshop Title",
  "performer": {
    "@type": "Person",
    "name": "Amanda Fernández Bartolomé"
  },
  "location": "Workshop Location"
}
```

### Advanced SEO Features

#### Potential Enhancements
1. **FAQ Schema**: Workshop and music therapy questions
2. **Breadcrumb Schema**: Enhanced navigation
3. **Review Schema**: Workshop testimonials
4. **Local Business Schema**: Madrid-based services
5. **Music Video Schema**: YouTube integration
6. **Podcast Schema**: Audio content optimization

### International SEO

#### Multi-Language Considerations
- Latin American market expansion
- International music platform optimization
- Cultural adaptation strategies
- Regional keyword targeting
