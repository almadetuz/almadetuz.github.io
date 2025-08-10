# Asset Management

This document describes the organization, optimization, and management of static assets in the Alma de Tüz website.

## Asset Organization

### Directory Structure

```
assets/
├── css/                    # Stylesheets
│   ├── styles.scss        # Main SASS file
│   ├── bootstrap.v5.3.3.min.css
│   ├── normalize.css
│   └── cookieconsent_v3.css
├── js/                     # JavaScript files
│   ├── Custom scripts
│   └── Third-party libraries
├── images/                 # Image assets
│   ├── Album artwork
│   ├── Artist photos
│   ├── Event images
│   └── Subdirectories by album/content
├── audio/                  # Audio files
│   ├── Song previews
│   ├── Full tracks
│   └── Album subdirectories
├── videos/                 # Video content
│   └── Teasers and promotional videos
└── webfonts/              # Font files
    ├── Custom fonts
    ├── Google Fonts
    └── Font Awesome icons
```

## Image Management

### Responsive Image Strategy

The site implements a comprehensive responsive image system with multiple formats and sizes:

#### Size Variants
- **320w**: Mobile devices
- **480w**: Large mobile/small tablet
- **640w**: Tablet devices
- **1024w**: Desktop and high-resolution displays

#### Format Support
- **WebP**: Modern browsers (primary format)
- **JPEG**: Fallback for older browsers
- **PNG**: Specific use cases (icons, transparency)

### Image Naming Convention

```
content_description_size.extension
```

Examples:
- `alma_de_tuz_artist_320.jpg`
- `dentro_single_640.webp`
- `raices_teaser.jpg`

### Image Usage Patterns

#### Responsive Images in Components
```liquid
{% include link_track_image.html
  artwork="/assets/images/dentro_single.jpg"
  artwork_webp_sizes="/assets/images/dentro_single.webp 1024w, /assets/images/dentro_single_640.webp 640w, /assets/images/dentro_single_480.webp 480w, /assets/images/dentro_single_320.webp 320w"
  artwork_jpg_sizes="/assets/images/dentro_single.jpg 1024w, /assets/images/dentro_single_640.jpg 640w, /assets/images/dentro_single_480.jpg 480w, /assets/images/dentro_single_320.jpg 320w"
%}
```

#### CSS Image Classes
```scss
img.img-center-320 { width: 320px; }
img.img-center-480 { width: 480px; }
img.img-center-640 { width: 640px; }

img.img-left {
  float: left;
  margin: 10px 20px 10px 0px;
}

img.img-right {
  float: right;
  margin: 10px 0px 10px 20px;
}
```

#### Markdown Image Integration
```markdown
![Album Art](/assets/images/song_artwork_480.jpg){: .img-center-480 }
![Artist Photo](/assets/images/artist_photo_320.jpg){: .img-left }
```

### Album Artwork Organization

Albums are organized in subdirectories for better management:

#### Dentro del Laberinto Album
```
assets/images/dentro-del-laberinto/
├── 02_colibri_320.jpg
├── 02_colibri_320.webp
├── 02_colibri_480.jpg
├── 02_colibri_480.webp
├── [additional tracks...]
└── album_artwork_variants
```

#### La Penúltima Album
```
assets/images/la-penultima/
├── la_penultima_320.jpg
├── la_penultima_320.webp
├── [additional variants...]
```

### SEO Image Strategy

Each page includes optimized SEO images:

```yaml
seo_image: /assets/images/content_seo.jpg
seo_image_width: 1280
seo_image_height: 720
```

**SEO Image Standards**:
- **Dimensions**: 1280x720px (16:9 aspect ratio)
- **Format**: JPEG for compatibility
- **Quality**: Optimized for social sharing
- **Content**: Relevant visual representation

## Audio Asset Management

### Audio File Organization

```
assets/audio/
├── Song previews (30-60 seconds)
├── Full tracks (where permitted)
├── Album subdirectories
└── Specialized content (infusions, etc.)
```

### Audio File Naming
```
song_title_preview.mp3
song_title.mp3 (full versions)
```

Examples:
- `dentro_preview.mp3`
- `alas_en_mi_preview.mp3`
- `universo_preview.mp3`

### Audio Integration

#### SEO Audio Metadata
```yaml
seo_audio: /assets/audio/preview.mp3
seo_audio_type: audio/mpeg
seo_music_duration: 217
```

#### Player Integration
Audio files are referenced in music platform components and SEO metadata for rich social sharing.

## Video Asset Management

### Video Organization
```
assets/videos/
├── Teasers (.mp4 format)
├── Promotional content
└── Optimized for web delivery
```

### Video Usage Patterns

#### Carousel Video Integration
```html
<video autoplay muted loop
       poster="/assets/images/video_poster.jpg"
       src="/assets/videos/video_teaser.mp4" 
       type="video/mp4" 
       loading="lazy">
</video>
```

#### Video Optimization
- **Format**: MP4 for broad compatibility
- **Compression**: Web-optimized quality
- **Posters**: Static image fallbacks
- **Loading**: Lazy loading for performance

