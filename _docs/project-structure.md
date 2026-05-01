# Project Structure

This document outlines the organization of the Alma de Tüz website codebase.

## Root Directory Structure

```
almadetuz.github.io/
├── _config.yml              # Jekyll configuration
├── _data/                   # Data files (YAML)
├── _includes/               # Reusable template components
├── _layouts/                # Page layout templates
├── _sass/                   # SASS stylesheets
├── _singles/                # Single content collection
├── _site/                   # Generated site (ignored in git)
├── assets/                  # Static assets (CSS, JS, images, etc.)
├── l/                       # Link shortening system (music platform links)
├── legal/                   # Legal pages (privacy, cookies)
├── cartas/                  # Oracle/tarot cards content
├── coser-y-cantar/         # Workshop event flow (inscripcion, bienvenida, confirmar, madrid-16-nov/)
├── infusiones/             # Newsletter subscription flow (index, bienvenida, confirmar)
├── mis-canciones/          # Music catalog
├── taller/                 # Workshop/course landing
├── d/                       # Download landing pages (e.g. dentro-cc373161.md)
├── u/                       # User signup confirmation pages
├── index.md                # Homepage
├── Gemfile                 # Ruby dependencies
├── README.md               # Development setup
└── *.html                  # Various standalone pages
```

## Jekyll Directories

### `_config.yml`
Main Jekyll configuration file containing:
- Site metadata (title, description, URL)
- Plugin configuration
- Collections setup
- Default layout assignment
- SEO settings

### `_data/`
YAML data files for site-wide content:
- `navigation.yml` - Main navigation menu items
- `social.yml` - Social media links and icons
- `legal.yml` - Legal page links (privacy, cookies)

### `_includes/`
Reusable template components organized by function:

#### Analytics & Tracking
- `amplitude_js.html` - Amplitude analytics
- `matomo_js.html` - Matomo tracking
- `google_tag.html` - Google Tag Manager / Google Ads
- `fb_js.html` - Facebook Pixel
- `cookie_js.html` - Cookie consent bootstrap
- `scroll_js.html` - Scroll/visibility event tracking

#### Layout Components
- `header.html` - Site header
- `footer.html` - Site footer
- `navigation.html` - Navigation menu
- `seo.html` - SEO meta tags

#### Content Blocks
- `block_container_start.html` / `block_container_end.html` - Content containers
- `block_buttons_start.html` / `block_buttons_end.html` - Button groups
- `block_title_image.html` - Title with background image

#### Forms & Interaction
- `mail_form.html` - Email subscription form (Mailchimp downstream)
- `mail_form_lead.html` - Lead-capture form variant
- `form_js.html` - Shared form handling JavaScript bootstrap
- `form_api_signup.html` - Custom signup API integration (posts to `/u/confirmar.html`)

#### Media & Links
- `button_image.html` - Image-based buttons
- `button_link.html` - Plain link button
- `link_video.html` - Video embeds
- `artist_links.html` / `song_links.html` - Platform link lists
- Product templates: `product_pendientes_alma_beloved.html`, `product_pendientes_alma_en_flor.html`, `product_colgante_alma_ciclica.html`

#### Specialized Components
- `link_track.html` and the `link_track_*` family (start/end, image, buttons, footer, next) — music platform landing pages
- `link_js.html` - Deep-link routing and platform detection
- `bootstrap_js.html` - Bootstrap JavaScript loader
- `scroll_down_arrow.html` - Decorative scroll indicator

### `_layouts/`
Page layout templates:
- `default.html` - Base HTML structure (loads CSS, sets up UTM/event globals, includes `form_js.html` and `bootstrap_js.html`)
- `tracking.html` - Wraps `default` and adds analytics initialization
- `page.html` - Standard content pages
- `landing.html` - Marketing/landing pages (adds `more.html` block)
- `link.html` - Music/link sharing pages (white background, deep-link tracking)
- `legal.html` - Legal page layout (with cookie preferences modal)
- `clean.html` - Bare main-only layout (no header/footer)
- `confirm.html` - Confirmation pages
- `checkout.html` - E-commerce checkout
- `lead.html` - Lead generation pages (fires `Lead` conversion event)
- `download.html` - Audio download pages with optional auto-download
- `suscribed.html` - Subscription confirmation

