/*
 * Engagement events for /booking/retiros/: element views, button clicks,
 * carousel gestures, song play time and email selection. Every event ends in
 * track() from site.js, and their catalog entries have no meta and no gads, so
 * they only reach Amplitude.
 *
 * Markup contract: data-engage-type, data-engage-name and the optional
 * data-engage-view-time (ms). The pure helpers are exported for node --test
 * (_tests/engagement.test.js).
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
  const VIEW_EVENTS = {
    button: 'ButtonView',
    carousel: 'ViewContent',
    song: 'ViewContent',
    testimony: 'ViewContent',
    pricing: 'ViewContent',
    calendar: 'ViewContent'
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

  return {
    VIEW_EVENTS: VIEW_EVENTS,
    isViewed: isViewed,
    viewEventName: viewEventName,
    viewKey: viewKey,
    viewTimeOf: viewTimeOf,
    engageProps: engageProps,
    swipeDirection: swipeDirection,
    ViewTracker: ViewTracker,
    PlayClock: PlayClock
  };
});
