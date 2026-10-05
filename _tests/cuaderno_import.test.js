const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const c = require('../_scripts/cuaderno.js');

const ROOT = path.resolve(__dirname, '..');

// Psych, as Jekyll parses front matter.
function psych(text) {
  return JSON.parse(execFileSync('ruby', ['-rdate', '-ryaml', '-rjson', '-e',
    'puts JSON.generate(YAML.safe_load($stdin.read, permitted_classes: [Time, Date]))'],
  { input: text, encoding: 'utf8' }));
}

function frontMatter(post) {
  return psych(post.match(/^---\n([\s\S]*?)\n---\n/)[1]);
}

const META = {
  shortcode: 'DxTest00001', user: 'amanda_tuz', taken_at: '2026-09-20T08:05:09Z', type: 'carousel',
  items: [
    { n: 1, kind: 'image', file: '1.webp', width: 800, height: 1000 },
    { n: 2, kind: 'video', file: '2.mp4', poster: '2_poster.jpg', width: 360, height: 640 },
    { n: 3, kind: 'image', file: '3.webp', width: 800, height: 1000 }
  ]
};

// ---- Caption and post ----

test('caption keeps paragraphs and turns single line breaks into hard breaks', () => {
  assert.equal(c.cleanCaption('\u{1F331}Primera línea.\nSegunda línea.\n\nOtro párrafo.'),
    '\u{1F331}Primera línea.\\\nSegunda línea.\n\nOtro párrafo.');
});

test('caption drops a trailing hashtag block that ends in a bare #', () => {
  assert.equal(c.cleanCaption('Cada nueva primavera.\u{1F98B}\n\n#gloriafuertes\n#amapolas\n#'),
    'Cada nueva primavera.\u{1F98B}');
  assert.equal(c.cleanCaption('Uno # dos.\nFin.'), 'Uno # dos.\\\nFin.');
});

test('caption drops the trailing hashtag block and its spacer lines', () => {
  assert.equal(c.cleanCaption('Texto final.\n.\n.\n.\n#vino #garnacha\n#cebreros'), 'Texto final.');
  assert.equal(c.cleanCaption('Gracias Edu #vino #garnacha'), 'Gracias Edu');
  assert.equal(c.cleanCaption('#solo #tags'), '');
});

test('caption keeps hashtags inside the text and escapes lines kramdown would read as markup', () => {
  assert.equal(
    c.cleanCaption('Hoy #vendimia en El Venero.\n#raices sigue aquí\n- no es lista\n1. tampoco\n> ni cita\n\nFin.'),
    'Hoy #vendimia en El Venero.\\\n\\#raices sigue aquí\\\n\\- no es lista\\\n1\\. tampoco\\\n\\> ni cita\n\nFin.');
});

test('caption links @mentions but not emails or trailing dots', () => {
  assert.equal(c.cleanCaption('Gracias @edu.vino y @amanda_tuz. Escríbeme a hola@almadetuz.com'),
    'Gracias [@edu.vino](https://www.instagram.com/edu.vino/) y [@amanda\\_tuz](https://www.instagram.com/amanda_tuz/). Escríbeme a hola@almadetuz.com');
});

test('caption without hashtags keeps a final spacer line', () => {
  assert.equal(c.cleanCaption('Texto\n...'), 'Texto\\\n...');
});

test('caption collapses blank-looking lines into one paragraph break', () => {
  assert.equal(c.cleanCaption('Uno\n⠀\n\n\nDos'), 'Uno\n\nDos');
});

test('caption with Liquid braces uses entities so Liquid never sees them', () => {
  assert.equal(c.cleanCaption('Usa {{ esto }} y {% aquello %} {% endraw %}'), 'Usa &#123;&#123; esto &#125;&#125; y &#123;% aquello %&#125; &#123;% endraw %&#125;');
});

