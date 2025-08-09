# Styling Architecture

This document describes the SASS/CSS organization and styling system for the Alma de Tüz website.

## CSS Framework Stack

### Core Technologies
- **SASS/SCSS**: CSS preprocessing with variables, mixins, and organization
- **Bootstrap 5.3.3**: CSS framework for layout and components
- **Normalize.css**: Cross-browser CSS normalization
- **Font Awesome**: Icon system
- **Custom Fonts**: Typography enhancement

### Loading Order
```html
<!-- 1. Normalize for cross-browser consistency -->
<link rel="stylesheet" href="/assets/css/normalize.css">

<!-- 2. Bootstrap for layout framework -->
<link rel="stylesheet" href="/assets/css/bootstrap.v5.3.3.min.css">

<!-- 3. Cookie consent styling -->
<link rel="stylesheet" href="/assets/css/cookieconsent_v3.css">

<!-- 4. Custom styles (compiled SASS) -->
<link rel="stylesheet" href="/assets/css/styles.css">
```

## SASS Organization

### Main Stylesheet (`assets/css/styles.scss`)

#### Variables
```scss
// Breakpoints
$bp-thin: 360px;
$bp-mobile: 576px;
$bp-tablet: 768px;
$bp-bigtablet: 908px;
$bp-screen: 1280px;
$bp-wide: 1800px;

// Brand Colors
$color-almond: #E6D7C7;
$color-isabelline: #F9F5F1;
$color-jasmine: #FADE89;
$color-auburn-claro: #BA3F3B;
$color-auburn-semi: #AB3A36;
$color-auburn: #9A3531;
$color-auburn-oscuro: #8C2F2C;
$color-tea-rose: #E7B3B1;
$color-eerie-black: #212529;

// Typography
$font-h1-titular: 'Caprasimo';
$font-h2-subtitular: 'Sorts Mill Goudy';
$font-title: 'DayDream';
$font-button-image-title: 'Caprasimo';
$font-normal: 'Montserrat';
```

#### Import Structure
```scss
@import "fonts";      // Typography definitions
@import "logo";       // Logo and branding
@import "form";       // Form styling
@import "main";       // Main component styles
@import "video";      // Video component styles
@import "carousel";   // Carousel component styles

// Font Awesome
@import "fa/fontawesome";
@import "fa/solid";
@import "fa/brands";
```

## Modular SASS Files

### Typography (`_sass/fonts.scss`)
- Font loading and optimization
- Typography scale definitions
- Font family fallbacks
- Custom font integration

### Logo and Branding (`_sass/logo.scss`)
- Logo sizing and responsive behavior
- Brand element styling
- Header customizations

### Form Styling (`_sass/form.scss`)
- Form component styling
- Input and button styling
- Validation state styling
- Responsive form layouts

### Main Styles (`_sass/main.scss`)
Contains the majority of custom styles including:

#### Base Elements
```scss
body {
  color: $color-eerie-black;
  background-color: $color-isabelline;
}

body.page {
  font-family: Montserrat, sans-serif;
  max-width: 920px;
  margin: auto;
}
```

#### Typography System
```scss
h1 {
  font-size: 32px;
  margin-top: 10px;
}

@media screen and (min-width: $bp-tablet) {
  h1 {
    font-size: 40px;
  }
}

h1.titular, h2.titular {
  font-family: $font-h1-titular;
}

h2.subtitular {
  font-family: $font-h2-subtitular;
}
```

#### Button System
```scss
.btn-primary {
  --bs-btn-color: #fff;
  --bs-btn-bg: #{$color-auburn-claro};
  --bs-btn-border-color: #{$color-auburn-claro};
  --bs-btn-hover-bg: #{$color-auburn-semi};
  --bs-btn-active-bg: #{$color-auburn};
}
```

#### Image System
```scss
img.img-left, img.img-right,
img.img-center, img.img-center-320, img.img-center-480, img.img-center-640 {
  display: block;
  width: 100%;
  margin: auto;
  border-radius: var(--bs-border-radius);
}

@media screen and (min-width: $bp-mobile) {
  img.img-left {
    width: 216px;
    float: left;
    margin: 10px 20px 10px 0px;
  }
}
```

### Video Styling (`_sass/video.scss`)
- Video container styling
- Responsive video embeds
- Video overlay effects

### Carousel Styling (`_sass/carousel.scss`)
- Bootstrap carousel customizations
- Control and indicator styling
- Responsive carousel behavior

## Component-Specific Styling

