# Link Management System

This document describes the URL shortening and music platform integration system used in the Alma de Tüz website.

## Link System Overview

### Purpose
The link management system (`/l/` directory) serves as a URL shortening and music platform integration hub, providing:

1. **URL Shortening**: Clean, branded URLs for sharing
2. **Platform Integration**: Deep linking to music streaming services
3. **Analytics Tracking**: Comprehensive interaction analytics
4. **SEO Optimization**: Rich metadata for social sharing
5. **Mobile App Support**: Platform-specific app linking

### Directory Structure

```
l/
├── artist/                    # Artist profile links
│   ├── alasenmi/
│   └── almadetuz/
├── concierto/                 # Concert/event links
│   └── laciudaddelalba/
├── dentro-del-laberinto/      # Album: Dentro del Laberinto
│   ├── colibri/
│   ├── flores-en-mi-pecho/
│   ├── fortalezas/
│   ├── hermana-mayor/
│   ├── la-noche-estrellada/
│   ├── la-persistencia-de-nuestra-memoria/
│   ├── playlist/
│   ├── silencio/
│   ├── sin-el-cuerpo-no-hay-voz/
│   ├── te-llamaran-loca/
│   ├── turmalina-verde/
│   └── tus-huellas/
├── la-penultima/              # Album: La Penúltima
│   ├── catana-y-se-acabo/
│   ├── genetica/
│   ├── la-penultima/
│   ├── la-sangre/
│   ├── playlist/
│   └── yo-soy-esa/
├── playlist/                  # Playlist collections
│   ├── alasenmi/
│   └── almadetuz/
├── spotify/                   # Spotify-specific links
│   ├── alasenmi/
│   ├── aws/
│   ├── canto-para-mi/
│   ├── dentro/
│   ├── el-hilo-de-la-memoria/
│   ├── la-montana/
│   ├── luciernagas/
│   ├── raices/
│   └── universo/
├── vermisferios/              # Collaborative project
│   └── por-el-mero-hecho-de-ser/
└── youtube/                   # YouTube-specific links
    ├── baraye/
    ├── pecesdeciudad/
    ├── sin-el-cuerpo-no-hay-voz/
    ├── somos/
    ├── universo/
    └── yo-vengo-a-ofrecer-mi-corazon/
```

## Link Page Architecture

### Standard Link Page Structure

#### Front Matter Configuration
```yaml
---
title: Song/Content Title
layout: link
seo_description: Platform-specific description
seo_image: /assets/images/artwork_seo.jpg
seo_image_width: 1280
seo_image_height: 1280
seo_type: music.song
seo_audio: /assets/audio/preview.mp3
seo_audio_type: audio/mpeg
seo_music_duration: 217
seo_music_album: https://artist.bandcamp.com/album/album_id
seo_music_album_track: 1
seo_music_release_date: 2025-01-10
seo_music_musician: https://artist.bandcamp.com/
seo_mobile_spotify_url: https://artist.bandcamp.com/album/album-title
---
```

#### Content Structure
```liquid
{% include link_track_start.html %}

{% include link_track_image.html
  artwork="/assets/images/song_artwork.jpg"
  artwork_webp_sizes="responsive_webp_images"
  artwork_jpg_sizes="responsive_jpg_images"
  artwork_ratio="1x1"
  artist_name="Alma de Tüz"
  album_name="Song Title"
%}

{% include link_track_buttons.html
  artist_name="Alma de Tüz"
  album_name="Song Title"
  spotify="PLAY"
  youtube="PLAY"
  apple="PLAY"
%}

{% include link_track_next.html %}

<!-- Optional: Additional content -->
<div class="col p-3" markdown="1">
  Song description or newsletter signup
</div>

{% include link_track_footer.html
  cc_year="2025"
%}

{% include link_track_end.html %}

{% include link_js.html
  deep_link="yes"
  spotify_track_id="track_id"
  spotify_si="session_id"
  youtube_video_id="video_id"
  apple_link="apple_music_url"
  campaign="song_name"
  medium="spotify"
%}
```