test('seo description is one line, no emojis, at most 150 chars, cut at a word', () => {
  const s = c.seoDescription(`\u{1F331}Nuevos brotes.\nHoy ${'palabra '.repeat(40)}`, 'x');
  assert.ok(s.length <= 150);
  assert.ok(s.startsWith('Nuevos brotes. Hoy palabra'));
  assert.ok(s.endsWith('palabra'));
  assert.equal(c.seoDescription('Nueva cosecha.\n\nGracias @edu #vino', 'x'), 'Nueva cosecha. Gracias @edu');
});

test('seo description cut never splits an astral character', () => {
  const s = c.seoDescription('a' + '\u{1D400}'.repeat(200), 'x');
  assert.ok(!/[\uD800-\uDFFF]/.test(s.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')));
  assert.ok(Array.from(s).length <= 150);
  assert.ok(s.length > 0);
});

test('seo description falls back to the title for an empty or emoji-only caption', () => {
  assert.equal(c.seoDescription('', 'Título'), 'Título');
  assert.equal(c.seoDescription('\u{1F331}\u{1F377}', 'Título'), 'Título');
});

test('slug is ascii, lowercase, at most 6 words', () => {
  assert.equal(c.slugify('Raíces: la viña que ardió, y volvió a brotar'), 'raices-la-vina-que-ardio-y');
  assert.throws(() => c.slugify('\u{1F331}\u{1F377}'), /cannot make a slug/);
});

test('video ratio is the nearest supported one', () => {
  assert.equal(c.ratioFor(720, 1280), '9x16');
  assert.equal(c.ratioFor(1080, 1350), '4x5');
  assert.equal(c.ratioFor(1080, 1080), '1x1');
  assert.equal(c.ratioFor(1920, 1080), '16x9');
});

test('post for a mixed carousel: one carousel where the first image was, video after it', () => {
  const post = c.buildPost({ meta: META, caption: 'Nueva cosecha.\n\nGracias @edu #vino', title: 'Nueva cosecha', slug: 'nueva-cosecha', alt: 'Racimos de "garnacha"' });
  assert.equal(post, `---
title: "Nueva cosecha"
instagram: DxTest00001
seo_description: "Nueva cosecha. Gracias @edu"
seo_image: /assets/images/cuaderno/nueva-cosecha/nueva-cosecha_seo.jpg
seo_image_width: 1280
seo_image_height: 720
thumb: /assets/images/cuaderno/nueva-cosecha/nueva-cosecha_1
date: 2026-09-20 08:05:09 +0000
---

{% include cuaderno_carousel.html id="nueva-cosecha-carrusel" images="/assets/images/cuaderno/nueva-cosecha/nueva-cosecha_1, /assets/images/cuaderno/nueva-cosecha/nueva-cosecha_3" alt="Racimos de 'garnacha'" %}

{% include cuaderno_video.html src="/assets/videos/cuaderno/nueva-cosecha_2.mp4" poster="/assets/images/cuaderno/nueva-cosecha/nueva-cosecha_2_poster" ratio="9x16" %}

Nueva cosecha.

Gracias [@edu](https://www.instagram.com/edu/)
`);
});

test('post front matter survives quotes and colons in the title (Psych)', () => {
  const post = c.buildPost({ meta: META, caption: 'Ella dijo: "vuelve".', title: 'Ella dijo: "vuelve"', slug: 'ella-dijo', alt: 'x' });
  const fm = frontMatter(post);
  assert.equal(fm.title, 'Ella dijo: "vuelve"');
  assert.equal(fm.seo_description, 'Ella dijo: "vuelve".');
  assert.equal(fm.instagram, 'DxTest00001');
});

test('post for a single image uses cuaderno_image; video first keeps its place', () => {
  const single = { ...META, items: [{ n: 1, kind: 'image', file: '1.webp', width: 1080, height: 1080 }] };
  assert.deepEqual(c.mediaBlocks(single, 's', 'a'), ['{% include cuaderno_image.html src="/assets/images/cuaderno/s/s_1" alt="a" %}']);
  const videoFirst = { ...META, items: [META.items[1], META.items[0], META.items[2]] };
  const blocks = c.mediaBlocks(videoFirst, 's', 'a');
  assert.ok(blocks[0].startsWith('{% include cuaderno_video.html'));
  assert.ok(blocks[1].startsWith('{% include cuaderno_carousel.html'));
});

test('a video-only post uses the poster as thumbnail', () => {
  const reel = { ...META, type: 'video', items: [{ n: 1, kind: 'video', file: '1.mp4', poster: '1_poster.jpg', width: 720, height: 1280 }] };
  assert.equal(c.thumbBase(reel, 's'), 's_1_poster');
  assert.match(c.buildPost({ meta: reel, caption: '', title: 'T', slug: 's', alt: 'a' }), /\nthumb: \/assets\/images\/cuaderno\/s\/s_1_poster\n/);
});

test('shortcodes Psych could misread are quoted', () => {
  assert.equal(c.scalar('DdMn38xDZt_'), 'DdMn38xDZt_');
  assert.equal(c.scalar('DduBVr-NQSh'), 'DduBVr-NQSh');
  assert.equal(c.scalar('-abc'), '"-abc"');
  assert.equal(c.scalar('12345'), '"12345"');
  assert.equal(c.scalar('no'), '"no"');
});


test('caption renders through kramdown with its visible text intact', () => {
  const input = `---
*palavra*
_outra_
texto
===
: definicion
[id]: http://x.com
a | b
$$x$$
<b>no</b>
\`code\`
~~tachado~~
a -- b
&amp; &copy; &#123;
{{ x }}
{% endraw %}
@_vino_ y @amanda_tuz`;

  const escaped = c.cleanCaption(input);
  const html = execFileSync('bundle', ['exec', 'ruby', '-e',
    'require "kramdown"; print Kramdown::Document.new($stdin.read, input: "GFM", hard_wrap: false).to_html'],
  { cwd: ROOT, input: escaped, encoding: 'utf8' });

  // Assert HTML does not contain unwanted markup
  assert.ok(!html.includes('<hr'), 'Should not render horizontal rules');
  assert.ok(!html.includes('<em'), 'Should not render emphasis (em or del tags)');
  assert.ok(!html.includes('<strong'), 'Should not render strong');
  assert.ok(!html.includes('<del'), 'Should not render strikethrough');
  assert.ok(!html.includes('<h1'), 'Should not render h1');
  assert.ok(!html.includes('<h2'), 'Should not render h2');
  assert.ok(!html.includes('<code'), 'Should not render code');
  assert.ok(!html.includes('<dl'), 'Should not render definition list');
  assert.ok(!html.includes('<table'), 'Should not render table');
  assert.equal((html.match(/<a /g) || []).length, 2, 'Only the two mention links');

  // Strip HTML tags and decode HTML entities
  const text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&ndash;/g, '\u{2013}')
    .replace(/&mdash;/g, '\u{2014}')
    .replace(/&hellip;/g, '\u{2026}')
    .replace(/&lsquo;/g, '\u{2018}')
    .replace(/&rsquo;/g, '\u{2019}')
    .replace(/&ldquo;/g, '\u{201C}')
    .replace(/&rdquo;/g, '\u{201D}')
    .replace(/\s+/g, ' ')
    .trim();

  const expectedText = input.replace(/\s+/g, ' ').trim();
  assert.equal(text, expectedText);
});

// ---- Registry ----

function tmpFile(name, text) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cuaderno-reg-'));
  fs.writeFileSync(path.join(dir, name), text);
  return path.join(dir, name);
}

