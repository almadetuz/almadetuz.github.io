#!/usr/bin/env node
// Deterministic steps of the cuaderno-instagram skill: caption to post, registry, media import.
// Pure functions are exported for _tests/cuaderno_import.test.js; the CLI is at the bottom.
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');

// ---- Caption and post ----

// Lines that only space a caption out: whitespace, braille blank, zero width space, hangul filler.
const BLANK = /^[\s⠀​ㅤ]*$/;
// Spacer lines people put before a hashtag block: ".", middle dot, bullet, "-", "_".
const SPACER = /^[.·•\-_\s⠀]*$/;
const TRAILING_TAGS = /(?:\s*#[\p{L}\p{N}_]*)+\s*$/u;
const MENTION = /(?<![\w@.])@([A-Za-z0-9_](?:[A-Za-z0-9._]*[A-Za-z0-9_])?)/g;
const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}‍️⃣]/gu;
const RATIOS = { '9x16': 9 / 16, '4x5': 4 / 5, '1x1': 1, '16x9': 16 / 9 };

// Caption lines without the trailing hashtag block and its spacer lines, blank-looking lines emptied.
function captionLines(text) {
  let t = text.replace(/\r\n?/g, '\n');
  let prev;
  do {
    prev = t;
    const stripped = t.replace(TRAILING_TAGS, '');
    if (stripped !== t) {
      // Spacer lines only go when they sat before a removed hashtag block.
      const lines = stripped.split('\n');
      while (lines.length && SPACER.test(lines[lines.length - 1])) lines.pop();
      t = lines.join('\n');
    }
  } while (t !== prev);
  return t.split('\n').map((l) => (BLANK.test(l) ? '' : l.trim()));
}

