// Run with javascript_tool on any https://www.instagram.com/p/<code>/ page of the account, after
// replacing the PARAMS placeholders below MAIN with the values in _data/cuaderno_instagram.yml.
// It hooks fetch and XHR, opens the profile through the in-page link (the timeline is not in the
// HTML, it arrives as a GraphQL response), scrolls until it has what the list needs, and returns
// the posts without any URL: the tool blocks results that contain signed CDN URLs.
// The work runs in the background (the tool aborts an evaluation after 45 s) and the snippet
// returns 'started' at once. Read the outcome by polling javascript_tool with
// JSON.stringify(window.__cuaderno || null) until state is 'done' (result holds the JSON string)
// or 'error' (error holds the message).
// Everything above the MAIN marker is pure and tested in _tests/cuaderno_browser.test.js.

const TYPES = { 1: 'image', 2: 'video', 8: 'carousel' };

function findKey(o, key) {
  if (!o || typeof o !== 'object') return null;
  if (key in o) return o[key];
  for (const k of Object.keys(o)) {
    const r = findKey(o[k], key);
    if (r) return r;
  }
  return null;
}

// One captured response -> { end, items }. Responses that are not the timeline give no items.
function timelinePage(text) {
  let conn = null;
  try { conn = findKey(JSON.parse(text), 'xdt_api__v1__feed__user_timeline_graphql_connection'); } catch (e) { conn = null; }
  if (!conn) return { end: false, items: [] };
  return {
    end: !conn.page_info.has_next_page,
    items: conn.edges.map(({ node }) => ({
      shortcode: node.code,
      date: new Date(node.taken_at * 1000).toISOString().replace('.000Z', 'Z'),
      type: TYPES[node.media_type] || `unknown-${node.media_type}`,
      pinned: (node.timeline_pinned_user_ids || []).length > 0,
      caption: ((node.caption && node.caption.text) || '').replace(/(https?:\/\/|www\.)\S+/g, '[enlace]').slice(0, 300)
    }))
  };
}

// True once the scan holds what buildList in _scripts/cuaderno.js needs: a non-pinned post at or
// before `newest` (so every newer post was seen) and, unless backfill is done, `batch` older ones.
function scanDone(items, end, { newest, oldest, backfillDone, batch }) {
  const regular = items.filter((i) => !i.pinned);
  const reachedNewest = regular.some((i) => i.date <= newest);
  const older = regular.filter((i) => i.date < oldest).length;
  return end || (reachedNewest && (backfillDone || older >= batch));
}

// MAIN
(async () => {
  window.__cuaderno = { snippet: 'scan', state: 'running' };
  try {
    const ACCOUNT = 'amanda_tuz';
    const PARAMS = { newest: '__NEWEST__', oldest: '__OLDEST__', backfillDone: __BACKFILL_DONE__, batch: 12 };
    if (PARAMS.newest.startsWith('__') || PARAMS.oldest.startsWith('__')) throw new Error('replace the PARAMS placeholders first');

    const captured = [];
    const grab = (t) => { if (typeof t === 'string' && t.includes('user_timeline_graphql_connection')) captured.push(t); };
    const origFetch = window.fetch;
    const origSend = XMLHttpRequest.prototype.send;
    window.fetch = async function (...args) {
      const r = await origFetch.apply(this, args);
      r.clone().text().then(grab, () => {});
      return r;
    };
    XMLHttpRequest.prototype.send = function (...args) {
      this.addEventListener('load', () => { try { grab(this.responseText); } catch (e) { /* binary response */ } });
      return origSend.apply(this, args);
    };
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const found = new Map();
    let end = false;
    const drain = () => {
      for (const t of captured.splice(0)) {
        const page = timelinePage(t);
        end = end || page.end;
        for (const i of page.items) if (!found.has(i.shortcode)) found.set(i.shortcode, i);
      }
    };
    try {
      const profile = document.querySelector(`a[href="/${ACCOUNT}/"]`);
      if (!profile) throw new Error(`no link to /${ACCOUNT}/ on this page: open one of the account's posts first`);
      profile.click();
      await sleep(5000);
      drain();
      for (let k = 0; k < 30 && !scanDone([...found.values()], end, PARAMS); k++) {
        window.scrollTo(0, document.body.scrollHeight);
        await sleep(3000);
        drain();
      }
    } finally {
      window.fetch = origFetch;
      XMLHttpRequest.prototype.send = origSend;
    }
    if (!found.size) throw new Error('no timeline data captured: login wall or rate limit, look at the tab');
    window.__cuaderno = { snippet: 'scan', state: 'done', result: JSON.stringify({ end, complete: scanDone([...found.values()], end, PARAMS), items: [...found.values()] }) };
  } catch (e) {
    window.__cuaderno = { snippet: 'scan', state: 'error', error: e.message };
  }
})();
'started';