const REG = {
  account: 'amanda_tuz', newest: '2026-09-12T18:24:26Z', oldest: '2026-08-01T10:00:00Z', backfill_done: false,
  posts: [
    { shortcode: 'DdMn38xDZt_', date: '2026-09-12T18:24:26Z', type: 'carousel', decision: 'accepted', slug: 'nuevos-brotes' },
    { shortcode: 'Pend0000001', date: '2026-08-01T10:00:00Z', type: 'image', decision: 'pending' }
  ]
};

function item(shortcode, date, type = 'image', pinned = false) {
  return { shortcode, date, type, pinned, caption: `Texto de ${shortcode}\nsegunda línea` };
}

// Timeline order: pinned posts first, then newest to oldest.
const SCAN = {
  end: false,
  items: [
    item('Pin0000001', '2025-01-01T09:00:00Z', 'image', true),
    item('Pin0000002', '2026-08-15T09:00:00Z', 'video', true),
    item('New0000002', '2026-10-01T12:00:00Z', 'video'),
    item('New0000001', '2026-09-20T08:05:09Z', 'carousel'),
    item('DdMn38xDZt_', '2026-09-12T18:24:26Z', 'carousel'),
    item('Old0000001', '2026-07-30T10:00:00Z'),
    item('Old0000002', '2026-07-20T10:00:00Z')
  ]
};

