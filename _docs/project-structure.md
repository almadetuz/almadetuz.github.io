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
├── l/                       # Link shortening system
├── legal/                   # Legal pages (privacy, cookies)
├── coser-y-cantar/         # Workshop content
├── infusiones/             # Newsletter subscription pages
├── mis-canciones/          # Music catalog
├── taller/                 # Workshop/course content
├── u/                      # User-related pages
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
- `google_tag.html` - Google Tag Manager
- `fb_js.html` - Facebook Pixel

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
- `mail_form.html` - Email subscription form
- `form_js.html` - Form handling JavaScript
- `form_api_signup.html` - API form integration

#### Media & Links
- `button_image.html` - Image-based buttons
- `link_video.html` - Video embeds
- Product templates for merchandise

#### Specialized Components
- Link tracking components for music platforms
- Bootstrap JavaScript integration
- Cookie consent handling

### `_layouts/`
Page layout templates:
- `default.html` - Base HTML structure
- `page.html` - Standard content pages
- `landing.html` - Landing page layout
- `link.html` - Music/link sharing pages
- `tracking.html` - Pages with analytics
- `legal.html` - Legal page layout
- `confirm.html` - Confirmation pages
- `checkout.html` - E-commerce checkout
- `lead.html` - Lead generation pages
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
Jekyll collection for single content pieces:
- Song lyrics and individual content pieces
- Example: `brillamos_por_igual.md`

## Assets Directory

### `assets/css/`
- `styles.scss` - Main stylesheet (compiles SASS)
- `bootstrap.v5.3.3.min.css` - Bootstrap CSS
- `normalize.css` - CSS normalization
- `cookieconsent_v3.css` - Cookie consent styling

### `assets/js/`
JavaScript libraries and custom scripts:
- `amplitude_v261.js` - Analytics
- `bootstrap.bundle.v5.3.3.min.js` - Bootstrap JavaScript
- `api_v1.js` - API integration
- `forms_v2.js` - Form handling
- `link_v5.js` - Link management
- `scroll_v1.js` - Scroll tracking
- Third-party libraries (Axios, intersection observer, etc.)

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
- `coser-y-cantar/` - Workshop content
- `infusiones/` - Newsletter subscription
- `taller/` - Educational content

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
