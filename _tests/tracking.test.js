const test = require('node:test');
const assert = require('node:assert/strict');
const tracking = require('../assets/js/tracking.js');

const catalog = {
  conversions: {
    checkout: 'AW-11456512712/80-wCM2Z1NwZEMiF8tYq',
    spotify: 'AW-11456512712/r0YzCOTRq5YZEMiF8tYq'
  },
  events: {
    PageView: { meta: { event: 'ViewContent' }, gads: 'pageview' },
    CTAClick: {
      meta: { event: 'InitiateCheckout', content_category: 'Button', content_name: 'Click' },
      gads: 'checkout',
      value: 1.0,
      currency: 'EUR'
    },
    Click: {
      meta: { event: 'ViewContent', content_category: 'streaming', content_name: '{button}' },
      gads: '{button}'
    },
    FormError: {},
    FbGrant: null
  }
};

const redirectHosts = {
  hosts: ['www.almadetuz.com', 'open.spotify.com'],
  schemes: ['spotify', 'intent']
};

test.describe('resolveEvent', () => {
  test.it('returns null for a name missing from the catalog', () => {
    assert.equal(tracking.resolveEvent(catalog, 'Unknown', {}), null);
  });

  test.it('does not resolve names inherited from Object.prototype', () => {
    assert.equal(tracking.resolveEvent(catalog, 'constructor', {}), null);
  });

  test.it('resolves an empty entry to no destinations', () => {
    const empty = { meta: null, gads: null, sendTo: null };
    assert.deepEqual(tracking.resolveEvent(catalog, 'FormError', {}), empty);
    assert.deepEqual(tracking.resolveEvent(catalog, 'FbGrant', {}), empty);
  });

  test.it('adds default value and currency to the Meta custom data', () => {
    assert.deepEqual(tracking.resolveEvent(catalog, 'CTAClick', { cta: 'checkout-cta-3' }), {
      meta: {
        event: 'InitiateCheckout',
        custom_data: { content_category: 'Button', content_name: 'Click', value: 1.0, currency: 'EUR' }
      },
      gads: 'checkout',
      sendTo: 'AW-11456512712/80-wCM2Z1NwZEMiF8tYq'
    });
  });

  test.it('lets props override value and currency', () => {
    const resolved = tracking.resolveEvent(catalog, 'CTAClick', { value: 20, currency: 'USD' });
    assert.equal(resolved.meta.custom_data.value, 20);
    assert.equal(resolved.meta.custom_data.currency, 'USD');
  });

  test.it('fills {prop} placeholders in Meta data and the conversion label', () => {
    const resolved = tracking.resolveEvent(catalog, 'Click', { button: 'spotify' });
    assert.equal(resolved.meta.custom_data.content_name, 'spotify');
    assert.equal(resolved.gads, 'spotify');
    assert.equal(resolved.sendTo, 'AW-11456512712/r0YzCOTRq5YZEMiF8tYq');
  });

  test.it('drops the conversion when the label has no entry in conversions', () => {
    const resolved = tracking.resolveEvent(catalog, 'Click', { button: 'apple' });
    assert.equal(resolved.meta.custom_data.content_name, 'apple');
    assert.equal(resolved.gads, null);
    assert.equal(resolved.sendTo, null);
  });

  test.it('fills a missing prop with an empty string', () => {
    const resolved = tracking.resolveEvent(catalog, 'Click', {});
    assert.equal(resolved.meta.custom_data.content_name, '');
    assert.equal(resolved.sendTo, null);
  });

  test.it('drops the conversion when the entry has a label that is not in conversions', () => {
    const resolved = tracking.resolveEvent(catalog, 'PageView', undefined);
    assert.deepEqual(resolved.meta, { event: 'ViewContent', custom_data: {} });
    assert.equal(resolved.gads, null);
  });
});

test.describe('buildFbc', () => {
  test.it('prefers the _fbc cookie', () => {
    assert.equal(tracking.buildFbc('fb.1.100.cookie', 'click', 200), 'fb.1.100.cookie');
  });

  test.it('builds from fbclid and its timestamp', () => {
    assert.equal(tracking.buildFbc(null, 'click', 1757765000000), 'fb.1.1757765000000.click');
  });

  test.it('never produces undefined', () => {
    const values = [undefined, null, ''];
    for (const cookie of values) {
      for (const fbclid of [...values, 'click']) {
        for (const ts of [...values, 1757765000000]) {
          const fbc = tracking.buildFbc(cookie, fbclid, ts);
          assert.ok(fbc === null || !fbc.includes('undefined'), `${cookie} ${fbclid} ${ts} -> ${fbc}`);
          if (!fbclid || !ts) assert.equal(fbc, null);
        }
      }
    }
  });
});