## Font Asset Management

### Font Organization

```
assets/webfonts/
├── caprasimo/           # Display font
├── caveat/              # Handwriting font
├── daydream/            # Custom title font
├── imfelldoublepica/    # Serif font
├── montserrat/          # Body text font
├── wonderful/           # Custom branding font
└── fa/                  # Font Awesome icons
```

### Font Loading Strategy

#### SASS Integration
```scss
$font-h1-titular: 'Caprasimo';
$font-h2-subtitular: 'Sorts Mill Goudy';
$font-title: 'DayDream';
$font-normal: 'Montserrat';
```

#### Font Display Optimization
Fonts are optimized for performance with proper `font-display` properties and subset loading where possible.

## CSS Asset Management

### Stylesheet Organization

#### External Libraries
- `bootstrap.v5.3.3.min.css`: Bootstrap framework
- `normalize.css`: Cross-browser normalization
- `cookieconsent_v3.css`: Cookie consent styling

#### Custom Styles
- `styles.scss`: Compiled SASS with imports
- Modular SASS files in `_sass/` directory

### CSS Compilation Process
1. SASS files in `_sass/` directory
2. Main `styles.scss` imports modules
3. Jekyll compiles to `styles.css`
4. Automatic vendor prefixing
5. Production minification

## JavaScript Asset Management

### JavaScript Organization

```
assets/js/
├── analytics-browser-2.6.1-min.js    # Analytics
├── amplitude_v261.js                  # Amplitude tracking
├── api_v1.js                         # API integration
├── axios.v1.6.8.min.js               # HTTP client
├── bootstrap.bundle.v5.3.3.min.js    # Bootstrap JS
├── cookieconsent_v3.js               # Cookie consent
├── forms_v2.js                       # Form handling
├── link_v5.js                        # Link management
├── scroll_v1.js                      # Scroll tracking
└── Third-party utilities
```

### JavaScript Loading Strategy

#### Critical JavaScript
```html
<!-- Inline analytics initialization -->
<script type="text/javascript">
var environment = document.location.host.includes("{{ site.host }}") ? "production" : "devel";
// Analytics setup
</script>
```

#### Component JavaScript
```liquid
{% include form_js.html %}
{% include bootstrap_js.html %}
```

#### Deferred Loading
Non-critical JavaScript is loaded after page content to improve performance.

## Asset Optimization

### Image Optimization Process

#### Manual Scripts
- `convert_img.sh`: Image format conversion
- `resize_img.sh`: Batch resizing for multiple breakpoints

#### Optimization Strategies
1. **Multiple Formats**: WebP with JPEG fallbacks
2. **Multiple Sizes**: Responsive image variants
3. **Compression**: Optimized quality settings
4. **Lazy Loading**: Deferred loading for below-the-fold images

### Performance Considerations

#### Asset Loading Priority
1. **Critical CSS**: Inline or high-priority loading
2. **Font Assets**: Optimized loading with `font-display`
3. **Images**: Lazy loading and responsive delivery
4. **JavaScript**: Deferred loading for non-critical scripts

#### Caching Strategy
- **Static Assets**: Long cache headers
- **Versioned Assets**: Cache busting for updates
- **CDN Integration**: Browser caching optimization

## Asset Development Workflow

### Adding New Assets

#### Images
1. **Source Preparation**: High-quality source image
2. **Resize Generation**: Create all required sizes
3. **Format Conversion**: Generate WebP variants
4. **Optimization**: Compress for web delivery
5. **Integration**: Update templates and components

#### Audio/Video
1. **Source Processing**: Optimize for web delivery
2. **Format Conversion**: Ensure compatibility
3. **Compression**: Balance quality and file size
4. **Metadata**: Add appropriate tags and descriptions

### Asset Maintenance

#### Regular Tasks
1. **Audit Unused Assets**: Remove orphaned files
2. **Optimize Existing**: Re-compress when tools improve
3. **Update Formats**: Adopt new web standards
4. **Performance Review**: Monitor loading times

#### Quality Assurance
1. **Format Support**: Test across browsers
2. **Responsive Behavior**: Verify scaling
3. **Loading Performance**: Monitor metrics
4. **Accessibility**: Ensure alt text and descriptions

## Build Integration

### Jekyll Asset Processing
- **SASS Compilation**: Automatic CSS generation
- **Asset Copying**: Static files to `_site/`
- **Path Resolution**: Relative URL handling
- **Cache Busting**: Development vs production

### GitHub Pages Limitations
- **No Dynamic Processing**: Static files only
- **Size Limits**: Repository size constraints
- **Format Support**: Limited to standard web formats
- **Build Time**: Consideration for large asset collections

## Future Enhancements

### Potential Improvements
1. **Automated Optimization**: CI/CD image processing
2. **CDN Integration**: External asset delivery
3. **Advanced Formats**: AVIF image support
4. **Progressive Enhancement**: Advanced loading strategies
5. **Performance Monitoring**: Automated asset auditing
