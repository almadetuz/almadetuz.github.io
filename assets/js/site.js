/*
 * Tracking broker client. Each event is sent once to api.almadetuz.com, which
 * stores it and forwards it to Amplitude and Meta. The pure helpers are
 * exported for node --test (_tests/site.test.js).
 */
(function (root, factory) {
  const tracking = factory(root);
  if (typeof module === 'object' && module.exports) {
    module.exports = tracking;
  } else {
    root.AdtTracking = tracking;
    root.track = tracking.track;
  }
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const API_TIMEOUT_MS = 1500;
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
  const ANON_ID_KEY = 'adt_anon_id';
  const SESSION_KEY = 'adt_session';
  const UTMS_KEY = 'adt_last_utms';
  const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const ATTRIBUTION_KEYS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
    'fbclid', 'gclid', 'gbraid', 'wbraid', 'campaign_id', 'ad_id'
  ];

  let config = {
    catalog: { conversions: {}, events: {} },
    redirectHosts: { hosts: [], schemes: [] },
    mode: 'shadow'
  };

  // Pure helpers

  function own(object, key) {
    return object !== null && typeof object === 'object' && Object.prototype.hasOwnProperty.call(object, key);
  }

  function fillTemplate(value, props) {
    if (typeof value !== 'string') return value;
    return value.replace(/\{(\w+)\}/g, (match, key) => {
      const prop = own(props, key) ? props[key] : null;
      return prop === null || prop === undefined ? '' : String(prop);
    });
  }

  // Catalog entry for an event name, with "{prop}" placeholders filled in.
  // Returns null when the name is not in the catalog.
  function resolveEvent(catalog, name, props) {
    if (!own(catalog.events, name)) return null;
    const entry = catalog.events[name] || {};
    props = props || {};

    let meta = null;
    if (entry.meta && entry.meta.event) {
      const customData = {};
      Object.keys(entry.meta).forEach((key) => {
        if (key !== 'event') customData[key] = fillTemplate(entry.meta[key], props);
      });
      const value = own(props, 'value') ? props.value : entry.value;
      const currency = own(props, 'currency') ? props.currency : entry.currency;
      if (value !== undefined) customData.value = value;
      if (currency !== undefined) customData.currency = currency;
      meta = { event: entry.meta.event, custom_data: customData };
    }

    const label = entry.gads ? fillTemplate(entry.gads, props) : '';
    const sendTo = label && own(catalog.conversions, label) ? catalog.conversions[label] : null;
    return { meta: meta, gads: sendTo ? label : null, sendTo: sendTo };
  }

  // Meta click id: the _fbc cookie, else built from the stored fbclid.
  // Never returns a string with "undefined" in it.
  function buildFbc(fbcCookie, fbclid, fbclidTs) {
    if (fbcCookie) return fbcCookie;
    if (fbclid && fbclidTs) return 'fb.1.' + fbclidTs + '.' + fbclid;
    return null;
  }

  function isAllowedUrl(url, redirectHosts) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch (error) {
      return false;
    }
    const scheme = parsed.protocol.slice(0, -1);
    if (scheme === 'https' || scheme === 'http') {
      return (redirectHosts.hosts || []).includes(parsed.hostname);
    }
    return (redirectHosts.schemes || []).includes(scheme);
  }

  function decideDestinations(consent, resolved, mode) {
    const advertisement = consent.advertisement === true;
    const live = mode === 'live';
    return {
      anonId: consent.analytics === true,
      adIds: advertisement,
      pixel: live && advertisement && resolved.meta !== null,
      gtag: live && advertisement && resolved.sendTo !== null
    };
  }

  function nextSession(stored, now) {
    const valid = stored && typeof stored.id === 'number' && typeof stored.last === 'number';
    if (valid && now - stored.last < SESSION_TIMEOUT_MS) return { id: stored.id, last: now };
    return { id: now, last: now };
  }

  function readCookie(cookieString, name) {
    const row = (cookieString || '').split(/;\s*/).find((part) => part.startsWith(name + '='));
    if (!row) return null;
    const value = row.slice(name.length + 1);
    try {
      return decodeURIComponent(value);
    } catch (error) {
      return value;
    }
  }

  function withoutKeys(props, keys) {
    const result = {};
    Object.keys(props || {}).forEach((key) => {
      if (!keys.includes(key)) result[key] = props[key];
    });
    return result;
  }

  // The API only accepts flat props with scalar values.
  function flatProps(props) {
    const result = {};
    Object.keys(props || {}).forEach((key) => {
      const value = props[key];
      if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) result[key] = value;
    });
    return result;
  }

  function pickAttribution(stored) {
    const result = {};
    ATTRIBUTION_KEYS.forEach((key) => {
      result[key] = own(stored, key) && stored[key] ? stored[key] : null;
    });
    return result;
  }

  function buildPayload(input) {
    const decision = decideDestinations(input.consent, input.resolved, input.mode);
    let meta = null;
    if (input.resolved.meta) {
      meta = { event: input.resolved.meta.event, custom_data: input.resolved.meta.custom_data };
      if (decision.adIds && input.fbp) meta.fbp = input.fbp;
      if (decision.adIds && input.fbc) meta.fbc = input.fbc;
    }
    return {
      event_id: input.eventId,
      mode: input.mode,
      name: input.name,
      client_time: input.now,
      language: input.language || null,
      consent: { analytics: decision.anonId, advertisement: decision.adIds },
      anon_id: decision.anonId ? input.anonId : null,
      session_id: decision.anonId ? input.sessionId : null,
      page: input.page,
      attribution: input.attribution,
      meta: meta,
      gads: input.resolved.gads,
      props: flatProps(input.props)
    };
  }

  // Browser side

  function log() {
    if (root.environment === 'devel') console.log('[tracking]', ...arguments);
  }

  function storageGet(key) {
    try {
      return root.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      root.localStorage.setItem(key, value);
    } catch (error) {
      // Private mode or blocked storage: the event is still sent
    }
  }

  function storageRemove(key) {
    try {
      root.localStorage.removeItem(key);
    } catch (error) {
      // Nothing to clear
    }
  }

  function storageGetJson(key) {
    try {
      return JSON.parse(storageGet(key));
    } catch (error) {
      return null;
    }
  }

  // cookie_js.html runs before page content, so consent is readable when track() is called
  function readConsent() {
    const cookieConsent = root.CookieConsent;
    if (!cookieConsent || typeof cookieConsent.acceptedCategory !== 'function') {
      return { analytics: false, advertisement: false };
    }
    return {
      analytics: cookieConsent.acceptedCategory('analytics'),
      advertisement: cookieConsent.acceptedCategory('advertisement')
    };
  }

  function clearIdentity() {
    storageRemove(ANON_ID_KEY);
    storageRemove(SESSION_KEY);
  }

  function readIdentity(consent, now) {
    if (!consent.analytics) {
      clearIdentity();
      return { anonId: null, sessionId: null };
    }
    let anonId = storageGet(ANON_ID_KEY);
    if (!UUID_PATTERN.test(anonId || '')) {
      anonId = root.crypto.randomUUID();
      storageSet(ANON_ID_KEY, anonId);
    }
    const session = nextSession(storageGetJson(SESSION_KEY), now);
    storageSet(SESSION_KEY, JSON.stringify(session));
    return { anonId: anonId, sessionId: session.id };
  }

  function currentPage() {
    return {
      url: root.location.href,
      path: root.location.pathname,
      title: root.document.title,
      referrer: root.document.referrer
    };
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function configure(options) {
    config = Object.assign({}, config, options);
  }

  // Resolves when the API answers or after 1.5 s. Never throws.
  async function track(name, props) {
    try {
      const resolved = resolveEvent(config.catalog, name, props);
      if (!resolved) {
        log('catalog miss: ' + name);
        return;
      }
      const now = Date.now();
      const consent = readConsent();
      const identity = readIdentity(consent, now);
      const stored = storageGetJson(UTMS_KEY) || {};
      const payload = buildPayload({
        eventId: root.crypto.randomUUID(),
        name: name,
        mode: config.mode,
        now: now,
        language: root.navigator.language,
        consent: consent,
        resolved: resolved,
        anonId: identity.anonId,
        sessionId: identity.sessionId,
        page: currentPage(),
        attribution: pickAttribution(stored),
        fbp: readCookie(root.document.cookie, '_fbp'),
        fbc: buildFbc(readCookie(root.document.cookie, '_fbc'), stored.fbclid, stored.fbclid_ts),
        props: props
      });
      log(name, payload);
      if (typeof API_URL === 'undefined') return;

      const request = fetch(API_URL + '/events', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch((error) => log('api error', error));
      await Promise.race([request, wait(API_TIMEOUT_MS)]);
    } catch (error) {
      log('track error', error);
    }
  }

  if (typeof root.addEventListener === 'function') {
    root.addEventListener('cc:onChange', () => {
      if (!readConsent().analytics) clearIdentity();
    });
  }

  return {
    configure: configure,
    track: track,
    resolveEvent: resolveEvent,
    buildFbc: buildFbc,
    isAllowedUrl: isAllowedUrl,
    decideDestinations: decideDestinations,
    nextSession: nextSession,
    readCookie: readCookie,
    withoutKeys: withoutKeys,
    flatProps: flatProps,
    pickAttribution: pickAttribution,
    buildPayload: buildPayload
  };
});