test.describe('isAllowedUrl', () => {
  test.it('allows listed hosts', () => {
    assert.equal(tracking.isAllowedUrl('https://open.spotify.com/track/1?si=x', redirectHosts), true);
    assert.equal(tracking.isAllowedUrl('https://www.almadetuz.com/taller/', redirectHosts), true);
  });

  test.it('rejects unlisted hosts, including lookalikes and subdomains', () => {
    assert.equal(tracking.isAllowedUrl('https://evil.test/', redirectHosts), false);
    assert.equal(tracking.isAllowedUrl('https://open.spotify.com.evil.test/', redirectHosts), false);
    assert.equal(tracking.isAllowedUrl('https://x.open.spotify.com/', redirectHosts), false);
  });

  test.it('allows listed app schemes', () => {
    assert.equal(tracking.isAllowedUrl('spotify://track/1', redirectHosts), true);
    assert.equal(tracking.isAllowedUrl('intent://track/1#Intent;scheme=spotify;package=com.spotify.music;end', redirectHosts), true);
  });

  test.it('rejects other schemes, relative and malformed URLs', () => {
    assert.equal(tracking.isAllowedUrl('javascript:alert(1)', redirectHosts), false);
    assert.equal(tracking.isAllowedUrl('data:text/html,hi', redirectHosts), false);
    assert.equal(tracking.isAllowedUrl('youtube://watch?v=1', redirectHosts), false);
    assert.equal(tracking.isAllowedUrl('/taller/', redirectHosts), false);
    assert.equal(tracking.isAllowedUrl('not a url', redirectHosts), false);
    assert.equal(tracking.isAllowedUrl(null, redirectHosts), false);
  });
});

test.describe('decideDestinations', () => {
  const withBoth = { meta: { event: 'Lead', custom_data: {} }, gads: 'lead', sendTo: 'AW-1/lead' };
  const withNone = { meta: null, gads: null, sendTo: null };

  test.it('keeps everything off without consent', () => {
    assert.deepEqual(tracking.decideDestinations({ analytics: false, advertisement: false }, withBoth, 'live'),
      { anonId: false, adIds: false, pixel: false, gtag: false });
  });

  test.it('analytics consent only enables the anonymous id', () => {
    assert.deepEqual(tracking.decideDestinations({ analytics: true, advertisement: false }, withBoth, 'live'),
      { anonId: true, adIds: false, pixel: false, gtag: false });
  });

  test.it('advertisement consent enables ad ids, Pixel and gtag in live mode', () => {
    assert.deepEqual(tracking.decideDestinations({ analytics: false, advertisement: true }, withBoth, 'live'),
      { anonId: false, adIds: true, pixel: true, gtag: true });
  });

  test.it('shadow mode never fires Pixel or gtag', () => {
    assert.deepEqual(tracking.decideDestinations({ analytics: true, advertisement: true }, withBoth, 'shadow'),
      { anonId: true, adIds: true, pixel: false, gtag: false });
  });

  test.it('an event without Meta or conversion data fires neither', () => {
    assert.deepEqual(tracking.decideDestinations({ analytics: true, advertisement: true }, withNone, 'live'),
      { anonId: true, adIds: true, pixel: false, gtag: false });
  });
});

test.describe('nextSession', () => {
  const now = 1757766000000;
  const minute = 60 * 1000;

  test.it('starts a session when there is none', () => {
    assert.deepEqual(tracking.nextSession(null, now), { id: now, last: now });
  });

  test.it('continues a session active less than 30 minutes ago', () => {
    const stored = { id: now - 45 * minute, last: now - 29 * minute };
    assert.deepEqual(tracking.nextSession(stored, now), { id: now - 45 * minute, last: now });
  });

  test.it('starts a new session after 30 minutes of inactivity', () => {
    assert.deepEqual(tracking.nextSession({ id: now - 60 * minute, last: now - 30 * minute }, now), { id: now, last: now });
  });

  test.it('starts a new session when the stored value is malformed', () => {
    assert.deepEqual(tracking.nextSession({ id: '1', last: now }, now), { id: now, last: now });
  });
});

test.describe('readCookie', () => {
  test.it('reads and decodes a cookie', () => {
    assert.equal(tracking.readCookie('a=1; _fbp=fb.1.2.3; b=%7Bx%7D', '_fbp'), 'fb.1.2.3');
    assert.equal(tracking.readCookie('a=1; b=%7Bx%7D', 'b'), '{x}');
  });

  test.it('does not match a cookie that only shares the prefix', () => {
    assert.equal(tracking.readCookie('_fbp_old=1; _fbp=2', '_fbp'), '2');
  });

  test.it('returns null when missing', () => {
    assert.equal(tracking.readCookie('a=1', '_fbc'), null);
    assert.equal(tracking.readCookie('', '_fbc'), null);
  });

  test.it('returns the raw value when it cannot be decoded', () => {
    assert.equal(tracking.readCookie('_fbc=fb.1.2.%E0%A4%A', '_fbc'), 'fb.1.2.%E0%A4%A');
  });
});

