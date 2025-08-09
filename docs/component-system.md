# Component System

This document describes the reusable component architecture using Jekyll includes in the Alma de Tüz website.

## Component Philosophy

The site uses a component-based architecture where reusable UI elements are implemented as Jekyll includes. This approach provides:

- **Modularity**: Components can be used across different layouts and pages
- **Maintainability**: Changes to a component automatically apply everywhere it's used
- **Consistency**: Ensures uniform appearance and behavior
- **Parameterization**: Components accept parameters for customization

## Component Categories

### Core Layout Components

#### Header Component (`header.html`)
**Purpose**: Site header with logo and title

**Structure**:
```html
<div class="container-fluid">
  <div class="row">
    <div class="col">
      <a class="logo" href="/">
        <img src="/assets/images/icon.png" alt="Alma de Tüz">
      </a>
      <div class="title">
        {% if page.title %}
          <span>{{ page.title }}</span>
        {% endif %}
      </div>
    </div>
  </div>
</div>
```

**Features**:
- Responsive logo
- Dynamic page title display
- Home page linking
- Bootstrap grid integration

#### Footer Component (`footer.html`)
**Purpose**: Site footer with legal links and copyright

**Features**:
- Creative Commons licensing display
- Legal page navigation (from `_data/legal.yml`)
- Cookie preferences modal trigger
- Current page highlighting
- Copyright information

**Data Integration**:
```liquid
{% for item in site.data.legal %}
  <a href="{{ item.link }}" {% if page.url == item.link %}class="current"{% endif %}>
    {{ item.name }}
  </a>
{% endfor %}
```

#### Navigation Component (`navigation.html`)
**Purpose**: Main site navigation (currently minimal usage)

### Content Block Components

#### Block Container System
**Components**:
- `block_container_start.html`
- `block_container_end.html`
- `block_container_next.html`

**Purpose**: Standardized content containers with Bootstrap grid

**Usage**:
```liquid
{% include block_container_start.html
  class_container="container-fluid"
  class_row="row"
  class_bg="bg-rose"
%}
<!-- Content here -->
{% include block_container_end.html %}
```

**Parameters**:
- `class_container`: CSS classes for container div
- `class_row`: CSS classes for row div
- `class_bg`: Background color classes

#### Button System
**Components**:
- `block_buttons_start.html` / `block_buttons_end.html`
- `button_image.html`

**Purpose**: Standardized button groups and image-based buttons

**Image Button Usage**:
```liquid
{% include button_image.html
  title="Coser y Cantar"
  url="/coser-y-cantar/madrid-16-nov"
  image="/assets/images/coser_y_cantar_320.jpg"
  title_class="text-soft-white"
%}
```

**Parameters**:
- `title`: Button text
- `url`: Destination URL
- `image`: Background image path
- `title_class`: CSS classes for title styling

#### Title Image Component (`block_title_image.html`)
**Purpose**: Section headers with background images

**Features**:
- Responsive background images
- Overlay effects for text readability
- Flexible positioning and styling options

### Form Components

#### Mail Form Component (`mail_form.html`)
**Purpose**: Email subscription forms with Mailchimp integration

**Usage**:
```liquid
{% include mail_form.html
  title="Infusiones de Tüz"
  subtitle="Newsletter description"
  button="Sí, quiero recibirlas"
  line_bottom="Additional info"
  class="bg-rose"
  form_id=1
  context_group_id=2225
  context_id=64
%}
```

**Parameters**:
- `title`: Form heading
- `subtitle`: Form description (supports HTML)
- `button`: Submit button text
- `line_bottom`: Additional information
- `class`: CSS classes for styling
- `form_id`: Unique form identifier
- `context_group_id`: Mailchimp group ID
- `context_id`: Mailchimp context ID
- `user_id`: Mailchimp user ID (optional)
- `audience_id`: Mailchimp audience ID (optional)

**Features**:
- GDPR compliance with privacy policy links
- Bootstrap validation
- Loading spinners
- Error handling
- Analytics integration
- Honeypot spam protection

#### Form Handling Components
- `form_js.html`: JavaScript form handling
- `form_api_signup.html`: API integration for signups

### Media Components

#### Link Video Component (`link_video.html`)
**Purpose**: Video embeds with responsive containers

#### Product Components
**Components**:
- `product_colgante_alma_ciclica.html`
- `product_pendientes_alma_beloved.html`
- `product_pendientes_alma_en_flor.html`

**Purpose**: Product display for merchandise/jewelry

### Link Management Components

