# Content Management

This document describes the content structure, organization, and management patterns used in the Alma de Tüz website.

## Content Architecture

### Content Types
The site manages several distinct content types:

1. **Static Pages**: Standard informational pages
2. **Music Content**: Songs, albums, and discography
3. **Workshop Content**: Educational and event materials
4. **Link Pages**: Music platform integrations
5. **Collection Items**: Singles and specialized content
6. **Legal Content**: Privacy policies and compliance

## Jekyll Collections

### Singles Collection (`_singles/`)

**Configuration**:
```yaml
collections:
  singles:
    output: true
```

**Purpose**: Individual song lyrics and content pieces

**Structure**:
```markdown
---
title: Song Title
layout: page
year: 2022
sitemap: false
---

Song lyrics and content here...
```

**Features**:
- Individual pages generated for each item
- SEO optimization with sitemap exclusion option
- Year-based organization
- Markdown content support

**Example**: `brillamos_por_igual.md`
- Personal song with metaphorical lyrics
- Organized by verse structure
- Includes metadata for categorization

## Content Organization Patterns

### Homepage (`index.md`)

**Structure**:
```yaml
---
title: Alma de Tüz
layout: page
seo_description: La música me salvó la vida
seo_image: /assets/images/infusiones_seo.jpg
seo_image_width: 1280
seo_image_height: 720
---
```

**Content Sections**:
1. **Hero Section**: Personal introduction with image
2. **Newsletter Signup**: Email subscription integration
3. **About Section**: Artist biography and philosophy
4. **Story Section**: Personal narrative about finding "Tüz"
5. **Call-to-Action**: Additional newsletter signup

**Component Usage**:
```liquid
{% include block_container_start.html %}
<!-- Content blocks -->
{% include block_container_end.html %}

{% include mail_form.html
  title="Infusiones de Tüz"
  subtitle="Newsletter description"
  form_id=1
%}
```

### Music Catalog (`mis-canciones/index.md`)

**Purpose**: Complete discography and music showcase

**Structure**:
1. **Hero Section**: Music philosophy statement
2. **Video Carousel**: Bootstrap carousel with video teasers
3. **Song Sections**: Individual songs with:
   - Album artwork (responsive images)
   - Song description and story
   - Spotify embeds
   - Multi-platform links
   - Production credits

**Video Carousel Implementation**:
```html
<div id="homeCarousel" class="carousel slide" data-bs-ride="carousel">
  <div class="carousel-indicators">
    <!-- Dynamic indicators -->
  </div>
  <div class="carousel-inner">
    <div class="carousel-item active">
      <div class="ratio ratio-16x9">
        <video autoplay muted loop>
      </div>
      <div class="carousel-caption">
        <!-- Song information -->
      </div>
    </div>
  </div>
</div>
```

**Song Entry Pattern**:
```markdown
![Album Art](/assets/images/song_single_480.jpg){: .img-right }

## Song Title

Song description and story...

**Production Credits**

<iframe src="spotify_embed_url"></iframe>

<p class="listen-also">
  Platform links with icons
</p>
```

## Link Management System

### Link Page Structure (`l/` directory)

**Purpose**: URL shortening and music platform integration

**Organization**:
```
l/
├── artist/           # Artist profile links
├── spotify/          # Spotify track/album links
├── youtube/          # YouTube video links
├── playlist/         # Playlist collections
├── dentro-del-laberinto/  # Album-specific links
└── la-penultima/     # Album-specific links
```

### Link Page Template

**Front Matter Structure**:
```yaml
---
title: Song/Album Title
layout: link
seo_description: Platform-specific description
seo_image: /assets/images/artwork_seo.jpg
seo_type: music.song
seo_audio: /assets/audio/preview.mp3
seo_music_duration: 217
seo_music_album: spotify_album_url
seo_mobile_spotify_url: spotify_mobile_url
---
```

**Content Structure**:
```liquid
{% include link_track_start.html %}

{% include link_track_image.html
  artwork="artwork_path"
  artist_name="Alma de Tüz"
  album_name="Song Title"
%}

{% include link_track_buttons.html
  spotify="PLAY"
  youtube="PLAY"
  apple="PLAY"
%}

{% include link_js.html
  spotify_track_id="track_id"
  campaign="campaign_name"
%}
```

## Workshop and Event Content

### Workshop Structure (`coser-y-cantar/`, `taller/`)

**Purpose**: Educational content and event promotion

**Organization**:
- Event-specific directories
- Registration and confirmation pages
- Workshop descriptions and details