## Music Platform Integration

### Spotify Integration

#### Track Links
```yaml
# Example: /l/spotify/dentro/
seo_mobile_bandcamp_url: https://almadetuz.bandcamp.com/album/raices
```

#### JavaScript Deep Linking
```liquid
{% include link_js.html
  spotify_track_id="4h0dnLVe5uNwmRbFwPQ9TB"
  spotify_si="5ac884c854f34596"
  campaign="dentro"
  medium="spotify"
%}
```

#### Artist Profile Links
```yaml
# Example: /l/artist/almadetuz/
seo_mobile_bandcamp_url: https://almadetuz.bandcamp.com/album/raices
```

### YouTube Integration

#### Video Links
```liquid
{% include link_js.html
  youtube_video_id="wfFiR54NZWg"
  youtube_list_id="PLeNBLdOfTIZIo8bN0wvi-wY2qZxzu0E96"
  campaign="song_name"
  medium="youtube"
%}
```

#### Channel Integration
```liquid
{% include link_js.html
  youtube_channel_id="UCOPHcngzAIc4ZqT2cc0V0jw"
%}
```

### Apple Music Integration

#### Direct Links
```liquid
{% include link_js.html
  apple_link="https://music.apple.com/es/album/a/1789125953?app=music&itscg=10002&itsct=mus_1650986310&ct=QTG5iaA1GZSNiKw&at=1010l367Y&ls=1&mttnsubad=album_newrelease_Measure"
%}
```

### Multi-Platform Support

#### Platform Detection
The system automatically detects user devices and provides appropriate links:
- **Mobile iOS**: App Store links with fallback to web
- **Mobile Android**: Google Play links with fallback to web
- **Desktop**: Web player links

#### Button Configuration
```liquid
{% include link_track_buttons.html
  spotify="PLAY"      # Show Spotify button
  youtube="PLAY"      # Show YouTube button
  apple="PLAY"        # Show Apple Music button
  soundcloud="PLAY"   # Show SoundCloud button
%}
```

## Link Components System

### Core Components

#### `link_track_start.html` / `link_track_end.html`
**Purpose**: Page wrapper components for consistent layout

#### `link_track_image.html`
**Purpose**: Artwork display with responsive images

**Parameters**:
```liquid
{% include link_track_image.html
  artwork="/assets/images/artwork.jpg"
  artwork_webp_sizes="webp_responsive_images"
  artwork_jpg_sizes="jpg_responsive_images"
  artwork_ratio="1x1"
  artist_name="Artist Name"
  album_name="Song/Album Title"
%}
```

#### `link_track_buttons.html`
**Purpose**: Platform-specific action buttons

**Features**:
- Dynamic button display based on available platforms
- Consistent styling across platforms
- Analytics integration for click tracking

#### `link_track_footer.html`
**Purpose**: Copyright and licensing information

**Parameters**:
```liquid
{% include link_track_footer.html
  cc_year="2025"
%}
```

### JavaScript Integration (`link_js.html`)

#### Deep Linking Support
```liquid
{% include link_js.html
  deep_link="yes"               # Enable deep linking
  spotify_track_id="track_id"   # Spotify track identifier
  youtube_video_id="video_id"   # YouTube video identifier
  apple_link="apple_url"        # Apple Music URL
%}
```

#### Campaign Tracking
```liquid
{% include link_js.html
  campaign="campaign_name"      # Campaign identifier
  medium="platform_name"        # Traffic medium
%}
```

#### Platform-Specific Parameters
- **Spotify**: Track ID, session ID, artist ID
- **YouTube**: Video ID, playlist ID, channel ID
- **Apple Music**: Direct URL with affiliate parameters
- **SoundCloud**: Artist ID and track references

## SEO and Social Optimization

### Music-Specific Metadata