### Background Color System
```scss
.bg-dark { background-color: rgba(33, 37, 41, 1); }
.bg-rose { background-color: $color-tea-rose; }
.bg-yellow { background-color: rgba(253, 255, 162, 1); }
.bg-white { background-color: rgba(255, 255, 255, 1); }
```

### Text Color Utilities
```scss
.text-soft-white { color: rgba(221, 221, 221, 1)!important; }
.text-soft-black { color: rgba(33, 37, 41, 1)!important; }
```

### Layout-Specific Styles

#### Page Layout
```scss
body.page {
  font-family: Montserrat, sans-serif;
  max-width: 920px;
  margin: auto;
}
```

#### Link Layout
```scss
body.link {
  background-color: white;
}
```

### Button Image Component
```scss
.button-image .bg-image {
  display: inline-block;
  position: relative;
  width: 100%;
  max-width: 320px;
  height: 180px;
}

.button-image .title {
  font-family: $font-button-image-title;
  font-size: 1.5em;
  padding: 15px 5px 10px 15px;
}

.button-image .icon {
  position: absolute;
  bottom: 0px;
  right: 12px;
  font-size: 3em;
}
```

## Font Awesome Integration

### Custom Font Awesome Styles
Located in `_sass/fa/` directory:
- Core Font Awesome functionality
- Icon customizations
- Brand and solid icon sets
- Animation and sizing utilities

### Icon Usage
```scss
#contact .social-networks-icons {
  font-size: 1.4em;
}

#contact .social-networks-icons i {
  padding: 0px 6px;
}
```

## Responsive Design System

### Breakpoint Strategy
The site uses a mobile-first approach with these breakpoints:

1. **Thin** (360px): Minimal mobile devices
2. **Mobile** (576px): Standard mobile devices
3. **Tablet** (768px): Tablet devices
4. **Big Tablet** (908px): Large tablets
5. **Screen** (1280px): Desktop screens
6. **Wide** (1800px): Large desktop screens

### Responsive Patterns

#### Typography Scaling
```scss
h1 {
  font-size: 32px;
}

@media screen and (min-width: $bp-tablet) {
  h1 {
    font-size: 40px;
  }
}
```

#### Layout Adaptations
```scss
div.mobile_social {
  visibility: visible;
}

div.social {
  height: 0px;
  visibility: hidden;
}

@media screen and (min-width: $bp-mobile) {
  div.mobile_social {
    visibility: hidden;
    width: 0px;
    height: 0px;
  }
  
  div.social {
    visibility: visible;
    padding-bottom: 2rem;
  }
}
```

#### Image Responsiveness
```scss
@media screen and (min-width: $bp-mobile) {
  img.img-center-320 { width: 320px; }
  img.img-center-480 { width: 480px; }
  img.img-center-640 { width: 640px; }
}
```

## Performance Optimizations

### CSS Optimization
- SASS compilation reduces file size
- Variable usage ensures consistency
- Modular imports enable maintenance
- Media query organization

### Font Loading
- Local font files for performance
- Font display optimization
- Subset loading for efficiency

### Critical CSS
- Bootstrap included separately for caching
- Custom styles compiled into single file
- Minimize render-blocking CSS

## Bootstrap Customization

### Bootstrap Override Strategy
Rather than modifying Bootstrap directly, the site uses CSS custom properties:

```scss
.btn-primary {
  --bs-btn-color: #fff;
  --bs-btn-bg: #{$color-auburn-claro};
  // Additional overrides
}
```

### Bootstrap Component Extensions

#### Carousel Customization
```scss
.carousel-indicators [data-bs-target] {
  background-color: #222;
  opacity: .8;
}

.carousel-control-next-icon {
  background-image: url("data:image/svg+xml,...");
}
```

#### Container Customization
```scss
.container-fluid {
  --bs-gutter-x: 3rem;
}
```

## Maintenance and Development

### Style Guide Principles
1. **Mobile-First**: All styles start with mobile and scale up
2. **Component-Based**: Styles organized by component function
3. **Variable-Driven**: Use SASS variables for consistency
4. **Modular**: Separate concerns into different SASS files
5. **Bootstrap-Compatible**: Work with, not against, Bootstrap

### Adding New Styles
1. Identify the appropriate SASS file
2. Use existing variables when possible
3. Follow responsive patterns
4. Test across all breakpoints
5. Document any new patterns

### CSS Architecture Guidelines
- Use semantic class names
- Prefer composition over inheritance
- Minimize specificity conflicts
- Group related styles together
- Comment complex calculations or decisions
