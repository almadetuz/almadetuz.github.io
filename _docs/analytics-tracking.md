# Analytics & Tracking

This document describes the comprehensive analytics and tracking implementation in the Alma de Tüz website.

## Analytics Architecture

### Multi-Platform Tracking Strategy

The site implements a comprehensive tracking system using multiple analytics platforms:

1. **Amplitude**: Detailed user behavior analytics
2. **Facebook Pixel**: Social media attribution
3. **Google Ads**: Conversion tracking
4. **Matomo**: Privacy-focused analytics (optional)

### Environment Detection

The tracking system includes environment detection to separate development from production data:

```javascript
var environment = document.location.host.includes("{{ site.host }}") ? "production" : "devel";
```

This ensures analytics only fire in production environments.

## Core Analytics Implementation

### Global Analytics Setup

Located in `default.html` layout:

```javascript
var base = '{{ page.url | absolute_url }}';
var title = '{{ page.title }}';
const query_params = new URLSearchParams(window.location.search);

// UTM Parameter Persistence
var last_utm = {};
try {
  last_utm = JSON.parse(localStorage.getItem('adt_last_utms')) || {};
} catch (error) {
  last_utm = {};
}

last_utm = {
  utm_source: query_params.get('utm_source') || last_utm['utm_source'],
  utm_medium: query_params.get('utm_medium') || last_utm['utm_medium'],
  utm_campaign: query_params.get('utm_campaign') || last_utm['utm_campaign'],
  utm_term: query_params.get('utm_term') || last_utm['utm_term'],
  utm_content: query_params.get('utm_content') || last_utm['utm_content']
};

const web_event_prop = {
  page_title: title,
  page_domain: document.location.hostname,
  page_location: document.location.href,
  page_path: document.location.pathname,
  page_url: base,
  utm_source: last_utm['utm_source'],
  utm_medium: last_utm['utm_medium'],
  utm_campaign: last_utm['utm_campaign'],
  utm_term: last_utm['utm_term'],
  utm_content: last_utm['utm_content'],
  referrer: document.referrer,
  referring_domain: URL.parse(document.referrer)?.hostname || null,
};

localStorage.setItem('adt_last_utms', JSON.stringify(last_utm));
```

### Event Properties Structure

All analytics events include standard properties:
- **Page Information**: URL, title, domain
- **UTM Parameters**: Campaign attribution data
- **Referrer Data**: Traffic source information
- **Session Data**: User session context

## Platform-Specific Implementation

### Amplitude Analytics (`amplitude_js.html`)

**Purpose**: Detailed user behavior and engagement tracking

**Implementation**:
```javascript
// Amplitude initialization and event tracking
// Custom event properties and user identification
```

**Event Types**:
- Page views
- Form interactions
- Link clicks
- Scroll events
- Media engagement

### Facebook Pixel (`fb_js.html`)

**Purpose**: Social media conversion tracking and remarketing

**Implementation**:
```javascript
// Facebook Pixel initialization
// Custom conversion events
// Audience building for advertising
```

**Event Types**:
- ViewContent: Page views
- SubmitApplication: Form submissions
- Custom conversions: Specific actions

### Google Tag Manager (`google_tag.html`)

**Purpose**: Google Ads conversion tracking

**Implementation**:
```javascript
// Google Tag Manager setup
// Conversion event tracking
// Enhanced e-commerce tracking
```

**Event Types**:
- Pageview: Standard page tracking
- Conversion: Form submissions and actions
- Custom events: Business-specific metrics

### Matomo Analytics (`matomo_js.html`)

**Purpose**: Privacy-focused analytics alternative

**Features**:
- GDPR compliant tracking
- Self-hosted option
- Detailed user journey analysis

## Event Tracking System

### Page View Tracking

Implemented in page layouts:

```javascript
document.addEventListener("DOMContentLoaded", (event) => {
  amp_event('PageView', web_event_prop);
  fb_event('ViewContent');
  gads_event('conversion', 'pageview');
});
```

### Form Tracking

Comprehensive form analytics in `mail_form.html`:

```javascript
function FormSubmit(e) {
  amp_event('FormSubmit', {...web_event_prop, ...form_prop});
  fb_event('SubmitApplication');
  gads_event('conversion', 'form_submit');
}

function FormView(e) {
  var scroll_prop = {view_time: Math.trunc(e.time / 1000)};
  amp_event('FormView', {...web_event_prop, ...form_prop, ...scroll_prop});
  fb_event('ViewContent', 'Form', 'View');
  gads_event('conversion', 'form_view');
}

function FormError(e) {
  amp_event('FormError', {...web_event_prop, ...form_prop});
}
```

### Scroll Tracking (`scroll_js.html`)