test('the real registry round-trips byte for byte through load and dump', () => {
  const file = path.join(ROOT, '_data/cuaderno_instagram.yml');
  assert.equal(c.dumpRegistry(c.loadRegistry(ROOT)), fs.readFileSync(file, 'utf8'));
});

test('dumped registry parses back to the same data with Psych', () => {
  assert.deepEqual(c.loadYaml(tmpFile('r.yml', c.dumpRegistry(REG))), REG);
});

test('list: new posts first, then backfill, then pending; pinned posts left out of a partial scan', () => {
  const list = c.buildList(REG, SCAN);
  assert.deepEqual(list.items.map((i) => `${i.n}:${i.shortcode}:${i.source}`), [
    '1:New0000002:new', '2:New0000001:new',
    '3:Old0000001:backfill', '4:Old0000002:backfill',
    '5:Pend0000001:pending'
  ]);
  assert.ok(list.items.every((i) => !('pinned' in i)));
  assert.equal(list.backfill_done, false);
});

test('list refuses a scan that never reached the newest listed post', () => {
  const partial = { end: false, items: SCAN.items.slice(0, 4) };
  assert.throws(() => c.buildList(REG, partial), /scan stopped before reaching the newest listed post/);
});

test('backfill takes 12 at a time and is done only when the end was reached with nothing left over', () => {
  const olds = Array.from({ length: 13 }, (_, k) => item(`Old${String(k).padStart(7, '0')}`, `2026-07-${String(29 - k).padStart(2, '0')}T10:00:00Z`));
  const many = { end: true, items: [SCAN.items[4], ...olds] };
  const list = c.buildList(REG, many);
  assert.equal(list.items.filter((i) => i.source === 'backfill').length, 12);
  assert.equal(list.backfill_done, false);
  const few = { end: true, items: [SCAN.items[4], ...olds.slice(0, 12)] };
  assert.equal(c.buildList(REG, few).backfill_done, true);
  assert.equal(c.buildList({ ...REG, backfill_done: true }, many).items.filter((i) => i.source === 'backfill').length, 0);
});

test('list rejects an unknown media type', () => {
  const bad = { end: true, items: [item('Bad0000001', '2026-10-02T00:00:00Z', 'unknown-11')] };
  assert.throws(() => c.buildList(REG, bad), /unknown type/);
});

test('answers: sí/si/SÍ, commas, spaces, ranges, empty', () => {
  assert.deepEqual(c.parseAnswer('sí 1,3; no 2', 6), { yes: [1, 3], no: [2] });
  assert.deepEqual(c.parseAnswer('SÍ 1-2\nno 4 5', 6), { yes: [1, 2], no: [4, 5] });
  assert.deepEqual(c.parseAnswer('si 6', 6), { yes: [6], no: [] });
  assert.deepEqual(c.parseAnswer('', 6), { yes: [], no: [] });
});

