# Alma de Tüz Website Architecture Documentation

This documentation describes the architecture and structure of the Alma de Tüz website, a Jekyll-based static site hosted on GitHub Pages.

## Project Overview

**Alma de Tüz** is a personal artist website for Amanda, a music therapist, teacher, musicologist, and singer. The site serves as a platform to share her music, offer workshops, and connect with her audience through various content types.

## Technology Stack

- **Static Site Generator**: Jekyll 
- **Hosting**: GitHub Pages
- **CSS Framework**: Bootstrap 5.3.3
- **CSS Normalization**: Normalize.css
- **Icon Libraries**: Font Awesome (via SASS) and Bootstrap Icons 1.13.1
- **JavaScript Libraries**:
  - Amplitude (analytics, v2.6.1 with `analytics-browser` runtime)
  - Axios 1.6.8 (HTTP requests)
  - Intersection Observer + verge (scroll/visibility tracking)
  - Custom tracking and form handling (`api.js`, `forms.js`, `link.js`, `cta.js`, `scroll_v1.js`)
- **Deployment**: Automated through GitHub Pages
- **Alternative Local Server**: Puma (for development)

## Documentation Structure

This documentation is organized into the following sections:

1. **[Project Structure](./project-structure.md)** - Overall file organization
2. **[Jekyll Configuration](./jekyll-configuration.md)** - Jekyll setup and plugins
3. **[Layout System](./layout-system.md)** - Template hierarchy and layouts
4. **[Component System](./component-system.md)** - Reusable includes and partials
5. **[Styling Architecture](./styling-architecture.md)** - SASS/CSS organization
6. **[Content Management](./content-management.md)** - Content structure and collections
7. **[Asset Management](./asset-management.md)** - Media files and static assets
8. **[Link Management](./link-management.md)** - URL shortening and redirects
9. **[Analytics & Tracking](./analytics-tracking.md)** - Tracking implementation
10. **[SEO & Metadata](./seo-metadata.md)** - SEO optimization strategies
11. **[Development Workflow](./development-workflow.md)** - Local development setup

## Key Features

- **Multi-layout system** supporting different page types (landing, page, link, tracking)
- **Component-based architecture** with reusable Jekyll includes
- **Responsive design** with Bootstrap and custom SASS
- **SEO optimization** with comprehensive metadata handling
- **Analytics integration** with Amplitude, Facebook Pixel, and Google Ads
- **Email subscription** via custom signup API (`/u/confirmar.html` flow) with Mailchimp as the downstream provider
- **Link shortening system** for music platforms and social media (Spotify, YouTube, Bandcamp, Apple Music)
- **Asset optimization** with multiple image formats and sizes (WebP + JPEG)
- **Form handling** with validation, tracking and lead-capture variants (`mail_form.html`, `mail_form_lead.html`, `form_api_signup.html`)
- **Audio download flow** (`download` layout with optional auto-download)
- **Oracle/cards content** (`cartas/`) and workshop registration flows (`coser-y-cantar/`, `infusiones/`, `taller/`)

## Getting Started

To understand the codebase:

1. Start with [Project Structure](./project-structure.md) for an overview
2. Read [Jekyll Configuration](./jekyll-configuration.md) to understand the setup
3. Explore [Layout System](./layout-system.md) and [Component System](./component-system.md) for the template architecture
4. Review [Content Management](./content-management.md) for content organization

## Development Environment

The project supports both Jekyll's built-in server and Puma for local development. See [Development Workflow](./development-workflow.md) for detailed setup instructions.

## Maintenance Notes

- The site is designed for GitHub Pages compatibility
- All dependencies are managed through the `github-pages` gem
- Custom functionality is implemented through Jekyll includes and JavaScript
- Responsive design follows mobile-first principles

## Recent Areas of Active Iteration

- **Lead capture**: `mail_form_lead.html` + `form_api_signup.html` posting to `/u/confirmar.html` (custom signup API replaced direct Mailchimp form integration)
- **Cards content**: `cartas/dentro/` rewrite with companion `_singles/dentro.md`
- **Download flow**: `download` layout + `d/` directory for hashed audio download URLs (excluded from `sitemap.xml`)
- **Bandcamp-first**: Bandcamp is the primary album destination for music link pages; Spotify deep links remain available via a separate field
- **Tracking**: `transaction_id` minted from `fbclid` for FB CAPI dedup; `utm_id`, `campaign_id`, `ad_id` persisted in `localStorage.adt_last_utms`
