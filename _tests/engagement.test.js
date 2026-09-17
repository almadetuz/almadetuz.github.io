const test = require('node:test');
const assert = require('node:assert/strict');
const engagement = require('../assets/js/engagement.js');

function entry(overrides) {
  return Object.assign({
    isIntersecting: true,
    intersectionRatio: 1,
    boundingClientRect: { width: 300, height: 400 },
    intersectionRect: { width: 300, height: 400 },
    rootBounds: { width: 1000, height: 800 }
  }, overrides);
}

const viewport = { width: 1000, height: 800 };

test.describe('isViewed', () => {
  test.it('counts an element half on screen', () => {
    const half = entry({ intersectionRatio: 0.5, intersectionRect: { width: 300, height: 200 } });
    assert.equal(engagement.isViewed(half, viewport), true);
  });

  test.it('does not count an element 49% on screen', () => {
    const almost = entry({ intersectionRatio: 0.49, intersectionRect: { width: 300, height: 196 } });
    assert.equal(engagement.isViewed(almost, viewport), false);
  });

  test.it('counts an element three viewports tall that covers the viewport', () => {
    const tall = entry({
      intersectionRatio: 800 / 2400,
      boundingClientRect: { width: 1000, height: 2400 },
      intersectionRect: { width: 1000, height: 800 }
    });
    assert.equal(engagement.isViewed(tall, viewport), true);
  });

  test.it('does not count a tall element covering less than half the viewport', () => {
    const tall = entry({
      intersectionRatio: 300 / 2400,
      boundingClientRect: { width: 1000, height: 2400 },
      intersectionRect: { width: 1000, height: 300 }
    });
    assert.equal(engagement.isViewed(tall, viewport), false);
  });

  test.it('counts a narrow card fully on screen', () => {
    const card = entry({
      boundingClientRect: { width: 200, height: 300 },
      intersectionRect: { width: 200, height: 300 }
    });
    assert.equal(engagement.isViewed(card, viewport), true);
  });

  test.it('falls back to the viewport size when rootBounds is null', () => {
    const tall = entry({
      rootBounds: null,
      intersectionRatio: 800 / 2400,
      boundingClientRect: { width: 1000, height: 2400 },
      intersectionRect: { width: 1000, height: 800 }
    });
    assert.equal(engagement.isViewed(tall, { width: 1000, height: 800 }), true);
    assert.equal(engagement.isViewed(tall, { width: 1000, height: 2000 }), false);
  });

  test.it('does not count an element that is not intersecting', () => {
    const away = entry({ isIntersecting: false, intersectionRatio: 0, intersectionRect: { width: 0, height: 0 } });
    assert.equal(engagement.isViewed(away, viewport), false);
  });

  test.it('does not count an element with no size', () => {
    const empty = entry({ boundingClientRect: { width: 0, height: 0 }, intersectionRect: { width: 0, height: 0 } });
    assert.equal(engagement.isViewed(empty, viewport), false);
  });
});

function makeTracker(sent) {
  return new engagement.ViewTracker({
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    clearTimeout: (id) => clearTimeout(id),
    send: (key, el) => sent.push([key, el])
  });
}