test('answers: unknown word, out of range, both yes and no, not a number', () => {
  assert.throws(() => c.parseAnswer('quizá 1', 6), /cannot read/);
  assert.throws(() => c.parseAnswer('sí 7', 6), /out of range/);
  assert.throws(() => c.parseAnswer('sí 0', 6), /out of range/);
  assert.throws(() => c.parseAnswer('sí 1; no 1', 6), /both yes and no: 1/);
  assert.throws(() => c.parseAnswer('sí uno', 6), /not a number/);
  assert.throws(() => c.parseAnswer('sí', 6), /"sí" has no numbers/);
  assert.throws(() => c.parseAnswer('sí 1; no', 6), /"no" has no numbers/);
});

test('decisions: no -> rejected, sí and unanswered -> pending, sí returned for import, cursors move', () => {
  const list = c.buildList(REG, SCAN);
  const { registry, toImport } = c.applyDecisions(REG, list, c.parseAnswer('sí 1,5; no 2,3', list.items.length));
  assert.deepEqual(toImport, ['New0000002', 'Pend0000001']);
  const d = Object.fromEntries(registry.posts.map((p) => [p.shortcode, p.decision]));
  assert.deepEqual(d, {
    New0000002: 'pending', New0000001: 'rejected', DdMn38xDZt_: 'accepted', Pend0000001: 'pending',
    Old0000001: 'rejected', Old0000002: 'pending'
  });
  assert.equal(registry.newest, '2026-10-01T12:00:00Z');
  assert.equal(registry.oldest, '2026-07-20T10:00:00Z');
  assert.equal(registry.posts[0].shortcode, 'New0000002');
  assert.ok(!registry.posts.some((p) => p.shortcode === 'Pin0000001'));
  assert.ok(!registry.posts.some((p) => p.shortcode === 'Pin0000002'));
});

test('accept marks the post accepted with its slug', () => {
  const reg = c.accept(REG, 'Pend0000001', 'una-cosa');
  assert.deepEqual(reg.posts[1], { shortcode: 'Pend0000001', date: '2026-08-01T10:00:00Z', type: 'image', decision: 'accepted', slug: 'una-cosa' });
});

test('list offers an old pinned post as backfill once the scan reached the end', () => {
  const fullScan = { ...SCAN, end: true };
  const list = c.buildList(REG, fullScan);
  const pinned1 = list.items.find((i) => i.shortcode === 'Pin0000001');
  assert.ok(pinned1);
  assert.equal(pinned1.source, 'backfill');
  assert.ok(!list.items.some((i) => i.shortcode === 'Pin0000002'));
});

test('buildList with missing scan.end returns strictly boolean backfill_done', () => {
  const scanWithoutEnd = { items: SCAN.items };
  const list = c.buildList(REG, scanWithoutEnd);
  assert.equal(typeof list.backfill_done, 'boolean');
  assert.equal(list.backfill_done, false);
});

test('cli: slug command prints the slug; unknown command exits 1 with usage', () => {
  const cli = path.join(ROOT, '_scripts/cuaderno.js');
  assert.equal(execFileSync('node', [cli, 'slug', 'Raíces vivas'], { encoding: 'utf8' }), 'raices-vivas\n');
  assert.throws(() => execFileSync('node', [cli, 'nope'], { stdio: 'pipe' }), /Usage: cuaderno.js/);
});

test('cli: import without all four arguments exits 1 with its usage', () => {
  const cli = path.join(ROOT, '_scripts/cuaderno.js');
  assert.throws(() => execFileSync('node', [cli, 'import', '/nonexistent', 'slug', 'Titulo'], { stdio: 'pipe' }),
    (e) => e.status === 1 && /usage: import <bundle-dir> <slug> '<title>' '<alt>'/.test(e.stderr.toString()));
});

// ---- Import ----

const SIZES = ['', '_320', '_480', '_640'];

