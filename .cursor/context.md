# Alma de Tüz Website - Project Context for Cursor AI

## 🎵 PROJECT OVERVIEW

**Alma de Tüz** is a Jekyll-based artist website for Amanda, a Spanish music therapist, teacher, musicologist, and singer. The site serves as her digital platform to share music, offer workshops, and connect with her audience.

## 🏗️ TECHNICAL ARCHITECTURE

### Technology Stack
- **Static Site Generator**: Jekyll (GitHub Pages compatible)
- **CSS Framework**: Bootstrap 5.3.3
- **Styling**: Custom SASS with responsive design
- **Icons**: Font Awesome (locally hosted)
- **JavaScript**: Vanilla JS (no jQuery)
- **Analytics**: Amplitude + Facebook Pixel + Google Ads
- **Forms**: Mailchimp integration
- **Hosting**: GitHub Pages

### Key Architecture Features
- **Component-based**: Reusable Jekyll includes system
- **Link Management**: Custom URL shortening (`/l/` directory)
- **Multi-platform**: Deep linking to Spotify, YouTube, Apple Music
- **SEO Optimized**: Music-specific metadata and social sharing
- **Responsive Assets**: Multiple image formats (WebP + JPEG)
- **Performance First**: Mobile-optimized with lazy loading

## 📁 PROJECT STRUCTURE

```
almadetuz.github.io/
├── _config.yml              # Jekyll configuration
├── _data/                   # YAML data (navigation, social, legal)
├── _includes/               # Reusable components
│   ├── analytics/          # Tracking components
│   ├── forms/              # Form components
│   ├── layout/             # Header, footer, navigation
│   └── ui/                 # Buttons, images, blocks
├── _layouts/                # Page templates
│   ├── default.html        # Base layout
│   ├── page.html           # Content pages
│   ├── link.html           # Music platform links
│   └── tracking.html       # Analytics wrapper
├── _sass/                   # Modular stylesheets
├── _singles/                # Song lyrics collection
├── assets/                  # Static assets
│   ├── css/                # Compiled styles
│   ├── js/                 # JavaScript files
│   ├── images/             # Responsive images
│   ├── audio/              # Song previews
│   ├── videos/             # Video content
│   └── webfonts/           # Font files
├── l/                       # Link shortening system
│   ├── spotify/            # Spotify links
│   ├── youtube/            # YouTube links
│   ├── artist/             # Artist profiles
│   └── [album]/            # Album-specific links
├── docs/                    # Architecture documentation
└── [content-sections]/      # Various content areas
```

## 🎨 DESIGN SYSTEM

### Color Palette
```scss
$color-almond: #E6D7C7;
$color-isabelline: #F9F5F1;
$color-jasmine: #FADE89;
$color-auburn-claro: #BA3F3B;
$color-auburn-semi: #AB3A36;
$color-auburn: #9A3531;
$color-auburn-oscuro: #8C2F2C;
$color-tea-rose: #E7B3B1;
$color-eerie-black: #212529;
```

### Typography
```scss
$font-h1-titular: 'Caprasimo';      # Display headings
$font-h2-subtitular: 'Sorts Mill Goudy';  # Subheadings
$font-title: 'DayDream';            # Special titles
$font-normal: 'Montserrat';         # Body text
```

### Responsive Breakpoints
```scss
$bp-thin: 360px;        # Minimal mobile
$bp-mobile: 576px;      # Standard mobile
$bp-tablet: 768px;      # Tablet
$bp-bigtablet: 908px;   # Large tablet
$bp-screen: 1280px;     # Desktop
$bp-wide: 1800px;       # Large desktop
```

## 🎵 MUSIC INDUSTRY FEATURES

### Platform Integration
- **Spotify**: Deep linking with track/artist/album IDs
- **YouTube**: Video embedding and deep linking
- **Apple Music**: Direct linking with affiliate parameters
- **SoundCloud**: Artist and track integration
- **Bandcamp**: Album and merchandise links