### `_sass/`
SASS stylesheet organization:
- `main.scss` - Main styles and variables
- `fonts.scss` - Typography definitions
- `form.scss` - Form styling
- `logo.scss` - Logo and branding
- `video.scss` - Video component styles
- `carousel.scss` - Carousel component styles
- `fa/` - Font Awesome customization

### `_singles/`
Jekyll collection for single content pieces (output as individual pages):
- `brillamos_por_igual.md`
- `dentro.md`

## Assets Directory

### `assets/css/`
- `styles.scss` - Main stylesheet (compiles SASS)
- `bootstrap.v5.3.3.min.css` / `bootstrap.v5.3.3.css` - Bootstrap CSS (minified + source)
- `bootstrap-icons.v1.13.1.min.css` - Bootstrap Icons font CSS
- `normalize.css` - CSS normalization
- `cookieconsent_v3.css` - Cookie consent styling
- `fonts/` - Self-hosted font files

### `assets/js/`
JavaScript libraries and custom scripts:
- `amplitude_v261.js` + `analytics-browser-2.6.1-min.js` - Amplitude analytics
- `axios.v1.6.8.min.js` (+ source/maps) - HTTP client
- `bootstrap.bundle.v5.3.3.min.js` (+ source) - Bootstrap JavaScript
- `cookieconsent_v3.js` - Cookie consent runtime
- `intersection-observer.min.js`, `verge.min.js` - Visibility/viewport helpers
- `api.js` - Signup API client
- `forms.js` - Form handling
- `link.js` - Link/deep-link management
- `cta.js` - Call-to-action helpers
- `scroll_v1.js` - Scroll tracking
- `songkick_injector_20230525.js` - Concert listings injector

### `assets/images/`
Optimized images with multiple formats and sizes:
- Multiple resolutions (320w, 480w, 640w, 1024w)
- WebP and JPEG formats
- Organized by content type and albums
- Subdirectories for album artwork

### `assets/audio/`
Audio content:
- Song previews (`.mp3`)
- Full tracks for specific releases
- Organized by album/release

### `assets/videos/`
Video content:
- Teasers and promotional videos (`.mp4`)
- Optimized for web delivery

### `assets/webfonts/`
Font files organized by family:
- Custom fonts (DayDream, Wonderful)
- Google Fonts downloads
- Font Awesome icon fonts

## Content Organization

### `l/` - Link Management System
URL shortening and music platform integration:
- `artist/` - Artist profile links
- `spotify/` - Spotify track/album links
- `youtube/` - YouTube video links
- `playlist/` - Playlist links
- Album-specific subdirectories

### Legal & Compliance
- `legal/` - Privacy policy and cookie policy
- GDPR compliance pages

### Content Sections
- `mis-canciones/` - Music catalog and discography
- `coser-y-cantar/` - Workshop event flow
- `infusiones/` - Newsletter subscription flow
- `taller/` - Educational content
- `cartas/` - Oracle/tarot cards
- `d/` - Download landing pages (used with `download` layout)
- `u/` - User signup confirmation pages

## Build Process

### Development Files
- `Gemfile` - Ruby gem dependencies
- `Rakefile` - Build tasks
- `config.ru` - Rack configuration for Puma
- `Procfile` - Heroku deployment configuration

### Generated Content
- `_site/` - Jekyll-generated static site (not version controlled)
- Compiled CSS from SASS
- Processed images and assets

## File Naming Conventions

- **Images**: Descriptive names with dimensions (e.g., `album_name_320.jpg`)
- **Audio**: Descriptive names with `_preview` for samples
- **CSS**: Semantic naming with version numbers for external libraries
- **JavaScript**: Functional naming with version numbers
- **Markdown**: Kebab-case for content files

## Ignored Files

The following are excluded from version control:
- `_site/` - Generated site
- `.jekyll-cache/` - Jekyll cache
- Development and deployment specific files
- Image processing scripts (`convert_img.sh`, `resize_img.sh`)