#### Link Tracking System
**Components**:
- `link_track.html`: Complete link page template
- `link_track_start.html` / `link_track_end.html`: Page wrappers
- `link_track_image.html`: Artwork display
- `link_track_buttons.html`: Platform buttons
- `link_track_footer.html`: Copyright and attribution

**Purpose**: Music platform integration and link sharing

**Link Track Usage**:
```liquid
{% include link_track_image.html
  artwork="/assets/images/album_art.jpg"
  artwork_webp_sizes="..."
  artwork_jpg_sizes="..."
  artwork_ratio="1x1"
  artist_name="Alma de Tüz"
  album_name="Song Title"
%}
```

**Parameters**:
- `artwork`: Main artwork image
- `artwork_webp_sizes`: WebP responsive images
- `artwork_jpg_sizes`: JPEG responsive images
- `artwork_ratio`: Aspect ratio class
- `artist_name`: Artist name
- `album_name`: Album/song title

#### Link JavaScript Component (`link_js.html`)
**Purpose**: Deep linking and platform detection for music apps

**Usage**:
```liquid
{% include link_js.html
  deep_link="yes"
  spotify_track_id="track_id"
  spotify_si="session_id"
  youtube_video_id="video_id"
  apple_link="apple_music_url"
  campaign="campaign_name"
  medium="medium_name"
%}
```

**Features**:
- Platform-specific deep linking
- Mobile app detection
- Analytics integration
- UTM parameter handling

### Analytics Components

#### Analytics Integration
**Components**:
- `amplitude_js.html`: Amplitude analytics
- `matomo_js.html`: Matomo tracking
- `google_tag.html`: Google Tag Manager
- `fb_js.html`: Facebook Pixel

**Purpose**: Comprehensive analytics and tracking

#### Scroll Tracking (`scroll_js.html`)
**Purpose**: Scroll-based event tracking for engagement metrics

### Utility Components

#### SEO Component (`seo.html`)
**Purpose**: Comprehensive SEO meta tag generation

**Features**:
- Open Graph metadata
- Twitter Card support
- Music-specific metadata
- Video metadata
- Mobile app linking
- Canonical URLs

**Conditional Metadata**:
```liquid
{% if page.seo_image %}
  <meta property="og:image" content="{{ site.url }}{{ page.seo_image }}" />
{% elsif site.seo_image %}
  <meta property="og:image" content="{{ site.url }}{{ site.seo_image }}" />
{% endif %}
```

#### Bootstrap Integration (`bootstrap_js.html`)
**Purpose**: Bootstrap JavaScript loading

#### Cookie Consent (`cookie_js.html`)
**Purpose**: GDPR cookie consent management

### More Component (`more.html`)
**Purpose**: Additional content sections (used in landing layout)

## Component Development Patterns

### Parameter Handling
Components use Jekyll's `include` parameter system:

```liquid
{% include component.html
  param1="value1"
  param2="value2"
%}
```

Access parameters within component:
```liquid
{{ include.param1 }}
{{ include.param2 }}
```

### Default Values
Components can provide default values:

```liquid
{{ include.user_id | default: '755a8ee1763ec4fdac3272bec' }}
```

### Conditional Content
Components use Liquid conditionals for optional features:

```liquid
{% if include.subtitle %}
  <div class="subtitle">{{ include.subtitle }}</div>
{% endif %}
```

### CSS Integration
Components integrate with the site's CSS system:

```html
<div class="{{ include.class }}">
  <!-- Component content -->
</div>
```

### JavaScript Integration
Components that require JavaScript include:
- Event listeners
- Form validation
- Analytics tracking
- API calls

## Best Practices

### Component Design
1. **Single Responsibility**: Each component has one clear purpose
2. **Parameterization**: Make components flexible through parameters
3. **Default Values**: Provide sensible defaults for optional parameters
4. **Error Handling**: Handle missing or invalid parameters gracefully
5. **Documentation**: Clear parameter documentation in component files

### Usage Guidelines
1. **Consistent Parameters**: Use consistent naming across similar components
2. **CSS Classes**: Pass styling through class parameters
3. **Content Flexibility**: Support both simple text and HTML content
4. **Accessibility**: Ensure components are accessible by default
5. **Performance**: Minimize JavaScript and CSS in components

### Maintenance
1. **Version Control**: Track component changes carefully
2. **Breaking Changes**: Document any parameter changes
3. **Testing**: Test components across different layouts
4. **Dependencies**: Minimize external dependencies
5. **Documentation**: Keep documentation updated with changes