test.describe('ViewTracker', () => {
  test.it('sends after the view time', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const sent = [];
    const tracker = makeTracker(sent);
    tracker.visible('song:la-magara', 'card', 1000);
    t.mock.timers.tick(999);
    assert.deepEqual(sent, []);
    t.mock.timers.tick(1);
    assert.deepEqual(sent, [['song:la-magara', 'card']]);
  });

  test.it('does not send when hidden before the view time', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const sent = [];
    const tracker = makeTracker(sent);
    tracker.visible('pricing:oferta', 'block', 1000);
    t.mock.timers.tick(900);
    tracker.hidden('pricing:oferta', 'block');
    t.mock.timers.tick(5000);
    assert.deepEqual(sent, []);
  });

  test.it('restarts from zero when viewed again', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const sent = [];
    const tracker = makeTracker(sent);
    tracker.visible('pricing:oferta', 'block', 1000);
    t.mock.timers.tick(900);
    tracker.hidden('pricing:oferta', 'block');
    tracker.visible('pricing:oferta', 'block', 1000);
    t.mock.timers.tick(900);
    assert.deepEqual(sent, []);
    t.mock.timers.tick(100);
    assert.equal(sent.length, 1);
  });

  test.it('sends once per key', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const sent = [];
    const tracker = makeTracker(sent);
    tracker.visible('button:ver-fechas-precio', 'a', 1000);
    t.mock.timers.tick(1000);
    tracker.hidden('button:ver-fechas-precio', 'a');
    tracker.visible('button:ver-fechas-precio', 'a', 1000);
    t.mock.timers.tick(5000);
    assert.equal(sent.length, 1);
  });

  test.it('uses a custom view time', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const sent = [];
    const tracker = makeTracker(sent);
    tracker.visible('carousel:canciones', 'carousel', 3000);
    t.mock.timers.tick(2999);
    assert.deepEqual(sent, []);
    t.mock.timers.tick(1);
    assert.equal(sent.length, 1);
  });

  test.it('times each key on its own', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const sent = [];
    const tracker = makeTracker(sent);
    tracker.visible('song:a', 'a', 1000);
    t.mock.timers.tick(500);
    tracker.visible('song:b', 'b', 1000);
    t.mock.timers.tick(500);
    assert.deepEqual(sent, [['song:a', 'a']]);
    t.mock.timers.tick(500);
    assert.deepEqual(sent, [['song:a', 'a'], ['song:b', 'b']]);
  });

  test.it('keeps the timer while another element of the key is viewed', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const sent = [];
    const tracker = makeTracker(sent);
    tracker.visible('song:la-magara', 'clone', 1000);
    t.mock.timers.tick(600);
    tracker.visible('song:la-magara', 'card', 1000);
    tracker.hidden('song:la-magara', 'clone');
    t.mock.timers.tick(399);
    assert.deepEqual(sent, []);
    t.mock.timers.tick(1);
    assert.deepEqual(sent, [['song:la-magara', 'card']]);
  });

  test.it('pauseAll cancels the timers and resumeAll restarts them from zero', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const sent = [];
    const tracker = makeTracker(sent);
    tracker.visible('pricing:desglose', 'table', 1000);
    t.mock.timers.tick(900);
    tracker.pauseAll();
    t.mock.timers.tick(5000);
    assert.deepEqual(sent, []);
    tracker.resumeAll();
    t.mock.timers.tick(999);
    assert.deepEqual(sent, []);
    t.mock.timers.tick(1);
    assert.equal(sent.length, 1);
  });

  test.it('resumeAll does not restart keys hidden while paused', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const sent = [];
    const tracker = makeTracker(sent);
    tracker.visible('pricing:desglose', 'table', 1000);
    tracker.pauseAll();
    tracker.hidden('pricing:desglose', 'table');
    tracker.resumeAll();
    t.mock.timers.tick(5000);
    assert.deepEqual(sent, []);
  });

  test.it('does not start timers while paused', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const sent = [];
    const tracker = makeTracker(sent);
    tracker.pauseAll();
    tracker.visible('pricing:desglose', 'table', 1000);
    t.mock.timers.tick(5000);
    assert.deepEqual(sent, []);
    tracker.resumeAll();
    t.mock.timers.tick(1000);
    assert.equal(sent.length, 1);
  });
});

test.describe('swipeDirection', () => {
  test.it('sends right when the finger moves left', () => {
    assert.equal(engagement.swipeDirection(-60), 'right');
  });

  test.it('sends left when the finger moves right', () => {
    assert.equal(engagement.swipeDirection(60), 'left');
  });
});

test.describe('arrowDirection', () => {
  test.it('sends left for prev', () => {
    assert.equal(engagement.arrowDirection('prev'), 'left');
  });

  test.it('sends right for next', () => {
    assert.equal(engagement.arrowDirection('next'), 'right');
  });
});

