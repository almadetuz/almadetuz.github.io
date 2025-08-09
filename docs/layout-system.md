# Layout System

This document describes the template hierarchy and layout architecture of the Alma de Tüz website.

## Layout Hierarchy

The site uses a hierarchical layout system with inheritance and composition patterns:

```
default.html (base)
├── tracking.html (adds analytics)
│   ├── page.html (content pages)
│   ├── landing.html (marketing pages)
│   └── legal.html (legal pages)
├── link.html (music platform links)
├── confirm.html (confirmation pages)
├── lead.html (lead generation)
├── checkout.html (e-commerce)
└── suscribed.html (subscription success)
```

## Base Layout: `default.html`

### Structure
```html
<!doctype html>
<html lang="es">
<head>
  <!-- Meta tags, SEO, stylesheets -->
</head>
<body class="{{ layout.body_class }}">
  <!-- Analytics initialization -->
  {{ content }}
  <!-- Bootstrap JavaScript -->
</body>
</html>
```

### Key Features
- **HTML5 Document Structure**: Semantic HTML with Spanish language
- **Responsive Viewport**: Mobile-first responsive design
- **CSS Framework Integration**: 
  - Normalize.css for cross-browser consistency
  - Bootstrap 5.3.3 for layout and components
  - Custom SASS compilation
- **SEO Integration**: Includes SEO partial for meta tags
- **Analytics Setup**: JavaScript initialization for tracking
- **Dynamic Body Classes**: CSS classes based on layout type

### Asset Loading
```html
<!-- CSS (in order) -->
<link rel="stylesheet" href="/assets/css/normalize.css">
<link rel="stylesheet" href="/assets/css/bootstrap.v5.3.3.min.css">
<link rel="stylesheet" href="/assets/css/cookieconsent_v3.css">
<link rel="stylesheet" href="/assets/css/styles.css">

<!-- JavaScript -->
{% include bootstrap_js.html %}
```

## Tracking Layout: `tracking.html`

### Purpose
Intermediate layout that adds analytics and tracking capabilities.

### Structure
```yaml
---
layout: default
---
```

### Features
- **Inherits from**: `default.html`
- **Adds**: Analytics integration and tracking scripts
- **Body Class**: Sets dynamic body classes for styling
- **Cookie Preferences**: Includes cookie consent modal option

## Content Layouts

### Page Layout: `page.html`

**Purpose**: Standard content pages (blog posts, about, etc.)

**Structure**:
```html
<header>{% include header.html %}</header>
<main>{{ content }}</main>
<footer>
  {% include footer.html %}
</footer>
```

**Features**:
- Standard three-column layout (header, main, footer)
- SEO optimization with page view tracking
- Social sharing integration
- Responsive navigation

**Body Class**: `page`

### Landing Layout: `landing.html`

**Purpose**: Marketing and promotional pages

**Structure**:
```html
<header>{% include header.html %}</header>
<main>{{ content }}</main>
<footer>
  {% include more.html %}
  {% include footer.html %}
</footer>
```

**Features**:
- Includes additional "more" section in footer
- Optimized for conversion tracking
- Enhanced call-to-action support

**Body Class**: `page`

### Link Layout: `link.html`

**Purpose**: Music platform integration and link sharing

**Structure**:
```html
---
layout: tracking
body_class: link
---
{{ content }}
```

**Features**:
- Clean, minimal design for music sharing
- Platform-specific styling
- Deep-link support for mobile apps
- Social media optimization
- Custom background (white)

### Legal Layout: `legal.html`

**Purpose**: Privacy policies, terms of service, legal compliance

**Structure**:
```html
---
layout: tracking
body_class: page
preference_modal: true
---
<header>{% include header.html %}</header>
<main>{{ content }}</main>
<footer>{% include footer.html %}</footer>
```

**Features**:
- Cookie preference modal integration
- GDPR compliance features
- Standard page structure with legal-specific enhancements

## Specialized Layouts

### Confirm Layout: `confirm.html`

**Purpose**: Action confirmation pages

**Features**:
- Minimal distraction design
- Success messaging
- Next action guidance

### Lead Layout: `lead.html`

**Purpose**: Lead generation and conversion

**Features**:
- Conversion tracking integration
- Form optimization
- A/B testing support

### Checkout Layout: `checkout.html`

**Purpose**: E-commerce transactions

**Features**:
- Secure transaction handling
- Payment integration
- Order confirmation

### Suscribed Layout: `suscribed.html`

**Purpose**: Subscription confirmation

**Features**:
- Welcome messaging
- Next steps guidance
- Engagement encouragement

## Layout Configuration

### Front Matter Variables

Layouts can be configured via front matter:

```yaml
---
layout: tracking
body_class: page
preference_modal: true
---
```

**Common Variables**:
- `layout`: Parent layout inheritance
- `body_class`: CSS class for body element
- `preference_modal`: Enable cookie preferences

### Dynamic Content

Layouts support dynamic content through:
- `{{ content }}` - Main page content
- `{{ page.title }}` - Page title
- `{{ page.url }}` - Current page URL
- Custom front matter variables

## Responsive Design

### Breakpoints
Layouts are responsive with these breakpoints:
- Thin: 360px
- Mobile: 576px
- Tablet: 768px
- Big Tablet: 908px
- Screen: 1280px
- Wide: 1800px

### Layout Adaptations
- Header navigation collapses on mobile
- Footer content reorganizes for smaller screens
- Typography scales with viewport size
- Image sizing adapts to screen resolution

## Analytics Integration

### Page View Tracking
```javascript
document.addEventListener("DOMContentLoaded", (event) => {
  amp_event('PageView', web_event_prop);
  fb_event('ViewContent');
  gads_event('conversion', 'pageview');
});
```

### UTM Parameter Handling
Layouts automatically capture and persist UTM parameters for attribution tracking.

## SEO Optimization

### Meta Tag Management
All layouts include comprehensive SEO meta tags:
- Title optimization
- Description meta tags
- Open Graph properties
- Twitter Card metadata
- Canonical URLs
- Schema markup

### Performance Considerations
- CSS loaded in critical order
- JavaScript deferred where possible
- Image lazy loading support
- Font optimization

## Customization Patterns

### Extending Layouts
New layouts should inherit from appropriate base layouts:

```yaml
---
layout: tracking  # or default
body_class: custom
---
```

### Layout-Specific Styling
Use body classes for layout-specific CSS:

```scss
body.link {
  background-color: white;
  // Link-specific styles
}

body.page {
  max-width: 920px;
  margin: auto;
  // Page-specific styles
}
```

### Component Integration
Layouts integrate with the component system via includes:

```html
{% include header.html %}
{% include mail_form.html %}
{% include footer.html %}
```
