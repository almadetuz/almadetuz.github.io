# Development Workflow

This document describes the development setup, workflow, and best practices for the Alma de Tüz website.

## Development Environment Setup

### Prerequisites

#### System Requirements
- **Operating System**: Ubuntu/Linux (primary), macOS, or Windows with WSL
- **Ruby**: Compatible with GitHub Pages requirements
- **Git**: Version control

#### Ruby Installation (Ubuntu)

```bash
# Install Ruby and development tools
sudo apt-get install ruby-full build-essential zlib1g-dev

# Configure gem installation path
echo '# Install Ruby Gems to ~/gems' >> ~/.bashrc
echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc
echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Install Jekyll and Bundler
gem install jekyll bundler
```

### Project Setup

#### Initial Setup
```bash
# Clone repository
git clone https://github.com/almadetuz/almadetuz.github.io.git
cd almadetuz.github.io

# Install dependencies
bundle install
```

#### Dependency Management

**Gemfile Configuration**:
```ruby
# GitHub Pages compatibility
gem "github-pages", group: :jekyll_plugins

# Required plugins
group :jekyll_plugins do
  gem "jekyll-sitemap"
  gem "jekyll-feed"
end

# Development server options
gem 'rack-jekyll'
gem 'rake'
gem "puma"
```

### Local Development Options

#### Option 1: Jekyll Development Server

**Build and Watch**:
```bash
# Generate static files with automatic rebuilding
bundle exec jekyll build --watch
```

**Development Server**:
```bash
# Alternative: Jekyll's built-in server
bundle exec jekyll serve --watch
```

#### Option 2: Puma Server (Recommended)

**Terminal 1 - Build Process**:
```bash
bundle exec jekyll build --watch
```

**Terminal 2 - Web Server**:
```bash
bundle exec puma -p 4000
```

**Benefits of Puma Setup**:
- Better performance for complex sites
- Closer to production environment
- Improved asset serving
- Better error handling

## Development Workflow

### Branch Strategy

#### Main Branch
- **Purpose**: Production-ready code
- **Protection**: Direct commits discouraged
- **Deployment**: Automatic to GitHub Pages

#### Feature Development
```bash
# Create feature branch
git checkout -b feat/feature-name

# Work on feature
# Commit changes

# Push to remote
git push origin feat/feature-name

# Create pull request for review
```

### Code Organization

#### File Structure Guidelines
1. **Layouts**: Store in `_layouts/` with semantic names
2. **Components**: Use `_includes/` for reusable elements
3. **Styles**: Organize SASS files in `_sass/` by function
4. **Assets**: Follow naming conventions in `assets/`
5. **Content**: Use appropriate directories for content types

#### Naming Conventions

**Files and Directories**:
- Use kebab-case: `component-name.html`
- Descriptive names: `mail-form.html`, not `form.html`
- Version numbers for external assets: `bootstrap.v5.3.3.min.css`

**CSS Classes**:
- Follow BEM methodology where appropriate
- Use semantic names: `.button-primary`, not `.red-button`
- Component-specific prefixes: `.mail-form-container`

**JavaScript**:
- camelCase for variables and functions
- Descriptive function names: `handleFormSubmission()`
- Consistent event naming: `amp_event()`, `fb_event()`

### Development Best Practices

#### Content Development

**Front Matter Standards**:
```yaml
---
title: Page Title
layout: appropriate_layout
seo_description: SEO-optimized description
seo_image: /assets/images/seo_image.jpg
seo_image_width: 1280
seo_image_height: 720
---
```

**Markdown Guidelines**:
- Use semantic heading hierarchy (H1, H2, H3)
- Include alt text for all images
- Use Liquid includes for complex components
- Follow responsive image patterns

#### Component Development

**Include Parameters**:
```liquid
{% include component.html
  required_param="value"
  optional_param="value"
%}
```

**Parameter Validation**:
```liquid
{% if include.required_param %}
  <!-- Component content -->
{% else %}
  <!-- Error handling or default content -->
{% endif %}
```

#### Styling Development

**SASS Organization**:
```scss
// Variables first
$color-primary: #BA3F3B;

// Mixins and functions
@mixin responsive-text($size) {
  // Implementation
}

// Base styles
body {
  // Base styling
}

// Component styles
.component-name {
  // Component styling
}
```

**Responsive Development**:
```scss
// Mobile-first approach
.element {
  // Mobile styles
}

@media screen and (min-width: $bp-tablet) {
  .element {
    // Tablet styles
  }
}
```

## Asset Development

### Image Workflow

#### Image Preparation
1. **Source Images**: High-quality originals
2. **Sizing**: Generate multiple breakpoint sizes
3. **Optimization**: Compress for web delivery
4. **Formats**: Create WebP and JPEG variants

#### Image Processing Scripts
```bash
# Convert images to WebP format
./convert_img.sh

# Resize images for multiple breakpoints
./resize_img.sh
```

