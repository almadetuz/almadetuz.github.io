# Alma de Tüz Website

[🌐 Visit the live website](https://www.almadetuz.com)

**Alma de Tüz** is a Jekyll-based artist website for Amanda, a music therapist, teacher, musicologist, and singer. The site showcases her music, offers workshops, and connects with her audience through various content types.

## 📚 Complete Documentation

For comprehensive information about the website's architecture, development workflow, and all technical details, please refer to:

**[📖 Full Documentation](docs/README.md)**

The documentation covers:
- Project architecture and structure
- Jekyll configuration and layouts
- Component system and styling
- Content management and SEO
- Analytics and link management
- Development workflow and best practices

## 🚀 Quick Start (Ubuntu Linux)

### Prerequisites

Ensure you have the following installed:
```bash
# Update package list
sudo apt update

# Install Ruby, development tools, and dependencies
sudo apt-get install ruby-full build-essential zlib1g-dev git
```

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/almadetuz/almadetuz.github.io.git
   cd almadetuz.github.io
   ```

2. **Configure Ruby gems path** (to avoid using sudo)
   ```bash
   echo '# Install Ruby Gems to ~/gems' >> ~/.bashrc
   echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc
   echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashrc
   source ~/.bashrc
   ```

3. **Install Jekyll and Bundler**
   ```bash
   gem install jekyll bundler
   ```

4. **Install project dependencies**
   ```bash
   bundle install
   ```

### Development

#### Option 1: Jekyll Built-in Server
```bash
# Start development server with live reload
bundle exec jekyll serve --watch
# Site available at http://localhost:4000
```

#### Option 2: Puma Server (Recommended)
```bash
# Terminal 1: Build with automatic regeneration
bundle exec jekyll build --watch

# Terminal 2: Start Puma web server
bundle exec puma -p 4000
# Site available at http://localhost:4000
```

**Why Puma?** Provides better performance, error handling, and more closely matches the production environment.

## 🏗️ Technology Stack

- **Static Site Generator**: Jekyll
- **Hosting**: GitHub Pages
- **CSS Framework**: Bootstrap 5.3.3
- **Styling**: Custom SASS with responsive design
- **Icons**: Font Awesome
- **Analytics**: Amplitude, Facebook Pixel, Google Ads
- **Forms**: Mailchimp integration

## 📁 Key Features

- **Music Platform Integration**: Deep linking to Spotify, YouTube, Apple Music
- **URL Shortening System**: Custom link management (`/l/` directory)
- **Component-Based Architecture**: Reusable Jekyll includes
- **Multi-Format Assets**: Responsive images with WebP/JPEG variants
- **SEO Optimization**: Music-specific metadata and social sharing
- **Analytics Integration**: Comprehensive tracking and attribution

## 🔧 Troubleshooting

### Common Issues

**Permission errors with gems:**
```bash
# Ensure gems path is correctly set
echo $GEM_HOME
# Should output: /home/yourusername/gems
```

**Jekyll build errors:**
```bash
# Clear Jekyll cache and rebuild
bundle exec jekyll clean
bundle exec jekyll build --verbose
```

**Missing dependencies:**
```bash
# Update all gems
bundle update
```

## 📖 Learn More

For detailed information about:
- **Architecture**: See [docs/project-structure.md](docs/project-structure.md)
- **Development Workflow**: See [docs/development-workflow.md](docs/development-workflow.md)
- **Component System**: See [docs/component-system.md](docs/component-system.md)
- **Content Management**: See [docs/content-management.md](docs/content-management.md)

## 🤝 Contributing

1. Read the [development workflow documentation](docs/development-workflow.md)
2. Follow the established [coding conventions](docs/development-workflow.md#code-organization)
3. Test changes locally before submitting
4. Use descriptive commit messages following the project format

## 📞 Support

For technical questions about the website architecture, refer to the [complete documentation](docs/README.md) or review the specific documentation sections for detailed guidance.

---

## References

- [Jekyll on Ubuntu](https://jekyllrb.com/docs/installation/ubuntu/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Jekyll Documentation](https://jekyllrb.com/docs/)
