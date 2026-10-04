// Run with javascript_tool on https://www.instagram.com/p/<code>/ after a direct navigation
// (the post data is embedded only on a full page load). It fetches every media file in the page,
// packs them with meta.json and caption.txt into cuaderno-<code>.tar and downloads it.
// It returns only counts and sizes: the tool blocks results that contain signed CDN URLs.
// The work runs in the background (the tool aborts an evaluation after 45 s) and the snippet
// returns 'started' at once. Read the outcome by polling javascript_tool with
// JSON.stringify(window.__cuaderno || null) until state is 'done' (result holds the JSON string)
// or 'error' (error holds the message).
// Everything above the MAIN marker is pure and tested in _tests/cuaderno_browser.test.js.

const TYPES = { 1: 'image', 2: 'video', 8: 'carousel' };
const EXT = { 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/png': 'png', 'image/heic': 'heic' };

function findKey(o, key) {
  if (!o || typeof o !== 'object') return null;
  if (key in o) return o[key];
  for (const k of Object.keys(o)) {
    const r = findKey(o[k], key);
    if (r) return r;
  }
  return null;
}

function largest(list) {
  return list.reduce((a, b) => (b.width * b.height > a.width * a.height ? b : a));
}

// Media in Instagram order, 1-based. Images: largest candidate. Videos: largest video_versions
// entry (a progressive mp4; the page's own <video> is a blob) and the cover as poster.
function planMedia(item) {
  const nodes = item.media_type === 8 ? item.carousel_media : [item];
  return nodes.map((m, k) => {
    const image = largest(m.image_versions2.candidates);
    if (m.media_type === 2) {
      const video = largest(m.video_versions);
      return { n: k + 1, kind: 'video', width: video.width, height: video.height, videoUrl: video.url, posterUrl: image.url };
    }
    return { n: k + 1, kind: 'image', width: image.width, height: image.height, imageUrl: image.url };
  });
}

// ustar header for a regular file. Names are short ASCII (meta.json, 1.webp, 2_poster.jpg).
function tarHeader(name, size) {
  const h = new Uint8Array(512);
  const put = (s, off) => { for (let i = 0; i < s.length; i++) h[off + i] = s.charCodeAt(i); };
  put(name, 0);
  put('0000644\0', 100);
  put('0000000\0', 108);
  put('0000000\0', 116);
  put(`${size.toString(8).padStart(11, '0')}\0`, 124);
  put(`${Math.floor(Date.now() / 1000).toString(8).padStart(11, '0')}\0`, 136);
  put('        ', 148);
  put('0', 156);
  put('ustar\0', 257);
  put('00', 263);
  let sum = 0;
  for (const b of h) sum += b;
  put(`${sum.toString(8).padStart(6, '0')}\0 `, 148);
  return h;
}

// files: [{ name, data: Uint8Array }] -> tar Blob
function buildTar(files) {
  const parts = [];
  for (const f of files) {
    parts.push(tarHeader(f.name, f.data.length), f.data);
    const pad = (512 - (f.data.length % 512)) % 512;
    if (pad) parts.push(new Uint8Array(pad));
  }
  parts.push(new Uint8Array(1024));
  return new Blob(parts, { type: 'application/x-tar' });
}

// MAIN
(async () => {
  window.__cuaderno = { snippet: 'bundle', state: 'running' };
  try {
    const ACCOUNT = 'amanda_tuz';
    const code = (location.pathname.match(/\/(?:p|reel)\/([^/]+)/) || [])[1];
    if (!code) throw new Error('not a post page: ' + location.pathname);
    let post = null;
    for (const s of document.querySelectorAll('script[type="application/json"]')) {
      if (!s.textContent.includes('xdt_api__v1__media__shortcode__web_info')) continue;
      const info = findKey(JSON.parse(s.textContent), 'xdt_api__v1__media__shortcode__web_info');
      if (info) { post = info.items[0]; break; }
    }
    if (!post) throw new Error('post data not found: navigate to the post URL directly and run again');
    if (post.code !== code) throw new Error(`page holds ${post.code}, expected ${code}`);
    if (post.user.username !== ACCOUNT) throw new Error(`post belongs to @${post.user.username}`);

    async function get(url) {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`media download failed: HTTP ${r.status}`);
      const b = await r.blob();
      return { type: b.type, data: new Uint8Array(await b.arrayBuffer()) };
    }

    const files = [];
    const items = [];
    for (const m of planMedia(post)) {
      if (m.kind === 'image') {
        const img = await get(m.imageUrl);
        const file = `${m.n}.${EXT[img.type] || 'bin'}`;
        files.push({ name: file, data: img.data });
        items.push({ n: m.n, kind: 'image', file, width: m.width, height: m.height });
      } else {
        const video = await get(m.videoUrl);
        const cover = await get(m.posterUrl);
        const poster = `${m.n}_poster.${EXT[cover.type] || 'bin'}`;
        files.push({ name: `${m.n}.mp4`, data: video.data }, { name: poster, data: cover.data });
        items.push({ n: m.n, kind: 'video', file: `${m.n}.mp4`, poster, width: m.width, height: m.height });
      }
    }
    const meta = {
      shortcode: post.code,
      user: post.user.username,
      taken_at: new Date(post.taken_at * 1000).toISOString().replace('.000Z', 'Z'),
      type: TYPES[post.media_type],
      items
    };
    const enc = new TextEncoder();
    files.unshift(
      { name: 'meta.json', data: enc.encode(JSON.stringify(meta, null, 2)) },
      { name: 'caption.txt', data: enc.encode((post.caption && post.caption.text) || '') }
    );
    const tar = buildTar(files);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(tar);
    link.download = `cuaderno-${post.code}.tar`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.__cuaderno = { snippet: 'bundle', state: 'done', result: JSON.stringify({ shortcode: post.code, type: meta.type, media: items.map((i) => `${i.n}:${i.kind}`).join(' '), bytes: tar.size }) };
  } catch (e) {
    window.__cuaderno = { snippet: 'bundle', state: 'error', error: e.message };
  }
})();
'started';
