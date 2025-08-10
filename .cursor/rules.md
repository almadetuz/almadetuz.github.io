# Cursor AI Agent Rules for Jekyll + Bootstrap + Mobile-First Projects

## 🎯 CORE DEVELOPMENT PRINCIPLES

When working on this Jekyll-based website, ALWAYS follow these principles:

### 1. MOBILE-FIRST MANDATORY
- Start EVERY component with mobile styles (no media queries)
- Use min-width media queries for larger screens
- Minimum 44px touch targets for all interactive elements
- Test mobile experience first, then scale up

### 2. COMPONENT-BASED ARCHITECTURE
- Create reusable Jekyll includes for ALL UI elements
- Single responsibility: one component = one function
- ALWAYS include parameter validation and default values
- Document usage examples in component comments

### 3. PERFORMANCE & SEO FIRST
- Every page MUST have unique title, meta description, and SEO image
- Use responsive images (WebP + JPEG fallback)
- Lazy load below-the-fold content
- Optimize for Core Web Vitals

## 📱 RESPONSIVE BREAKPOINTS (USE THESE EXACT VALUES)

```scss
$bp-thin: 360px;        // Minimal mobile devices
$bp-mobile: 576px;      // Standard mobile devices
$bp-tablet: 768px;      // Tablet devices
$bp-bigtablet: 908px;   // Large tablets
$bp-screen: 1280px;     // Desktop screens
$bp-wide: 1800px;       // Large desktop screens
```

## 🏗️ JEKYLL COMPONENT RULES

### ALWAYS Use This Component Template:
```liquid
<!--
  Component: component-name.html
  Purpose: Brief description

  Required Parameters:
  - param_name (string): Description

  Optional Parameters:
  - optional_param (string, default: "value"): Description

  Usage:
  {% include component-name.html
    param_name="value"
    optional_param="value"
  %}
-->

{% unless include.param_name %}
  {% error "component-name.html: param_name is required" %}
{% endunless %}

{% assign optional_param = include.optional_param | default: "default_value" %}

<div class="component-name {{ include.css_class }}">
  <!-- Component content -->
</div>
```

### Front Matter Requirements:
```yaml
---
title: Unique page title (50-60 characters)
layout: appropriate_layout
seo_description: Meta description (150-160 characters)
seo_image: /assets/images/page_seo.jpg
seo_image_width: 1280
seo_image_height: 720
---
```

## 🎨 BOOTSTRAP RULES

### NEVER use !important - Use CSS custom properties:
```scss
// ✅ CORRECT
.btn-primary {
  --bs-btn-bg: #{$color-brand-primary};
  --bs-btn-border-color: #{$color-brand-primary};
}

// ❌ WRONG
.btn-primary {
  background-color: #custom !important;
}
```

### ALWAYS use Bootstrap grid:
```html
<div class="container-fluid">
  <div class="row">
    <div class="col-12 col-md-6 col-lg-4">
      <!-- Content -->
    </div>
  </div>
</div>
```

## 🎯 FONT AWESOME RULES

### ALWAYS include accessibility:
```html
<!-- ✅ CORRECT -->
<i class="fas fa-envelope" aria-hidden="true"></i>
<span class="sr-only">Email</span>

<!-- ❌ WRONG -->
<i class="fas fa-envelope"></i>
```

## 💻 VANILLA JAVASCRIPT RULES

### ALWAYS use module pattern with error handling:
```javascript
(function() {
  'use strict';

  function handleAction(event) {
    try {
      // Implementation
    } catch (error) {
      console.error('Error:', error);
      // Graceful fallback
    }
  }

  // Event delegation
  document.addEventListener('click', function(event) {
    if (event.target.matches('.btn-action')) {
      handleAction(event);
    }
  });
})();
```

### NEVER use jQuery - use vanilla JS equivalents

## 🔍 SEO MANDATORY REQUIREMENTS

### Every page MUST have:
1. Unique title (50-60 characters)
2. Meta description (150-160 characters)
3. SEO image (1280x720px)
4. One H1 with target keyword
5. Alt text for ALL images
6. Semantic HTML5 structure