// A throwaway repo root with copies of the media scripts, so they resolve their root to it.
function tmpRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cuaderno-root-'));
  fs.mkdirSync(path.join(root, '_scripts'));
  for (const s of ['resize_img.sh', 'convert_img.sh', 'seo_img.sh', 'transcode_video.sh']) {
    fs.copyFileSync(path.join(ROOT, '_scripts', s), path.join(root, '_scripts', s));
    fs.chmodSync(path.join(root, '_scripts', s), 0o755);
  }
  fs.mkdirSync(path.join(root, '_data'));
  c.saveRegistry(root, {
    account: 'amanda_tuz', newest: '', oldest: '', backfill_done: false,
    posts: [
      { shortcode: 'DxTest00001', date: '2026-09-20T08:05:09Z', type: 'carousel', decision: 'pending' },
      { shortcode: 'DdMn38xDZt_', date: '2026-09-12T18:24:26Z', type: 'carousel', decision: 'accepted', slug: 'nuevos-brotes' }
    ]
  });
  return root;
}

// What bundle.js downloads, with generated media.
function makeBundle(meta, caption) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cuaderno-bundle-'));
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta));
  fs.writeFileSync(path.join(dir, 'caption.txt'), caption);
  for (const i of meta.items) {
    if (i.kind === 'image') {
      execFileSync('convert', ['-size', `${i.width}x${i.height}`, 'xc:#80a080', path.join(dir, i.file)]);
    } else {
      execFileSync('convert', ['-size', `${i.width}x${i.height}`, 'xc:#a08080', path.join(dir, i.poster)]);
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', `testsrc=size=${i.width}x${i.height}:rate=30`,
        '-t', '1', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', path.join(dir, i.file)]);
    }
  }
  return dir;
}

function registryOf(root) {
  return Object.fromEntries(c.loadRegistry(root).posts.map((p) => [p.shortcode, p]));
}

test('import writes every variant, the post and the accepted registry entry', () => {
  const root = tmpRoot();
  const dir = makeBundle(META, 'Nueva cosecha.\n\nGracias @edu #vino');
  const res = c.importPost({ root, dir, slug: 'nueva-cosecha', title: 'Nueva cosecha', alt: 'Racimos' });
  const img = (f) => path.join(root, 'assets/images/cuaderno/nueva-cosecha', f);
  for (const base of ['nueva-cosecha_1', 'nueva-cosecha_3', 'nueva-cosecha_2_poster']) {
    for (const s of SIZES) for (const ext of ['.jpg', '.webp']) assert.ok(fs.existsSync(img(base + s + ext)), base + s + ext);
  }
  assert.equal(execFileSync('identify', ['-format', '%wx%h', img('nueva-cosecha_seo.jpg')], { encoding: 'utf8' }), '1280x720');
  assert.ok(fs.existsSync(img('nueva-cosecha_seo.webp')));
  assert.equal(execFileSync('file', ['-b', '--mime-type', img('nueva-cosecha_1.jpg')], { encoding: 'utf8' }).trim(), 'image/jpeg');
  assert.ok(fs.existsSync(path.join(root, 'assets/videos/cuaderno/nueva-cosecha_2.mp4')));
  const post = fs.readFileSync(path.join(root, '_posts/2026-09-20-nueva-cosecha.md'), 'utf8');
  assert.equal(post, c.buildPost({ meta: META, caption: 'Nueva cosecha.\n\nGracias @edu #vino', title: 'Nueva cosecha', slug: 'nueva-cosecha', alt: 'Racimos' }));
  assert.deepEqual(registryOf(root).DxTest00001, { shortcode: 'DxTest00001', date: '2026-09-20T08:05:09Z', type: 'carousel', decision: 'accepted', slug: 'nueva-cosecha' });
  assert.deepEqual(res, { shortcode: 'DxTest00001', slug: 'nueva-cosecha', post: '_posts/2026-09-20-nueva-cosecha.md', url: 'https://test.almadetuz.com/cuaderno/nueva-cosecha/', warnings: [] });
});