test.describe('pointPosition', () => {
  test.it('turns the 0-based data-bs-slide-to into a 1-based position', () => {
    assert.equal(engagement.pointPosition('0'), 1);
    assert.equal(engagement.pointPosition('5'), 6);
  });

  test.it('returns null for a value that is not a number', () => {
    assert.equal(engagement.pointPosition('x'), null);
    assert.equal(engagement.pointPosition(undefined), null);
  });
});

test.describe('PlayClock', () => {
  test.it('stop returns the stretch in seconds', () => {
    const clock = new engagement.PlayClock();
    clock.start(1000);
    assert.equal(clock.stop(6000), 5);
  });

  test.it('stop without start returns 0', () => {
    const clock = new engagement.PlayClock();
    assert.equal(clock.stop(5000), 0);
  });

  test.it('stop twice returns 0 the second time', () => {
    const clock = new engagement.PlayClock();
    clock.start(0);
    clock.stop(2000);
    assert.equal(clock.stop(4000), 0);
  });

  test.it('ignores start while already running', () => {
    const clock = new engagement.PlayClock();
    clock.start(0);
    clock.start(2000);
    assert.equal(clock.stop(4000), 4);
  });

  test.it('total adds the stretches and the running one', () => {
    const clock = new engagement.PlayClock();
    clock.start(0);
    clock.stop(3000);
    clock.start(10000);
    assert.equal(clock.total(12000), 5);
  });

  test.it('total without a running stretch is the sum of stretches', () => {
    const clock = new engagement.PlayClock();
    clock.start(0);
    clock.stop(3000);
    assert.equal(clock.total(99000), 3);
  });

  test.it('rounds to the nearest second', () => {
    const clock = new engagement.PlayClock();
    clock.start(0);
    assert.equal(clock.stop(1499), 1);
    clock.start(2000);
    assert.equal(clock.stop(3500), 2);
    assert.equal(clock.total(3500), 3);
  });
});

test.describe('viewEventName', () => {
  test.it('maps buttons to ButtonView', () => {
    assert.equal(engagement.viewEventName('button'), 'ButtonView');
  });

  test.it('maps content types to ViewContent', () => {
    ['carousel', 'song', 'testimony', 'pricing', 'calendar', 'links', 'video'].forEach((type) => {
      assert.equal(engagement.viewEventName(type), 'ViewContent', type);
    });
  });

  test.it('has no view event for email, form, player or unknown types', () => {
    assert.equal(engagement.viewEventName('email'), null);
    assert.equal(engagement.viewEventName('form'), null);
    assert.equal(engagement.viewEventName('player'), null);
    assert.equal(engagement.viewEventName('constructor'), null);
    assert.equal(engagement.viewEventName(undefined), null);
  });
});

test.describe('viewKey', () => {
  test.it('joins type and name', () => {
    assert.equal(engagement.viewKey({ engageType: 'song', engageName: 'la-magara' }), 'song:la-magara');
  });
});

test.describe('viewTimeOf', () => {
  test.it('defaults to 1000 ms', () => {
    assert.equal(engagement.viewTimeOf({}), 1000);
    assert.equal(engagement.viewTimeOf({ engageViewTime: 'abc' }), 1000);
  });

  test.it('reads data-engage-view-time', () => {
    assert.equal(engagement.viewTimeOf({ engageViewTime: '2500' }), 2500);
    assert.equal(engagement.viewTimeOf({ engageViewTime: '0' }), 0);
  });
});

test.describe('engageProps', () => {
  test.it('builds element props with the extra props', () => {
    const dataset = { engageType: 'carousel', engageName: 'canciones' };
    assert.deepEqual(engagement.engageProps(dataset, { direction: 'right' }), {
      element_type: 'carousel',
      element_name: 'canciones',
      direction: 'right'
    });
  });

  test.it('works without extra props', () => {
    assert.deepEqual(engagement.engageProps({ engageType: 'button', engageName: 'x' }), {
      element_type: 'button',
      element_name: 'x'
    });
  });

  test.it('returns null without a name', () => {
    assert.equal(engagement.engageProps({ engageType: 'carousel' }, {}), null);
    assert.equal(engagement.engageProps(undefined, {}), null);
  });
});