test.describe('props helpers', () => {
  test.it('withoutKeys drops the given keys', () => {
    assert.deepEqual(tracking.withoutKeys({ page_title: 'x', cta: 'c' }, ['page_title']), { cta: 'c' });
    assert.deepEqual(tracking.withoutKeys(undefined, ['x']), {});
  });

  test.it('flatProps keeps only scalar values', () => {
    assert.deepEqual(
      tracking.flatProps({ a: 'x', b: 1, c: false, d: null, e: undefined, f: { g: 1 }, h: [1] }),
      { a: 'x', b: 1, c: false, d: null }
    );
  });

  test.it('pickAttribution keeps known keys and fills the rest with null', () => {
    const attribution = tracking.pickAttribution({ utm_source: 'ig', fbclid: 'abc', transaction_id: 't', gclid: '' });
    assert.equal(attribution.utm_source, 'ig');
    assert.equal(attribution.fbclid, 'abc');
    assert.equal(attribution.gclid, null);
    assert.equal(attribution.wbraid, null);
    assert.equal('transaction_id' in attribution, false);
    assert.equal(Object.keys(attribution).length, 12);
  });
});

test.describe('buildPayload', () => {
  const resolved = tracking.resolveEvent(catalog, 'CTAClick', {});
  const base = {
    eventId: '0b7e7c52-3f1d-4c33-9a4e-6f1c2b3d4e5f',
    name: 'CTAClick',
    mode: 'shadow',
    now: 1757766000123,
    language: 'es-ES',
    resolved: resolved,
    anonId: '4a1b2c3d-1111-4222-8333-944455556666',
    sessionId: 1757765000000,
    page: { url: 'https://www.almadetuz.com/taller/', path: '/taller/', title: 'Taller', referrer: '' },
    attribution: tracking.pickAttribution({ utm_source: 'ig' }),
    fbp: 'fb.1.1.123',
    fbc: 'fb.1.1.abc',
    props: { cta: 'checkout-cta-3', nested: { a: 1 } }
  };

  test.it('sends identifiers allowed by full consent', () => {
    const payload = tracking.buildPayload({ ...base, consent: { analytics: true, advertisement: true } });
    assert.deepEqual(payload, {
      event_id: base.eventId,
      mode: 'shadow',
      name: 'CTAClick',
      client_time: 1757766000123,
      language: 'es-ES',
      consent: { analytics: true, advertisement: true },
      anon_id: base.anonId,
      session_id: 1757765000000,
      page: base.page,
      attribution: base.attribution,
      meta: {
        event: 'InitiateCheckout',
        custom_data: { content_category: 'Button', content_name: 'Click', value: 1.0, currency: 'EUR' },
        fbp: 'fb.1.1.123',
        fbc: 'fb.1.1.abc'
      },
      gads: 'checkout',
      props: { cta: 'checkout-cta-3' }
    });
  });

  test.it('without consent keeps Meta event data but no identifiers', () => {
    const payload = tracking.buildPayload({ ...base, consent: { analytics: false, advertisement: false } });
    assert.equal(payload.anon_id, null);
    assert.equal(payload.session_id, null);
    assert.deepEqual(payload.consent, { analytics: false, advertisement: false });
    assert.deepEqual(Object.keys(payload.meta), ['event', 'custom_data']);
  });

  test.it('does not add ids to the resolved catalog entry', () => {
    tracking.buildPayload({ ...base, consent: { analytics: true, advertisement: true } });
    assert.equal('fbp' in resolved.meta, false);
  });

  test.it('omits missing fbp and fbc and sends null meta for events without Meta data', () => {
    const noIds = tracking.buildPayload({ ...base, fbp: null, fbc: null, consent: { analytics: false, advertisement: true } });
    assert.deepEqual(Object.keys(noIds.meta), ['event', 'custom_data']);
    const empty = tracking.resolveEvent(catalog, 'FormError', {});
    const noMeta = tracking.buildPayload({ ...base, resolved: empty, consent: { analytics: true, advertisement: true } });
    assert.equal(noMeta.meta, null);
    assert.equal(noMeta.gads, null);
  });

  test.it('matches the API name and props rules', () => {
    const payload = tracking.buildPayload({ ...base, consent: { analytics: true, advertisement: true } });
    assert.match(payload.name, /^[A-Za-z]{1,64}$/);
    assert.ok(Object.values(payload.props).every((value) => value === null || typeof value !== 'object'));
    assert.ok(JSON.stringify(payload).length < 16 * 1024);
  });
});