test('import refuses a slug already used and leaves everything as it was', () => {
  const root = tmpRoot();
  fs.mkdirSync(path.join(root, '_posts'));
  fs.writeFileSync(path.join(root, '_posts/2026-09-12-nuevos-brotes.md'), '---\n---\n');
  const dir = makeBundle(META, 'x');
  assert.throws(() => c.importPost({ root, dir, slug: 'nuevos-brotes', title: 'T', alt: 'a' }), /slug "nuevos-brotes" is already used/);
  assert.equal(registryOf(root).DxTest00001.decision, 'pending');
  assert.ok(!fs.existsSync(path.join(root, 'assets/images/cuaderno/nuevos-brotes')));
});

test('import refuses posts that are not pending, other accounts and bad slugs', () => {
  const root = tmpRoot();
  const dir = makeBundle({ ...META, items: [META.items[0]] }, 'x');
  assert.throws(() => c.importPost({ root, dir, slug: 'Mal Slug', title: 'T', alt: 'a' }), /invalid slug/);
  const other = makeBundle({ ...META, user: 'almadetuz', items: [META.items[0]] }, 'x');
  assert.throws(() => c.importPost({ root, dir: other, slug: 'ok', title: 'T', alt: 'a' }), /belongs to @almadetuz/);
  const accepted = makeBundle({ ...META, shortcode: 'DdMn38xDZt_', items: [META.items[0]] }, 'x');
  assert.throws(() => c.importPost({ root, dir: accepted, slug: 'otra', title: 'T', alt: 'a' }), /not pending/);
});

test('a broken media file aborts the import, removes what it created and keeps the post pending', () => {
  const root = tmpRoot();
  const dir = makeBundle(META, 'x');
  fs.writeFileSync(path.join(dir, '3.webp'), 'not an image');
  assert.throws(() => c.importPost({ root, dir, slug: 'rota', title: 'T', alt: 'a' }));
  assert.ok(!fs.existsSync(path.join(root, 'assets/images/cuaderno/rota')));
  assert.ok(!fs.existsSync(path.join(root, 'assets/videos/cuaderno/rota_2.mp4')));
  assert.ok(!fs.existsSync(path.join(root, '_posts')) || fs.readdirSync(path.join(root, '_posts')).length === 0);
  assert.equal(registryOf(root).DxTest00001.decision, 'pending');
});

test('a media script that exits 0 without its output aborts the import', () => {
  const root = tmpRoot();
  fs.writeFileSync(path.join(root, '_scripts/convert_img.sh'), '#!/bin/sh\nexit 0\n');
  fs.chmodSync(path.join(root, '_scripts/convert_img.sh'), 0o755);
  const dir = makeBundle(META, 'x');
  assert.throws(() => c.importPost({ root, dir, slug: 'vacia', title: 'T', alt: 'a' }), /missing/);
  assert.ok(!fs.existsSync(path.join(root, 'assets/images/cuaderno/vacia')));
  assert.ok(!fs.existsSync(path.join(root, 'assets/videos/cuaderno/vacia_2.mp4')));
  assert.ok(!fs.existsSync(path.join(root, '_posts')) || fs.readdirSync(path.join(root, '_posts')).length === 0);
  assert.equal(registryOf(root).DxTest00001.decision, 'pending');
});

test('a failed import can be retried with the same slug', () => {
  const root = tmpRoot();
  const dir = makeBundle(META, 'x');
  fs.writeFileSync(path.join(dir, '3.webp'), 'not an image');
  assert.throws(() => c.importPost({ root, dir, slug: 'reintento', title: 'T', alt: 'a' }));
  const fixed = makeBundle(META, 'x');
  const res = c.importPost({ root, dir: fixed, slug: 'reintento', title: 'T', alt: 'a' });
  assert.equal(res.slug, 'reintento');
  assert.equal(registryOf(root).DxTest00001.decision, 'accepted');
});