**Purpose**: Engagement measurement through scroll behavior

**Implementation**:
- Intersection Observer API for performance
- Time-based engagement metrics
- Scroll depth tracking
- Content engagement scoring

### Link Tracking

Music platform link tracking in `link_js.html`:

```javascript
// Platform-specific deep linking
// Attribution tracking for music platforms
// Mobile app detection and routing
```

## Custom Tracking Components

### Form Analytics System

**Components**:
- `forms.js`: Core form handling
- Form event bindings in components
- Validation state tracking
- Submission success/error tracking

**Event Properties**:
```javascript
var form_prop = {form: "subscribe-{{ include.form_id }}"};
```

### Scroll Event System

**Implementation**:
```javascript
ScrollEvent.add("element-id", (e) => {
  // Scroll event handler with timing data
});
```

**Metrics Tracked**:
- Time to scroll
- Scroll depth percentage
- Element visibility duration
- Engagement patterns

## Privacy and Compliance

### Cookie Consent Integration

**Component**: `cookie_js.html`

**Features**:
- GDPR compliance
- User consent management
- Granular tracking preferences
- Legal requirement fulfillment

**Integration**:
```liquid
{% if layout.preference_modal %}
  <a href="" data-cc="show-preferencesModal">Preferencias sobre cookies</a>
{% endif %}
```

### Data Handling Practices

1. **User Consent**: Explicit consent for tracking
2. **Data Minimization**: Only necessary data collection
3. **Retention Policies**: Appropriate data retention
4. **User Rights**: Access and deletion capabilities

## Campaign Attribution

### UTM Parameter Handling

**Persistence Strategy**:
```javascript
localStorage.setItem('adt_last_utms', JSON.stringify(last_utm));
```

**Attribution Chain**:
1. URL parameters captured
2. Stored in localStorage
3. Attached to all events
4. Cross-session attribution

### Campaign Tracking

**Music Platform Campaigns**:
```liquid
{% include link_js.html
  campaign="song_name"
  medium="spotify"
  utm_source="specific_source"
%}
```

**Email Campaigns**:
```liquid
{% include mail_form.html
  context_group_id=2225
  context_id=64
%}
```

## Performance Monitoring

### Analytics Performance

**Optimization Strategies**:
1. **Deferred Loading**: Non-blocking analytics
2. **Error Handling**: Graceful degradation
3. **Batch Events**: Efficient API usage
4. **Local Storage**: Offline capability

### Tracking Quality Assurance

**Validation Methods**:
1. **Environment Separation**: Development vs production
2. **Event Verification**: Manual testing protocols
3. **Data Validation**: Analytics dashboard review
4. **Performance Impact**: Loading time monitoring

## Music Industry Analytics

### Platform-Specific Tracking

**Spotify Integration**:
- Deep link tracking
- Mobile app routing
- Play button analytics
- Playlist engagement

**YouTube Integration**:
- Video view tracking
- Engagement metrics
- Subscription attribution
- Content performance

**Social Media Tracking**:
- Platform-specific engagement
- Share button analytics
- Social media attribution
- Audience growth tracking

### Content Performance Metrics

**Music Content Analytics**:
1. **Track Popularity**: Play button clicks
2. **Platform Preferences**: User platform choices
3. **Geographic Data**: Regional preferences
4. **Device Analytics**: Mobile vs desktop usage

## Analytics Dashboard Strategy

### Key Performance Indicators (KPIs)

**Website Performance**:
- Page views and unique visitors
- Session duration and bounce rate
- Conversion rates (email signups)
- Geographic and demographic data

**Music Engagement**:
- Music platform click-through rates
- Video engagement metrics
- Social media interaction rates
- Email campaign performance

**Business Metrics**:
- Workshop registration rates
- Newsletter subscription growth
- Social media follower growth
- Event attendance tracking

## Implementation Guidelines

### Adding New Tracking

**Process**:
1. **Define Event**: Specify event name and properties
2. **Implement Tracking**: Add to appropriate components
3. **Test Functionality**: Verify in development
4. **Validate Data**: Check analytics dashboards
5. **Document Changes**: Update tracking documentation

### Best Practices

1. **Event Naming**: Consistent, descriptive event names
2. **Property Standards**: Standardized property naming
3. **Performance Impact**: Monitor loading effects
4. **Privacy Compliance**: Ensure legal compliance
5. **Data Quality**: Regular data validation

### Maintenance Tasks

1. **Regular Audits**: Review tracking implementation
2. **Performance Monitoring**: Track analytics impact
3. **Legal Compliance**: Update privacy policies
4. **Platform Updates**: Maintain SDK versions
5. **Data Analysis**: Regular performance reviews
