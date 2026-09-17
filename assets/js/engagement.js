/*
 * Engagement events: element views, button and link clicks, carousel
 * gestures, song play time, email selection, subscription form progress and
 * Bandcamp player clicks. Every event ends in track() from site.js, and their
 * catalog entries have no meta and no gads, so they only reach Amplitude.
 *
 * Markup contract: data-engage-type, data-engage-name and the optional
 * data-engage-view-time (ms), plus data-engage-platform on each link of a
 * links row and data-engage-carousel="bootstrap" on Bootstrap carousels. The
 * pure helpers are exported for node --test (_tests/engagement.test.js).
 */
(function (root, factory) {
  const engagement = factory(root);
  if (typeof module === 'object' && module.exports) {
    module.exports = engagement;
  } else {
    root.AdtEngagement = engagement;
  }
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const DEFAULT_VIEW_TIME = 1000;
  const VIEWED_RATIO = 0.5;
  const EMAIL_SELECT_DEBOUNCE_MS = 500;
  // Every 5%, so elements taller than the screen still get updates
  const THRESHOLDS = Array.from({ length: 21 }, (value, index) => index / 20);
  const ENGAGE_SELECTOR = '[data-engage-type][data-engage-name]';
  const BUTTON_SELECTOR = '[data-engage-type="button"][data-engage-name]';
  const EMAIL_SELECTOR = '[data-engage-type="email"][data-engage-name]';
  const LINKS_SELECTOR = '[data-engage-type="links"][data-engage-name]';
  const LINK_SELECTOR = LINKS_SELECTOR + ' a[data-engage-platform]';
  const BOOTSTRAP_CAROUSEL_SELECTOR = '[data-engage-type="carousel"][data-engage-name][data-engage-carousel="bootstrap"]';
  const FORM_SELECTOR = 'form[data-engage-type="form"][data-engage-name]';
  const PLAYER_SELECTOR = 'iframe[data-engage-type="player"][data-engage-name]';
  // Bootstrap's own SWIPE_THRESHOLD
  const SWIPE_THRESHOLD = 40;
  const VIEW_EVENTS = {
    button: 'ButtonView',
    carousel: 'ViewContent',
    song: 'ViewContent',
    testimony: 'ViewContent',
    pricing: 'ViewContent',
    calendar: 'ViewContent',
    links: 'ViewContent',
    video: 'ViewContent'
  };

  // Pure helpers

  function area(rect) {
    return rect ? rect.width * rect.height : 0;
  }

  // Viewed: half of the element on screen, or its visible part covers half of
  // the viewport (elements taller than the screen never reach 50% of themselves)
  function isViewed(entry, viewport) {
    if (!entry.isIntersecting || area(entry.boundingClientRect) === 0) return false;
    if (entry.intersectionRatio >= VIEWED_RATIO) return true;
    const rootArea = entry.rootBounds ? area(entry.rootBounds) : viewport.width * viewport.height;
    return rootArea > 0 && area(entry.intersectionRect) / rootArea >= VIEWED_RATIO;
  }

  function viewEventName(type) {
    return Object.prototype.hasOwnProperty.call(VIEW_EVENTS, type) ? VIEW_EVENTS[type] : null;
  }

  function viewKey(dataset) {
    return dataset.engageType + ':' + dataset.engageName;
  }

  function viewTimeOf(dataset) {
    const ms = parseInt(dataset.engageViewTime, 10);
    return ms >= 0 ? ms : DEFAULT_VIEW_TIME;
  }

  function engageProps(dataset, extra) {
    if (!dataset || !dataset.engageName) return null;
    return Object.assign({ element_type: dataset.engageType, element_name: dataset.engageName }, extra);
  }

  // The direction the carousel moves, not the finger: a swipe to the left
  // brings the next card, which is "right"
  function swipeDirection(dx) {
    return dx < 0 ? 'right' : 'left';
  }

  // Bootstrap arrows: data-bs-slide="prev" moves left, anything else right
  function arrowDirection(value) {
    return value === 'prev' ? 'left' : 'right';
  }

  // Bootstrap dots: data-bs-slide-to is 0-based, position is 1-based
  function pointPosition(value) {
    const index = parseInt(value, 10);
    return Number.isNaN(index) ? null : index + 1;
  }

  // Dwell timers for view events, one per key (type:name). A key can be on
  // screen through more than one element (a card and its loop clone), so its
  // timer only stops when none of them is viewed.
  class ViewTracker {
    constructor(deps) {
      this.deps = deps;
      this.sent = new Set();
      this.viewed = new Map();
      this.timers = new Map();
      this.paused = false;
    }

    visible(key, el, viewTime) {
      if (this.sent.has(key)) return;
      if (!this.viewed.has(key)) this.viewed.set(key, { els: new Set(), viewTime: viewTime });
      this.viewed.get(key).els.add(el);
      if (!this.paused) this.startTimer(key);
    }

    hidden(key, el) {
      const view = this.viewed.get(key);
      if (!view) return;
      view.els.delete(el);
      if (view.els.size) return;
      this.viewed.delete(key);
      this.cancelTimer(key);
    }

    pauseAll() {
      this.paused = true;
      this.timers.forEach((id) => this.deps.clearTimeout(id));
      this.timers.clear();
    }

    resumeAll() {
      this.paused = false;
      this.viewed.forEach((view, key) => this.startTimer(key));
    }

    startTimer(key) {
      if (this.timers.has(key)) return;
      const view = this.viewed.get(key);
      this.timers.set(key, this.deps.setTimeout(() => {
        this.timers.delete(key);
        this.viewed.delete(key);
        this.sent.add(key);
        this.deps.send(key, view.els.values().next().value);
      }, view.viewTime));
    }

    cancelTimer(key) {
      if (!this.timers.has(key)) return;
      this.deps.clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  // Wall-clock playing time. The video loops and can be seeked, so its
  // position says nothing about how long it played.
  class PlayClock {
    constructor() {
      this.startedAt = null;
      this.playedMs = 0;
    }

    start(now) {
      if (this.startedAt === null) this.startedAt = now;
    }

    // Seconds of the stretch that ends now, 0 when not running
    stop(now) {
      if (this.startedAt === null) return 0;
      const stretch = now - this.startedAt;
      this.playedMs += stretch;
      this.startedAt = null;
      return Math.round(stretch / 1000);
    }

    // Seconds of every stretch, the running one included
    total(now) {
      const running = this.startedAt === null ? 0 : now - this.startedAt;
      return Math.round((this.playedMs + running) / 1000);
    }
  }

  // Browser side

  const observed = new WeakSet();
  const emailsSelected = new Set();
  const sentOnce = new Set();
  let tracker = null;
  let observer = null;

  function send(name, el, extra) {
    const props = engageProps(el && el.dataset, extra);
    if (!props) return;
    root.track(name, props);
  }

  function onIntersect(entries) {
    const viewport = { width: root.innerWidth, height: root.innerHeight };
    entries.forEach((entry) => {
      const dataset = entry.target.dataset;
      if (isViewed(entry, viewport)) {
        tracker.visible(viewKey(dataset), entry.target, viewTimeOf(dataset));
      } else {
        tracker.hidden(viewKey(dataset), entry.target);
      }
    });
  }

  // Safe to call again on the same scope: elements already observed are skipped
  function observe(scope) {
    if (!observer) return;
    const elements = Array.from(scope.querySelectorAll(ENGAGE_SELECTOR));
    if (typeof scope.matches === 'function' && scope.matches(ENGAGE_SELECTOR)) elements.unshift(scope);
    elements.forEach((el) => {
      if (observed.has(el) || !viewEventName(el.dataset.engageType)) return;
      observed.add(el);
      observer.observe(el);
    });
  }

  // True only the first time for this event and element name in the page load
  function firstTime(name, el) {
    const key = name + ':' + el.dataset.engageName;
    if (sentOnce.has(key)) return false;
    sentOnce.add(key);
    return true;
  }

  function selectedEmails(selection) {
    if (!selection || selection.isCollapsed || !selection.rangeCount) return [];
    const range = selection.getRangeAt(0);
    return Array.from(root.document.querySelectorAll(EMAIL_SELECTOR)).filter((el) => range.intersectsNode(el));
  }

  function init() {
    const document = root.document;
    tracker = new ViewTracker({
      setTimeout: (fn, ms) => root.setTimeout(fn, ms),
      clearTimeout: (id) => root.clearTimeout(id),
      send: (key, el) => send(viewEventName(el.dataset.engageType), el)
    });
    // Created now, not on DOMContentLoaded: calendar.js and the carousels
    // call observe() from their own listeners
    if ('IntersectionObserver' in root) {
      observer = new root.IntersectionObserver(onIntersect, { threshold: THRESHOLDS });
    }
    document.addEventListener('DOMContentLoaded', () => observe(document));

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        tracker.pauseAll();
      } else {
        tracker.resumeAll();
      }
    });

    // Not trackAndGo: #fechas stays on the page and mailto: does not unload it
    document.addEventListener('click', (event) => {
      const button = event.target.closest(BUTTON_SELECTOR);
      if (button) send('ButtonClick', button);
    });

    // Not trackAndGo either: the icons open in a new tab
    document.addEventListener('click', (event) => {
      const link = event.target.closest(LINK_SELECTOR);
      if (link) send('ButtonClick', link.closest(LINKS_SELECTOR), { platform: link.dataset.engagePlatform });
    });

    // Bootstrap carousels only: CardCarousel sends its own gestures from cards.js
    document.addEventListener('click', (event) => {
      const carousel = event.target.closest(BOOTSTRAP_CAROUSEL_SELECTOR);
      if (!carousel) return;
      const arrow = event.target.closest('[data-bs-slide]');
      if (arrow) send('CarouselArrow', carousel, { direction: arrowDirection(arrow.dataset.bsSlide) });
      const dot = event.target.closest('[data-bs-slide-to]');
      const position = dot ? pointPosition(dot.dataset.bsSlideTo) : null;
      if (position) send('CarouselPoint', carousel, { position: position });
    });

    let swipe = null;
    document.addEventListener('touchstart', (event) => {
      const carousel = event.target.closest(BOOTSTRAP_CAROUSEL_SELECTOR);
      swipe = carousel ? { carousel: carousel, x: event.touches[0].clientX } : null;
    }, { passive: true });
    document.addEventListener('touchend', (event) => {
      if (!swipe) return;
      const dx = event.changedTouches[0].clientX - swipe.x;
      if (Math.abs(dx) > SWIPE_THRESHOLD) send('CarouselSwipe', swipe.carousel, { direction: swipeDirection(dx) });
      swipe = null;
    }, { passive: true });

    const onEmailField = (event) => {
      if (!event.target.matches('input[type="email"]')) return;
      const form = event.target.closest(FORM_SELECTOR);
      if (form && firstTime('FormStart', form)) send('FormStart', form);
    };
    document.addEventListener('focusin', onEmailField);
    document.addEventListener('input', onEmailField);

    document.addEventListener('change', (event) => {
      if (!event.target.matches('input[name="gdpr"]') || !event.target.checked) return;
      const form = event.target.closest(FORM_SELECTOR);
      if (form && firstTime('FormConsent', form)) send('FormConsent', form);
    });

    // A click inside a cross-origin iframe moves the focus into it: the page
    // only sees its window blur, and activeElement is the iframe right after
    root.addEventListener('blur', () => {
      root.setTimeout(() => {
        const player = document.activeElement;
        if (player && player.matches(PLAYER_SELECTOR) && firstTime('PlayerClick', player)) send('PlayerClick', player);
      }, 0);
    });

    // After a click in player A the focus stays in A, so a click in player B
    // would not blur the window again. Hand the focus back to the page when
    // the pointer enters another player (A loses keyboard control).
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll(PLAYER_SELECTOR).forEach((player) => {
        player.addEventListener('pointerenter', () => {
          const focused = document.activeElement;
          if (focused && focused !== player && focused.matches(PLAYER_SELECTOR)) focused.blur();
        });
      });
    });

    let selectTimer = null;
    document.addEventListener('selectionchange', () => {
      root.clearTimeout(selectTimer);
      selectTimer = root.setTimeout(() => {
        selectedEmails(document.getSelection()).forEach((el) => {
          if (emailsSelected.has(el.dataset.engageName)) return;
          emailsSelected.add(el.dataset.engageName);
          send('EmailSelect', el);
        });
      }, EMAIL_SELECT_DEBOUNCE_MS);
    });

    document.addEventListener('copy', () => {
      selectedEmails(document.getSelection()).forEach((el) => send('EmailCopy', el));
    });
  }

  if (root.document && typeof root.document.addEventListener === 'function') init();

  return {
    observe: observe,
    send: send,
    VIEW_EVENTS: VIEW_EVENTS,
    isViewed: isViewed,
    viewEventName: viewEventName,
    viewKey: viewKey,
    viewTimeOf: viewTimeOf,
    engageProps: engageProps,
    swipeDirection: swipeDirection,
    arrowDirection: arrowDirection,
    pointPosition: pointPosition,
    ViewTracker: ViewTracker,
    PlayClock: PlayClock
  };
});