### URL Structure MUST be clean:
```
✅ GOOD: /mis-canciones/, /l/spotify/song-name/
❌ BAD: /page1.html, /music?id=123
```

## 🚀 PERFORMANCE RULES

### Images MUST be responsive with multiple formats:
```liquid
<picture>
  <source srcset="{{ webp_sizes }}" type="image/webp">
  <source srcset="{{ jpg_sizes }}" type="image/jpeg">
  <img src="{{ fallback }}" alt="{{ alt_text }}" loading="lazy">
</picture>
```

### CSS Organization MUST follow this order:
```scss
// 1. Variables
$color-primary: #value;

// 2. Mixins
@mixin component-style() {}

// 3. Base styles
body, html, h1 {}

// 4. Layout
.container, .header {}

// 5. Components
.component-name {}

// 6. Utilities
.text-center, .mb-4 {}
```

## 📊 ANALYTICS RULES

### ALWAYS check environment before tracking:
```javascript
if (environment === 'production') {
  amp_event('EventName', properties);
  fb_event('EventName');
  gads_event('conversion', 'event_name');
}
```

## 🧪 TESTING CHECKLIST

BEFORE submitting ANY code, verify:
- [ ] Mobile-first responsive design
- [ ] All images have alt text
- [ ] Forms work without JavaScript
- [ ] Page loads under 3 seconds
- [ ] SEO metadata complete
- [ ] No console errors
- [ ] Bootstrap classes used correctly
- [ ] Component parameters validated

## 🚫 COMMON MISTAKES TO AVOID

1. **Desktop-first CSS** - Always start mobile
2. **Hardcoded values** - Use SASS variables
3. **Missing alt text** - Required for all images
4. **jQuery usage** - Use vanilla JavaScript
5. **!important in CSS** - Use CSS custom properties
6. **Missing SEO metadata** - Required for all pages
7. **Non-semantic HTML** - Use proper HTML5 elements
8. **Large images** - Always optimize and provide multiple formats

## 📁 FILE ORGANIZATION RULES

```
_includes/
├── analytics/          # Analytics components
├── forms/             # Form components
├── layout/            # Header, footer, navigation
├── media/             # Image, video components
└── ui/                # Buttons, cards, etc.

_layouts/
├── base/              # Default, tracking layouts
├── content/           # Page, post layouts
└── specialized/       # Link, legal layouts

_sass/
├── base/              # Reset, base styles
├── components/        # Component styles
├── layout/            # Layout styles
└── utils/             # Utilities, helpers
```

## 🎵 MUSIC INDUSTRY SPECIFIC

### Link pages MUST include:
```yaml
seo_type: music.song
seo_audio: /assets/audio/preview.mp3
seo_music_duration: 217
seo_music_album: https://artist.bandcamp.com/album/album-title
seo_mobile_bandcamp_url: https://artist.bandcamp.com/album/album-title
```

### Platform buttons MUST support:
- Spotify (with deep linking)
- YouTube (with deep linking)
- Apple Music
- SoundCloud
- Bandcamp

## 🔄 DEVELOPMENT WORKFLOW

### Git Commit Format:
```
type(scope): JIRA-123 - description

Examples:
feat(components): JIRA-123 - add responsive image component
fix(forms): JIRA-123 - resolve validation issue
docs(readme): JIRA-123 - update setup instructions
```

### ALWAYS:
1. Test locally before pushing
2. Check responsive design
3. Validate HTML/CSS
4. Verify accessibility
5. Test form functionality
6. Check page speed
7. Validate analytics tracking

---

## 🚨 EMERGENCY RULES

If you're unsure about ANY implementation:
1. Check existing components for patterns
2. Follow mobile-first approach
3. Use Bootstrap utilities over custom CSS
4. Ensure accessibility compliance
5. Test performance impact
6. Document your code

**Remember: Quality over speed. Better to take time and follow these rules than create technical debt.**
