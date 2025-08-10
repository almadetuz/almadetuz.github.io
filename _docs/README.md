# Alma de Tüz Website Architecture Documentation

This documentation describes the architecture and structure of the Alma de Tüz website, a Jekyll-based static site hosted on GitHub Pages.

## Project Overview

**Alma de Tüz** is a personal artist website for Amanda, a music therapist, teacher, musicologist, and singer. The site serves as a platform to share her music, offer workshops, and connect with her audience through various content types.

## Technology Stack

- **Static Site Generator**: Jekyll 
- **Hosting**: GitHub Pages
- **CSS Framework**: Bootstrap 5.3.3
- **CSS Normalization**: Normalize.css
- **Icon Library**: Font Awesome
- **JavaScript Libraries**: 
  - Amplitude (analytics)
  - Axios (HTTP requests)
  - Custom tracking and form handling
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
- **Email subscription** integration with Mailchimp
- **Link shortening system** for music platforms and social media
- **Asset optimization** with multiple image formats and sizes
- **Form handling** with validation and tracking

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