// Escape plain text segments (outside mentions): backslash-escape special characters,
// replace braces with entities so Liquid never sees them.
function escapePlainText(text) {
  // Replace & first so we don't re-escape the & in &#123; we generate later
  text = text.replace(/&/g, '&amp;');
  // Escape backslash first so we don't double-escape
  text = text.replace(/\\/g, '\\\\');
  // Escape these characters anywhere: * _ ` [ ] < > | $ - ~
  text = text.replace(/([*_`\[\]<>|$\-~])/g, '\\$1');
  // Replace braces with entities so Liquid never sees them
  text = text.replace(/\{/g, '&#123;');
  text = text.replace(/\}/g, '&#125;');
  return text;
}

// Escape line-leading characters that kramdown would read as markup.
function escapeLineStart(line) {
  // Line-leading # -> \#
  if (line.startsWith('#')) return '\\' + line;
  // Line-leading + = : -> \+, \=, \:
  if (/^[+=:]/.test(line)) return '\\' + line;
  // Digits followed by . and space: N. -> N\.
  if (/^(\d+)\.\s/.test(line)) {
    const match = line.match(/^(\d+)(\.\s)/);
    return match[1] + '\\' + match[2] + line.slice(match[0].length);
  }
  return line;
}

// Link mentions and escape text segments outside them.
function linkMentionsWithEscape(line) {
  let result = '';
  let lastIndex = 0;

  for (const match of line.matchAll(MENTION)) {
    // Escape text before this mention
    result += escapePlainText(line.slice(lastIndex, match.index));
    // Add the mention as a link (handle is not escaped, URL is correct)
    result += `[@${match[1].replace(/_/g, '\\_')}](https://www.instagram.com/${match[1]}/)`;
    lastIndex = match.index + match[0].length;
  }

  // Escape remaining text after last mention
  result += escapePlainText(line.slice(lastIndex));

  return result;
}

// Caption as kramdown: paragraphs kept, a single line break becomes a "\" hard break.
function cleanCaption(text) {
  const paragraphs = captionLines(text).join('\n').trim().split(/\n{2,}/).filter(Boolean);
  const body = paragraphs
    .map((p) => p.split('\n').map((l) => escapeLineStart(linkMentionsWithEscape(l))).join('\\\n'))
    .join('\n\n');
  return body;
}

// One line, no emojis, at most 150 characters cut at a word. Falls back to the title.
function seoDescription(text, fallback) {
  const plain = captionLines(text).join(' ').replace(EMOJI, '').replace(/\s+/g, ' ').trim();
  const s = plain || fallback;
  const chars = Array.from(s);
  if (chars.length <= 150) return s;
  const cut = chars.slice(0, 150);
  const space = cut.lastIndexOf(' ');
  return (space > 100 ? cut.slice(0, space) : cut).join('').replace(/[\s,;:]+$/, '');
}

function slugify(title) {
  const slug = title.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim().split(' ').slice(0, 6).join('-');
  if (!slug) throw new Error(`cannot make a slug from "${title}"`);
  return slug;
}

// Plain YAML scalar when Psych cannot misread it (number, boolean, leading dash), quoted otherwise.
function scalar(s) {
  return /^[A-Za-z][\w-]*$/.test(s) && !/^(y|n|yes|no|true|false|on|off|null)$/i.test(s) ? s : JSON.stringify(s);
}

function ratioFor(width, height) {
  const r = width / height;
  return Object.keys(RATIOS).reduce((a, b) => (Math.abs(RATIOS[b] - r) < Math.abs(RATIOS[a] - r) ? b : a));
}

// File base (no size, no extension) of the index thumbnail and SEO source: first image, else first poster.
function thumbBase(meta, slug) {
  const image = meta.items.find((i) => i.kind === 'image');
  return image ? `${slug}_${image.n}` : `${slug}_${meta.items[0].n}_poster`;
}

// Include tags in Instagram order: all images in one carousel (or one image) where the first image
// was, each video where it was.
function mediaBlocks(meta, slug, alt) {
  const dir = `/assets/images/cuaderno/${slug}`;
  const safeAlt = alt.replace(/"/g, "'");
  const images = meta.items.filter((i) => i.kind === 'image').map((i) => `${dir}/${slug}_${i.n}`);
  const blocks = [];
  let placed = false;
  for (const item of meta.items) {
    if (item.kind === 'video') {
      blocks.push(`{% include cuaderno_video.html src="/assets/videos/cuaderno/${slug}_${item.n}.mp4" poster="${dir}/${slug}_${item.n}_poster" ratio="${ratioFor(item.width, item.height)}" %}`);
    } else if (!placed) {
      placed = true;
      blocks.push(images.length === 1
        ? `{% include cuaderno_image.html src="${images[0]}" alt="${safeAlt}" %}`
        : `{% include cuaderno_carousel.html id="${slug}-carrusel" images="${images.join(', ')}" alt="${safeAlt}" %}`);
    }
  }
  return blocks;
}

function buildPost({ meta, caption, title, slug, alt }) {
  const dir = `/assets/images/cuaderno/${slug}`;
  const body = cleanCaption(caption);
  return [
    '---',
    `title: ${JSON.stringify(title)}`,
    `instagram: ${scalar(meta.shortcode)}`,
    `seo_description: ${JSON.stringify(seoDescription(caption, title))}`,
    `seo_image: ${dir}/${slug}_seo.jpg`,
    'seo_image_width: 1280',
    'seo_image_height: 720',
    `thumb: ${dir}/${thumbBase(meta, slug)}`,
    `date: ${meta.taken_at.replace('T', ' ').replace(/Z$/, ' +0000')}`,
    '---',
    '',
    ...mediaBlocks(meta, slug, alt).flatMap((b) => [b, '']),
    body ? `${body}\n` : ''
  ].join('\n');
}

// ---- Registry ----

const REGISTRY = '_data/cuaderno_instagram.yml';
const BATCH = 12;
const TYPES = ['image', 'carousel', 'video'];
const REGISTRY_HEADER = [
  '# Instagram posts already listed by the cuaderno-instagram skill.',
  '# Decisions are words (accepted | rejected | pending): Psych reads yes/no as booleans.',
  '# Cursors are dates, not grid positions, because pinned posts sit on top.'
];

// Psych (Ruby), the parser Jekyll uses. Times come back as "2026-09-12T18:24:26Z".
function loadYaml(file) {
  const json = execFileSync('ruby', ['-rdate', '-ryaml', '-rjson', '-e',
    'conv = ->(o) { case o when Hash then o.transform_values(&conv) when Array then o.map(&conv) ' +
    'when Time then o.utc.strftime("%Y-%m-%dT%H:%M:%SZ") else o end }; ' +
    'puts JSON.generate(conv.(YAML.safe_load(File.read(ARGV[0]), permitted_classes: [Time, Date])))', file],
  { encoding: 'utf8' });
  return JSON.parse(json);
}

function loadRegistry(root) {
  return loadYaml(path.join(root, REGISTRY));
}

// Posts newest first; cursors are always the newest and oldest listed dates.
function withCursors(reg) {
  const posts = [...reg.posts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return { ...reg, posts, newest: posts[0].date, oldest: posts[posts.length - 1].date };
}

function dumpRegistry(reg) {
  const lines = [...REGISTRY_HEADER,
    `account: ${reg.account}`, `newest: ${reg.newest}`, `oldest: ${reg.oldest}`,
    `backfill_done: ${reg.backfill_done}`, 'posts:'];
  for (const p of reg.posts) {
    lines.push(`  - shortcode: ${scalar(p.shortcode)}`, `    date: ${p.date}`, `    type: ${p.type}`, `    decision: ${p.decision}`);
    if (p.slug) lines.push(`    slug: ${scalar(p.slug)}`);
  }
  return `${lines.join('\n')}\n`;
}

function saveRegistry(root, reg) {
  fs.writeFileSync(path.join(root, REGISTRY), dumpRegistry(withCursors(reg)));
}

// Numbered list to show the user: new posts, then a backfill batch, then posts still pending.
function buildList(reg, scan) {
  const byDate = (a, b) => (a.date < b.date ? 1 : -1);
  for (const i of scan.items) {
    if (!TYPES.includes(i.type)) throw new Error(`${i.shortcode}: unknown type "${i.type}"`);
  }
  if (!scan.end && !scan.items.some((i) => !i.pinned && i.date <= reg.newest)) {
    throw new Error('scan stopped before reaching the newest listed post');
  }
  const known = new Set(reg.posts.map((p) => p.shortcode));
  const unknown = scan.items.filter((i) => !known.has(i.shortcode));
  const fresh = unknown.filter((i) => i.date > reg.newest).sort(byDate);
  // A pinned old post seen in a partial scan would move oldest past posts not seen yet.
  const older = reg.backfill_done ? [] : unknown.filter((i) => i.date < reg.oldest && (!i.pinned || scan.end)).sort(byDate);
  const pending = reg.posts.filter((p) => p.decision === 'pending').map((p) => ({
    shortcode: p.shortcode, date: p.date, type: p.type,
    caption: (scan.items.find((i) => i.shortcode === p.shortcode) || {}).caption || ''
  }));
  const items = [
    ...fresh.map((i) => ({ ...i, source: 'new' })),
    ...older.slice(0, BATCH).map((i) => ({ ...i, source: 'backfill' })),
    ...pending.map((i) => ({ ...i, source: 'pending' }))
  ].map(({ pinned, ...i }, k) => ({ n: k + 1, ...i }));
  return { items, backfill_done: Boolean(reg.backfill_done || (scan.end && older.length <= BATCH)) };
}

function formatList(list) {
  const SOURCE = { new: 'nuevo', backfill: 'anterior', pending: 'pendiente' };
  const TYPE = { image: 'imagen', carousel: 'carrusel', video: 'vídeo' };
  return list.items.map((i) => {
    const first = (i.caption.split('\n').find((l) => l.trim()) || '').trim().slice(0, 90);
    return `${i.n}. ${i.date.slice(0, 10)}  ${TYPE[i.type]}  [${SOURCE[i.source]}]  ${first}\n` +
      `    https://www.instagram.com/p/${i.shortcode}/`;
  }).join('\n');
}

// "sí 1,3; no 2" (also "si", "SÍ", ranges "4-6", spaces). Throws on anything else.
function parseAnswer(text, max) {
  const out = { yes: [], no: [] };
  for (const part of text.split(/[;\n]/).map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(s[ií]|no)(?!\p{L})\s*(.*)$/iu);
    if (!m) throw new Error(`cannot read "${part}": answer like "sí 1,3; no 2"`);
    if (!m[2].trim()) throw new Error(`"${part}" has no numbers: answer like "sí 1,3; no 2"`);
    const key = /^s/i.test(m[1]) ? 'yes' : 'no';
    for (const tok of m[2].split(/[\s,]+/).filter(Boolean)) {
      const r = tok.match(/^(\d+)(?:-(\d+))?$/);
      if (!r) throw new Error(`"${tok}" is not a number or a range`);
      const a = Number(r[1]);
      const b = Number(r[2] || r[1]);
      if (a < 1 || b > max || a > b) throw new Error(`"${tok}" is out of range 1-${max}`);
      for (let n = a; n <= b; n++) out[key].push(n);
    }
  }
  const both = out.yes.filter((n) => out.no.includes(n));
  if (both.length) throw new Error(`both yes and no: ${both.join(', ')}`);
  return out;
}

// "no" -> rejected. "sí" and unanswered -> pending; the "sí" ones are returned to import now.
// A post becomes accepted only when its import succeeds (see accept).
function applyDecisions(reg, list, answer) {
  const posts = reg.posts.map((p) => ({ ...p }));
  const toImport = [];
  for (const item of list.items) {
    const decision = answer.no.includes(item.n) ? 'rejected' : 'pending';
    if (answer.yes.includes(item.n)) toImport.push(item.shortcode);
    const existing = posts.find((p) => p.shortcode === item.shortcode);
    if (existing) existing.decision = decision;
    else posts.push({ shortcode: item.shortcode, date: item.date, type: item.type, decision });
  }
  return { registry: withCursors({ ...reg, posts, backfill_done: list.backfill_done }), toImport };
}

function accept(reg, shortcode, slug) {
  return { ...reg, posts: reg.posts.map((p) => (p.shortcode === shortcode ? { ...p, decision: 'accepted', slug } : p)) };
}

// ---- Import ----

const ACCOUNT = 'amanda_tuz';
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SIZES = ['', '_320', '_480', '_640'];
const MAX_VIDEO_BYTES = 8 * 1024 * 1024;

function runScript(root, script, args) {
  execFileSync(path.join(root, '_scripts', script), args, { cwd: root, stdio: ['ignore', 'ignore', 'pipe'] });
}

// Bundle dir (meta.json, caption.txt, media from bundle.js) -> media files, post and accepted entry.
// On any failure it removes what it created, so the post stays pending and the slug stays free.
function importPost({ root = ROOT, dir, slug, title, alt }) {
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
  const caption = fs.readFileSync(path.join(dir, 'caption.txt'), 'utf8');
  if (meta.user !== ACCOUNT) throw new Error(`${meta.shortcode} belongs to @${meta.user}, not @${ACCOUNT}`);
  if (!SLUG.test(slug)) throw new Error(`invalid slug "${slug}"`);
  const reg = loadRegistry(root);
  const entry = reg.posts.find((p) => p.shortcode === meta.shortcode);
  if (!entry || entry.decision !== 'pending') throw new Error(`${meta.shortcode} is not pending in the registry`);
  const imgRel = `assets/images/cuaderno/${slug}`;
  const imgDir = path.join(root, imgRel);
  const postsDir = path.join(root, '_posts');
  if (fs.existsSync(imgDir) || (fs.existsSync(postsDir) && fs.readdirSync(postsDir).some((f) => f.endsWith(`-${slug}.md`)))) {
    throw new Error(`slug "${slug}" is already used`);
  }

  const videos = [];
  let postFile = null;
  try {
    fs.mkdirSync(imgDir, { recursive: true });
    fs.mkdirSync(path.join(root, 'assets/videos/cuaderno'), { recursive: true });
    const jpgs = [];
    for (const item of meta.items) {
      const base = `${slug}_${item.n}`;
      if (item.kind === 'image') {
        execFileSync('convert', [path.join(dir, item.file), '-quality', '92', path.join(imgDir, `${base}.jpg`)], { stdio: 'pipe' });
        jpgs.push(base);
      } else {
        execFileSync('convert', [path.join(dir, item.poster), '-quality', '92', path.join(imgDir, `${base}_poster.jpg`)], { stdio: 'pipe' });
        jpgs.push(`${base}_poster`);
        const video = `assets/videos/cuaderno/${base}.mp4`;
        videos.push(video);
        runScript(root, 'transcode_video.sh', [path.join(dir, item.file), video]);
      }
    }
    for (const base of jpgs) runScript(root, 'resize_img.sh', [`cuaderno/${slug}/${base}.jpg`, '640', '480', '320']);
    runScript(root, 'seo_img.sh', [`${imgRel}/${thumbBase(meta, slug)}.jpg`, `${imgRel}/${slug}_seo.jpg`]);
    runScript(root, 'convert_img.sh', [`cuaderno/${slug}`]);
    fs.mkdirSync(postsDir, { recursive: true });
    postFile = `_posts/${meta.taken_at.slice(0, 10)}-${slug}.md`;
    fs.writeFileSync(path.join(root, postFile), buildPost({ meta, caption, title, slug, alt }));
    const expected = [];
    for (const base of jpgs) {
      for (const size of SIZES) for (const ext of ['jpg', 'webp']) expected.push(`${imgRel}/${base}${size}.${ext}`);
    }
    for (const ext of ['jpg', 'webp']) expected.push(`${imgRel}/${slug}_seo.${ext}`);
    expected.push(...videos);
    const missing = expected.filter((f) => !fs.existsSync(path.join(root, f)));
    if (missing.length) throw new Error(`media scripts did not produce: missing ${missing.join(', ')}`);
    saveRegistry(root, accept(reg, meta.shortcode, slug));
  } catch (e) {
    fs.rmSync(imgDir, { recursive: true, force: true });
    for (const v of videos) fs.rmSync(path.join(root, v), { force: true });
    if (postFile) fs.rmSync(path.join(root, postFile), { force: true });
    throw e;
  }
  const warnings = videos
    .filter((v) => fs.statSync(path.join(root, v)).size > MAX_VIDEO_BYTES)
    .map((v) => `${v} is over 8 MB`);
  return { shortcode: meta.shortcode, slug, post: postFile, url: `https://test.almadetuz.com/cuaderno/${slug}/`, warnings };
}

// ---- CLI ----

const COMMANDS = {
  list(scanFile, listFile) {
    const list = buildList(loadRegistry(ROOT), JSON.parse(fs.readFileSync(scanFile, 'utf8')));
    fs.writeFileSync(listFile, JSON.stringify(list, null, 2));
    console.log(list.items.length ? formatList(list) : 'No hay publicaciones nuevas.');
  },
  decide(listFile, answer = '') {
    const list = JSON.parse(fs.readFileSync(listFile, 'utf8'));
    const { registry, toImport } = applyDecisions(loadRegistry(ROOT), list, parseAnswer(answer, list.items.length));
    saveRegistry(ROOT, registry);
    console.log(JSON.stringify({ import: toImport }));
  },
  slug(title) {
    console.log(slugify(title));
  },
  import(dir, slug, title, alt) {
    if (![dir, slug, title, alt].every((a) => typeof a === 'string' && a)) {
      throw new Error("usage: import <bundle-dir> <slug> '<title>' '<alt>'");
    }
    console.log(JSON.stringify(importPost({ dir: path.resolve(dir), slug, title, alt }), null, 2));
  }
};

function main() {
  const [cmd, ...args] = process.argv.slice(2);
  if (!COMMANDS[cmd]) {
    console.error('Usage: cuaderno.js list <scan.json> <list.json> | decide <list.json> "<answer>" | slug "<title>" | import <bundle-dir> <slug> "<title>" "<alt>"');
    process.exit(1);
  }
  try {
    COMMANDS[cmd](...args);
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    process.exit(1);
  }
}

module.exports = {
  cleanCaption, seoDescription, slugify, scalar, ratioFor, thumbBase, mediaBlocks, buildPost,
  loadYaml, loadRegistry, dumpRegistry, saveRegistry, withCursors, buildList, formatList,
  parseAnswer, applyDecisions, accept, importPost, COMMANDS
};

if (require.main === module) main();