### Link Management System
- **URL Structure**: `/l/platform/content-name/`
- **SEO Optimization**: Music-specific metadata
- **Mobile Apps**: Deep linking to native apps
- **Analytics**: Platform-specific tracking
- **Social Sharing**: Rich media cards

### Content Types
- **Music Catalog**: Songs with embedded players
- **Workshops**: "Coser y Cantar" educational content
- **Newsletter**: "Infusiones de Tüz" email list
- **Artist Story**: Personal narrative and philosophy
- **Events**: Concert and workshop promotion

## 📊 ANALYTICS & TRACKING

### Multi-Platform Setup
```javascript
// Environment-aware tracking
if (environment === 'production') {
  amp_event('EventName', properties);    // Amplitude
  fb_event('EventName');                 // Facebook Pixel
  gads_event('conversion', 'event');     // Google Ads
}
```

### Key Metrics
- **Music Engagement**: Platform click-through rates
- **Newsletter Growth**: Email subscription rates
- **Workshop Interest**: Registration and inquiries
- **Geographic Data**: Audience location insights
- **Device Analytics**: Mobile vs desktop usage

## 🌍 LOCALIZATION

### Language: Spanish (Spain)
```yaml
lang: es_ES
```

### Cultural Context
- **Spanish Music Scene**: Independent artist focus
- **Music Therapy**: Professional therapeutic approach
- **Workshop Format**: In-person, intimate experiences
- **Storytelling**: Personal narrative and healing themes

## 🔧 DEVELOPMENT CONTEXT

### Local Development
```bash
# Jekyll build with watch
bundle exec jekyll build --watch

# Puma server (recommended)
bundle exec puma -p 4000
```

### Deployment
- **GitHub Pages**: Automatic deployment on push to main
- **Build Process**: Jekyll generates static site
- **Environment Detection**: JavaScript differentiates dev/prod

### Content Management
- **Markdown Files**: Primary content format
- **Front Matter**: YAML metadata for each page
- **Collections**: Jekyll collections for organized content
- **Data Files**: YAML files for structured data

## 🎯 BUSINESS OBJECTIVES

### Primary Goals
1. **Music Discovery**: Help people find and connect with Amanda's music
2. **Workshop Promotion**: Drive attendance to educational workshops
3. **Community Building**: Grow email newsletter audience
4. **Professional Presence**: Establish credibility as music therapist
5. **Personal Expression**: Share artistic journey and healing philosophy

### Success Metrics
- Newsletter subscription growth
- Music platform engagement
- Workshop registration rates
- Website performance (speed, SEO)
- Social media interaction

## 🚨 IMPORTANT CONSIDERATIONS

### Performance
- **Mobile First**: Majority of traffic is mobile
- **Loading Speed**: Critical for user experience
- **Image Optimization**: Large media files need optimization
- **Analytics Impact**: Multiple tracking scripts require optimization

### SEO Strategy
- **Spanish Keywords**: Target Spanish-speaking audience
- **Music Industry**: Genre-specific optimization
- **Local Search**: Madrid-based workshop promotion
- **Social Sharing**: Rich media for social platforms

### Privacy & Compliance
- **GDPR**: Cookie consent and data protection
- **Analytics Opt-in**: User choice for tracking
- **Email Consent**: Explicit newsletter opt-in
- **Creative Commons**: Content licensing clarity

## 🔄 MAINTENANCE NOTES

### Regular Tasks
- Update music catalog with new releases
- Promote upcoming workshops and events
- Monitor website performance and analytics
- Update social media links and content
- Maintain email newsletter content

### Technical Debt
- Image optimization workflow could be automated
- Some legacy CSS could be refactored
- Analytics setup could be streamlined
- Mobile performance could be improved

---

**Remember**: This is an artist's personal website that serves both creative expression and professional business needs. Every change should consider both the artistic vision and the practical goal of connecting Amanda with her audience through music and workshops.
