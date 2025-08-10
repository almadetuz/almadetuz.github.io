# Jekyll Configuration

This document describes the Jekyll setup and configuration for the Alma de Tüz website.

## Configuration Overview

The site is configured in `_config.yml` and designed for GitHub Pages deployment with additional Puma server support for local development.

## Core Configuration

### Site Metadata
```yaml
title: Alma de Tüz
lang: es_ES
email: amanda@almadetuz.com
description: "Arquitecturas sonoras para sanar"
url: "https://www.almadetuz.com"
host: "www.almadetuz.com"
logo: /assets/images/icon.png
```

### Collections
```yaml
collections:
  singles:
    output: true
```
- **Singles Collection**: For individual song lyrics and content pieces
- **Output**: `true` enables individual pages for each collection item

### Default Layout
```yaml
defaults:
  - scope:
      path: ""
    values:
      layout: "default"
```
All pages use the `default` layout unless explicitly overridden.

## Plugins

### Installed Plugins
```yaml
plugins:
  - jekyll-feed
  - jekyll-sitemap
```

#### jekyll-feed
- Generates RSS/Atom feeds automatically
- Accessible at `/feed.xml`
- Includes recent posts and updates

#### jekyll-sitemap
- Automatically generates `/sitemap.xml`
- Helps with SEO and search engine indexing
- Includes all pages, posts, and collection items

## SEO Configuration

### Global SEO Settings
- **Twitter**: Username and card type configured
- **SEO Image**: Default social sharing image
- **Language**: Set to Spanish (`es_ES`)
- **Description**: Used for meta descriptions

### Open Graph Support
The site includes comprehensive Open Graph metadata for social sharing:
- Site name, title, description
- Image metadata with dimensions
- Locale and URL canonicalization

## Excluded Files

```yaml
exclude:
  - .jekyll-cache/
  - Gemfile
  - Gemfile.lock
  - README.md
  - LICENSE
  - Procfile
  - convert_img.sh
  - resize_img.sh
  - config.ru
  - Rakefile
```

These files are excluded from the generated site to keep it clean and secure.

## Dependencies (Gemfile)

### GitHub Pages Integration
```ruby
gem "github-pages", group: :jekyll_plugins
```
- Uses GitHub Pages gem for compatibility
- Ensures consistent Jekyll version with GitHub Pages
- Includes common plugins automatically

### Plugin Dependencies
```ruby
group :jekyll_plugins do
  gem "jekyll-sitemap"
  gem "jekyll-feed"
end
```

### Development Server
```ruby
gem 'rack-jekyll'
gem 'rake'
gem "puma"
```
- **Puma**: Alternative web server for local development
- **Rack-Jekyll**: Rack adapter for Jekyll
- **Rake**: Build task automation

## Development vs Production

### Local Development
- Uses `bundle exec jekyll build --watch` for automatic rebuilding
- Puma server on port 4000 via `bundle exec puma -p 4000`
- Environment detection via JavaScript in templates

### Production (GitHub Pages)
- Automatic deployment on push to main branch
- Jekyll builds automatically on GitHub's servers
- Uses GitHub Pages gem for consistency

## Environment Detection

JavaScript in templates detects environment:
```javascript
var environment = document.location.host.includes("{{ site.host }}") ? "production" : "devel";
```

This enables:
- Different analytics behavior in development vs production
- Conditional loading of tracking scripts
- Debug information in development

## Custom Configuration Features

### Base URL Configuration
```yaml
baseurl: ""
```
- Empty baseurl for root domain hosting
- Simplifies URL generation in templates

### Jekyll Processing
- SASS compilation enabled by default
- Markdown processing with Kramdown
- Liquid templating engine
- Automatic permalink generation

## Build Process

### Static File Generation
1. SASS files compiled to CSS
2. Markdown files processed to HTML
3. Liquid templates rendered
4. Assets copied to `_site/`
5. Collections processed and output

### Asset Pipeline
- CSS concatenation and minification (via SASS)
- Image optimization (manual via scripts)
- JavaScript bundling (manual)
- Font subsetting and optimization

## Performance Optimizations

### Jekyll Optimizations
- Incremental builds with `--incremental` (development)
- Live reload with `--watch`
- Asset fingerprinting for cache busting

### GitHub Pages Limitations
- No custom plugins beyond those in github-pages gem
- No server-side processing
- Limited to Jekyll's static generation capabilities

## Future Considerations

### Potential Enhancements
- Image optimization plugins (if GitHub Pages adds support)
- Asset minification plugins
- Advanced SEO plugins
- Performance monitoring integration

### Constraints
- Must maintain GitHub Pages compatibility
- Limited to approved plugins
- No server-side processing capabilities
- Static generation only