const fs = require('node:fs');
const path = require('node:path');

const ENGAGEMENT_EVENTS = [
  'ButtonView', 'ButtonClick', 'ViewContent', 'SongOpen', 'SongStart', 'SongStop', 'SongClose',
  'CarouselArrow', 'CarouselSwipe', 'CarouselPoint', 'EmailSelect', 'EmailCopy',
  'FormStart', 'FormConsent', 'PlayerClick'
];

// Sorted, unique event names each file passes as a literal to send(...) or
// AdtEngagement.send(...). Tasks 3 and 4 add cards.js and songs.js.
const SENDERS = {
  'assets/js/engagement.js': ['ButtonClick', 'EmailCopy', 'EmailSelect'],
  'assets/js/cards.js': ['CarouselArrow', 'CarouselPoint', 'CarouselSwipe'],
  'assets/js/songs.js': ['SongClose', 'SongOpen', 'SongStart', 'SongStop']
};

// Minimal reader for the events section of _data/tracking_events.yml:
// entry name -> inline value and nested keys
function readCatalogEvents() {
  const lines = fs.readFileSync(path.join(__dirname, '../_data/tracking_events.yml'), 'utf8').split('\n');
  const events = {};
  let inEvents = false;
  let current = null;
  for (const line of lines) {
    if (/^\S/.test(line)) {
      inEvents = /^events:\s*$/.test(line);
      current = null;
      continue;
    }
    if (!inEvents) continue;
    const name = line.match(/^  ([A-Za-z]+):\s*(.*)$/);
    if (name) {
      current = { inline: name[2].trim(), keys: [] };
      events[name[1]] = current;
      continue;
    }
    const key = line.match(/^    (\w+):/);
    if (key && current) current.keys.push(key[1]);
  }
  return events;
}

function sentNames(file) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const names = Array.from(source.matchAll(/send\('([A-Za-z]+)'/g), (match) => match[1]);
  return Array.from(new Set(names)).sort();
}

test.describe('engagement catalog', () => {
  const events = readCatalogEvents();

  test.it('has every engagement event as an empty entry (Amplitude only)', () => {
    ENGAGEMENT_EVENTS.forEach((name) => {
      assert.ok(events[name], 'missing from catalog: ' + name);
      assert.equal(events[name].inline, '{}', name + ' must be {}');
      assert.deepEqual(events[name].keys, [], name + ' must have no meta or gads');
    });
  });

  test.it('covers every view event', () => {
    Object.values(engagement.VIEW_EVENTS).forEach((name) => {
      assert.ok(ENGAGEMENT_EVENTS.includes(name), name);
    });
  });

  Object.keys(SENDERS).forEach((file) => {
    test.it(file + ' sends only its engagement events', () => {
      const names = sentNames(file);
      assert.deepEqual(names, SENDERS[file]);
      names.forEach((name) => assert.ok(ENGAGEMENT_EVENTS.includes(name), name));
    });
  });
});

// Entries start with "- " at column 0; slug is a two-space nested key
function readSlugs(file) {
  const lines = fs.readFileSync(path.join(__dirname, '../_data', file), 'utf8').split('\n');
  return {
    entries: lines.filter((line) => /^- /.test(line)).length,
    slugs: lines.map((line) => line.match(/^  slug: (\S+)\s*$/)).filter(Boolean).map((match) => match[1])
  };
}

test.describe('carousel slugs', () => {
  ['canciones_retiros.yml', 'testimonios_retiros.yml'].forEach((file) => {
    test.it(file + ' has a unique kebab-case slug per entry', () => {
      const data = readSlugs(file);
      assert.ok(data.entries > 0, 'no entries in ' + file);
      assert.equal(data.slugs.length, data.entries);
      assert.equal(new Set(data.slugs).size, data.slugs.length);
      data.slugs.forEach((slug) => assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/));
    });
  });
});