**Page Structure**:
```yaml
---
title: Workshop Title
layout: page
seo_description: Workshop description
---
```

### Newsletter Content (`infusiones/`)

**Purpose**: Email subscription management

**Pages**:
- `index.md`: Main subscription page
- `bienvenida.md`: Welcome page
- `confirmar.md`: Confirmation page

## Legal and Compliance Content

### Legal Pages (`legal/`)

**Purpose**: GDPR compliance and legal requirements

**Structure**:
```yaml
---
title: Legal Page Title
layout: legal
---
```

**Data Integration**:
Legal navigation managed through `_data/legal.yml`:
```yaml
- name: Política de privacidad
  link: /legal/privacidad.html
- name: Política de cookies
  link: /legal/cookies.html
```

## Content Creation Patterns

### Front Matter Standards

**Required Fields**:
```yaml
title: Page Title
layout: appropriate_layout
```

**SEO Fields**:
```yaml
seo_description: Meta description
seo_image: /assets/images/seo_image.jpg
seo_image_width: 1280
seo_image_height: 720
```

**Music-Specific Fields**:
```yaml
seo_type: music.song
seo_audio: /assets/audio/preview.mp3
seo_music_duration: 217
seo_music_album: spotify_album_url
seo_music_musician: spotify_artist_url
```

### Markdown Extensions

**Image Attributes**:
```markdown
![Alt Text](/path/to/image.jpg){: .img-center-480 }
```

**CSS Classes**:
```markdown
# Title
{: .titular .text-start}

## Subtitle
{: .subtitular .text-end}
```

**Line Breaks**:
```markdown
Text with\\
manual line breaks
```

## Component Integration in Content

### Block Containers
```liquid
{% include block_container_start.html
  class_bg="bg-rose"
%}
Content here
{% include block_container_end.html %}
```

### Forms
```liquid
{% include mail_form.html
  title="Form Title"
  subtitle="Form Description"
  button="Button Text"
  form_id=1
  context_group_id=2225
  context_id=64
%}
```

### Button Groups
```liquid
{% include block_buttons_start.html %}
{% include button_image.html
  title="Button Title"
  url="/destination"
  image="/assets/images/button_bg.jpg"
%}
{% include block_buttons_end.html %}
```

## Content Management Best Practices

### File Organization
1. **Descriptive Names**: Use clear, descriptive filenames
2. **Directory Structure**: Group related content logically
3. **Consistent Naming**: Follow kebab-case conventions
4. **Asset References**: Use relative paths for maintainability

### SEO Optimization
1. **Meta Descriptions**: Unique descriptions for each page
2. **Image Optimization**: Provide appropriate SEO images
3. **Structured Data**: Use music-specific metadata where applicable
4. **URL Structure**: Clean, semantic URLs

### Content Standards
1. **Markdown Consistency**: Follow established markdown patterns
2. **Component Usage**: Use standard components for common elements
3. **Responsive Images**: Provide multiple image sizes
4. **Accessibility**: Include alt text and semantic markup

### Version Control
1. **Commit Messages**: Follow established commit message format
2. **Content Updates**: Document significant content changes
3. **Asset Management**: Track asset additions and modifications
4. **Review Process**: Review content changes before deployment

## Dynamic Content Features

### Data-Driven Navigation
Navigation items loaded from `_data/navigation.yml`:
```yaml
- name: MUSICA
  link: /#music
- name: TIENDA
  link: /#shop
```

### Social Media Integration
Social links managed through `_data/social.yml`:
```yaml
- name: Instagram
  class: fab fa-instagram
  link: https://www.instagram.com/amanda_tuz
```

### Automated Content Generation
1. **Sitemap**: Automatically generated by Jekyll
2. **RSS Feed**: Generated by jekyll-feed plugin
3. **SEO Tags**: Dynamic meta tag generation
4. **Responsive Images**: Multiple format support

## Content Workflow

### Content Creation Process
1. **Plan Content**: Define structure and components needed
2. **Create Markdown**: Write content with appropriate front matter
3. **Add Assets**: Include necessary images, audio, or video
4. **Test Locally**: Verify rendering and functionality
5. **Deploy**: Push to repository for GitHub Pages deployment

### Content Maintenance
1. **Regular Reviews**: Check for outdated content
2. **Link Validation**: Ensure external links remain valid
3. **SEO Updates**: Keep metadata current
4. **Asset Optimization**: Regularly optimize images and media
5. **Analytics Review**: Monitor content performance