#### Open Graph Music Tags
```yaml
seo_type: music.song
seo_audio: /assets/audio/preview.mp3
seo_audio_type: audio/mpeg
seo_music_duration: 217
seo_music_album: https://open.spotify.com/album/album_id
seo_music_album_track: 1
seo_music_release_date: 2025-01-10
seo_music_musician: https://open.spotify.com/artist/artist_id
```

#### Mobile App Linking
```yaml
# Spotify Deep Links
seo_mobile_bandcamp_url: https://artist.bandcamp.com/album/album-title

# YouTube Deep Links
seo_mobile_youtube_url: youtube://video_id
seo_web_youtube_url: https://youtube.com/watch?v=video_id
```

#### Social Media Cards
The system generates rich social media cards with:
- Album artwork
- Song previews (where available)
- Platform-specific CTAs
- Artist information

### Twitter Card Integration
```html
<meta name="twitter:card" content="summary" />
<meta name="twitter:site" content="@almadetuz" />
<meta name="twitter:title" content="Song Title" />
<meta name="twitter:image" content="artwork_url" />
```

## Analytics and Tracking

### Link Click Tracking

The link system includes comprehensive analytics:

#### Platform Attribution
- Click tracking for each music platform
- User platform preferences
- Geographic distribution
- Device type analytics

#### Campaign Tracking
```javascript
// UTM parameter integration
utm_campaign: "song_name"
utm_medium: "spotify"
utm_source: "link_page"
```

#### Engagement Metrics
- Time spent on link pages
- Platform selection patterns
- Mobile vs desktop usage
- Conversion rates to streaming platforms

### Custom Event Tracking

#### Link Interaction Events
```javascript
// Platform button clicks
amp_event('PlatformClick', {
  platform: 'spotify',
  song: 'song_name',
  campaign: 'campaign_name'
});
```

#### Deep Link Success
```javascript
// Mobile app deep link success/failure
amp_event('DeepLink', {
  platform: 'spotify',
  success: true,
  device: 'mobile'
});
```

## Content Strategy

### URL Structure

#### Semantic URLs
```
/l/spotify/song-name/           # Platform-specific
/l/artist/artist-name/          # Artist profiles
/l/album-name/song-name/        # Album organization
/l/playlist/collection-name/    # Playlist collections
```

#### SEO-Friendly Patterns
- Descriptive path segments
- Consistent URL structure
- Canonical URL implementation
- Proper redirects when needed

### Content Customization

#### Platform-Specific Content
Different content based on traffic source:
- Spotify traffic: Focus on album discovery
- YouTube traffic: Emphasize video content
- Social media traffic: Encourage sharing

#### Personalization
```liquid
<!-- Conditional content based on referrer -->
{% if page.referrer contains 'spotify' %}
  <!-- Spotify-specific content -->
{% elsif page.referrer contains 'youtube' %}
  <!-- YouTube-specific content -->
{% endif %}
```

## Maintenance and Updates

### Link Management Workflow

#### Adding New Songs/Albums
1. Create directory structure under `/l/`
2. Generate link pages for each platform
3. Configure metadata and artwork
4. Set up tracking parameters
5. Test deep linking functionality

#### Platform Updates
1. Monitor platform API changes
2. Update deep link formats
3. Test mobile app integration
4. Verify analytics tracking

### Quality Assurance

#### Testing Checklist
- [ ] All platform buttons functional
- [ ] Deep links work on mobile devices
- [ ] Analytics tracking implemented
- [ ] SEO metadata complete
- [ ] Social sharing optimized
- [ ] Responsive design verified

#### Performance Monitoring
- Link click-through rates
- Platform preference trends
- Mobile app installation rates
- Page load performance
- User engagement metrics

## Future Enhancements

### Potential Improvements
1. **Dynamic Link Generation**: Automated link page creation
2. **A/B Testing**: Platform button optimization
3. **Advanced Analytics**: Detailed user journey tracking
4. **Platform Integration**: New streaming service support
5. **Personalization**: User preference-based recommendations