#### Manual Optimization
For new images without automated scripts:
```bash
# Example: Create responsive variants
convert source.jpg -resize 320x album_320.jpg
convert source.jpg -resize 480x album_480.jpg
convert source.jpg -resize 640x album_640.jpg
convert source.jpg -resize 1024x album_1024.jpg

# Create WebP variants
cwebp album_320.jpg -o album_320.webp
cwebp album_480.jpg -o album_480.webp
# Continue for all sizes
```

### Audio/Video Workflow

#### Audio Processing
1. **Source Files**: High-quality originals
2. **Preview Generation**: 30-60 second previews
3. **Format Optimization**: MP3 for web compatibility
4. **Metadata**: Include proper ID3 tags

#### Video Processing
1. **Compression**: Web-optimized MP4
2. **Poster Images**: Static fallback images
3. **Multiple Qualities**: Consider different resolutions
4. **Loading Optimization**: Lazy loading implementation

## Testing and Quality Assurance

### Local Testing

#### Functionality Testing
1. **Navigation**: Test all menu items and links
2. **Forms**: Verify form submission and validation
3. **Responsive**: Test across different screen sizes
4. **Performance**: Check page load times
5. **Analytics**: Verify tracking in development

#### Cross-Browser Testing
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Fallbacks**: Ensure graceful degradation

#### Content Validation
1. **Spelling/Grammar**: Proofread all content
2. **Links**: Verify internal and external links
3. **Images**: Check alt text and responsive behavior
4. **SEO**: Validate meta descriptions and titles

### Pre-Deployment Checklist

#### Code Quality
- [ ] No console errors in browser
- [ ] All forms function correctly
- [ ] Responsive design works across breakpoints
- [ ] Analytics tracking implemented
- [ ] SEO metadata complete

#### Content Review
- [ ] All content reviewed for accuracy
- [ ] Images optimized and responsive
- [ ] Audio/video files properly linked
- [ ] Legal compliance (privacy policy, etc.)

#### Performance
- [ ] Page load times acceptable
- [ ] Images properly optimized
- [ ] JavaScript loads without blocking
- [ ] CSS compiled correctly

## Deployment Process

### GitHub Pages Deployment

#### Automatic Deployment
- **Trigger**: Push to main branch
- **Process**: GitHub Pages builds automatically
- **Timeline**: Usually 1-2 minutes for simple changes

#### Build Monitoring
```bash
# Check build status
# Visit GitHub repository > Actions tab
# Review build logs for errors
```

### Manual Deployment Validation

#### Post-Deployment Testing
1. **Live Site Check**: Verify changes appear correctly
2. **Form Testing**: Test contact forms and subscriptions
3. **Analytics**: Confirm tracking works in production
4. **Performance**: Check loading times
5. **Mobile Testing**: Test on actual devices

## Troubleshooting

### Common Issues

#### Jekyll Build Errors
```bash
# Clear Jekyll cache
bundle exec jekyll clean

# Rebuild with verbose output
bundle exec jekyll build --verbose
```

#### Dependency Issues
```bash
# Update dependencies
bundle update

# Install missing dependencies
bundle install
```

#### SASS Compilation Errors
1. Check SASS syntax in `_sass/` files
2. Verify import paths in `styles.scss`
3. Look for undefined variables or mixins

#### Asset Loading Issues
1. Verify asset paths are correct
2. Check file permissions
3. Ensure assets exist in repository

### Debug Techniques

#### Local Development
```bash
# Serve with debug information
bundle exec jekyll serve --verbose --trace

# Build with incremental updates
bundle exec jekyll build --incremental
```

#### Production Debugging
1. **Browser DevTools**: Check console for errors
2. **Network Tab**: Verify all assets load
3. **Analytics**: Confirm tracking events fire
4. **Mobile Testing**: Use device simulation

## Maintenance Workflow

### Regular Maintenance Tasks

#### Weekly
- [ ] Review analytics for errors
- [ ] Check for broken links
- [ ] Update content as needed
- [ ] Review performance metrics

#### Monthly
- [ ] Update dependencies (`bundle update`)
- [ ] Review and optimize images
- [ ] Check SEO performance
- [ ] Backup repository

#### Quarterly
- [ ] Review overall site performance
- [ ] Update third-party integrations
- [ ] Assess new feature requirements
- [ ] Security audit

### Version Control Best Practices

#### Commit Message Format
```
type(scope): JIRA-123 - description

Examples:
feat(layout): JIRA-123 - add new landing page layout
fix(forms): JIRA-123 - resolve email validation issue
docs(readme): JIRA-123 - update installation instructions
style(css): JIRA-123 - improve responsive navigation
```

#### Commit Guidelines
1. **Atomic Commits**: One logical change per commit
2. **Descriptive Messages**: Clear commit descriptions
3. **Regular Commits**: Commit frequently with small changes
4. **Branch Naming**: Use descriptive branch names

#### Pull Request Process
1. **Create Feature Branch**: Work on separate branch
2. **Regular Pushes**: Push changes regularly
3. **Pull Request**: Create PR for review
4. **Code Review**: Review before merging
5. **Testing**: Verify changes work correctly
6. **Merge**: Merge to main branch
7. **Cleanup**: Delete feature branch after merge
