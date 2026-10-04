const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

const SKILL = path.resolve(__dirname, '../.claude/skills/cuaderno-instagram');

// The snippets run in the browser; their pure part is everything above the MAIN marker line.
function load(file, names) {
  const [pure, main] = fs.readFileSync(path.join(SKILL, file), 'utf8').split('\n// MAIN\n');
  assert.ok(main, `${file}: MAIN marker line`);
  return vm.runInContext(`${pure}\n;({ ${names.join(', ')} })`, vm.createContext({ Blob, Date, JSON }));
}

const bundle = load('bundle.js', ['buildTar', 'planMedia']);
const scan = load('scan.js', ['timelinePage', 'scanDone']);

const cand = (width, height, url) => ({ width, height, url });

test('buildTar writes an archive GNU tar lists and extracts byte for byte', async () => {
  const enc = new TextEncoder();
  const files = [
    { name: 'meta.json', data: enc.encode('{"shortcode":"X"}') },
    { name: 'caption.txt', data: enc.encode('Texto con acentos: áéí\n') },
    { name: '1.webp', data: new Uint8Array(512).fill(7) },
    { name: 'empty.txt', data: new Uint8Array(0) },
    { name: '2.mp4', data: Uint8Array.from({ length: 1500 }, (_, i) => i % 251) }
  ];
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cuaderno-tar-'));
  const tarFile = path.join(dir, 'b.tar');
  fs.writeFileSync(tarFile, Buffer.from(await bundle.buildTar(files).arrayBuffer()));
  assert.equal(execFileSync('tar', ['-tf', tarFile], { encoding: 'utf8' }), files.map((f) => f.name).join('\n') + '\n');
  execFileSync('tar', ['-xf', tarFile, '-C', dir]);
  for (const f of files) assert.deepEqual(new Uint8Array(fs.readFileSync(path.join(dir, f.name))), f.data, f.name);
});

test('planMedia keeps carousel order and picks the largest image, video and cover', () => {
  const post = {
    media_type: 8,
    carousel_media: [
      { media_type: 1, image_versions2: { candidates: [cand(640, 800, 'i640'), cand(1440, 1800, 'i1440'), cand(1080, 1350, 'i1080')] } },
      { media_type: 2, image_versions2: { candidates: [cand(720, 1280, 'cover')] }, video_versions: [cand(480, 854, 'v480'), cand(720, 1280, 'v720')] }
    ]
  };
  assert.deepEqual(JSON.parse(JSON.stringify(bundle.planMedia(post))), [
    { n: 1, kind: 'image', width: 1440, height: 1800, imageUrl: 'i1440' },
    { n: 2, kind: 'video', width: 720, height: 1280, videoUrl: 'v720', posterUrl: 'cover' }
  ]);
});

test('planMedia treats a single image and a reel as one item', () => {
  const image = { media_type: 1, image_versions2: { candidates: [cand(1080, 1080, 'a')] } };
  assert.equal(bundle.planMedia(image).length, 1);
  const reel = { media_type: 2, image_versions2: { candidates: [cand(720, 1280, 'c')] }, video_versions: [cand(720, 1280, 'v')] };
  assert.equal(bundle.planMedia(reel)[0].kind, 'video');
});

test('timelinePage reads the GraphQL timeline without URLs', () => {
  const text = JSON.stringify({ data: { xdt_api__v1__feed__user_timeline_graphql_connection: {
    edges: [
      { node: { code: 'A1', taken_at: 1789237466, media_type: 8, timeline_pinned_user_ids: [42], caption: { text: 'Hola https://x.com/a?b=1 y www.y.com/c adiós' } } },
      { node: { code: 'B2', taken_at: 1789000000, media_type: 2, timeline_pinned_user_ids: [], caption: null } },
      { node: { code: 'C3', taken_at: 1788000000, media_type: 11, caption: { text: 'x' } } }
    ],
    page_info: { has_next_page: false }
  } } });
  const page = scan.timelinePage(text);
  assert.equal(page.end, true);
  assert.deepEqual(JSON.parse(JSON.stringify(page.items)), [
    { shortcode: 'A1', date: '2026-09-12T18:24:26Z', type: 'carousel', pinned: true, caption: 'Hola [enlace] y [enlace] adiós' },
    { shortcode: 'B2', date: '2026-09-10T00:26:40Z', type: 'video', pinned: false, caption: '' },
    { shortcode: 'C3', date: '2026-08-29T10:40:00Z', type: 'unknown-11', pinned: false, caption: 'x' }
  ]);
  assert.deepEqual(JSON.parse(JSON.stringify(scan.timelinePage('{"data":{"other":1}}'))), { end: false, items: [] });
  assert.deepEqual(JSON.parse(JSON.stringify(scan.timelinePage('<html>'))), { end: false, items: [] });
});

test('scanDone waits for a non-pinned post at or before newest, then for a backfill batch', () => {
  const p = { newest: '2026-09-12T18:24:26Z', oldest: '2026-09-12T18:24:26Z', backfillDone: false, batch: 2 };
  const it = (date, pinned = false) => ({ date, pinned });
  assert.equal(scan.scanDone([it('2026-10-01T00:00:00Z'), it('2020-01-01T00:00:00Z', true)], false, p), false);
  const reached = [it('2026-10-01T00:00:00Z'), it('2026-09-12T18:24:26Z')];
  assert.equal(scan.scanDone(reached, false, { ...p, backfillDone: true }), true);
  assert.equal(scan.scanDone([...reached, it('2026-08-01T00:00:00Z')], false, p), false);
  assert.equal(scan.scanDone([...reached, it('2026-08-01T00:00:00Z'), it('2026-07-01T00:00:00Z')], false, p), true);
  assert.equal(scan.scanDone([], true, p), true);
});

test('scan.js PARAMS keep the placeholders the skill replaces', () => {
  const src = fs.readFileSync(path.join(SKILL, 'scan.js'), 'utf8');
  assert.match(src, /const PARAMS = \{ newest: '__NEWEST__', oldest: '__OLDEST__', backfillDone: __BACKFILL_DONE__, batch: 12 \};/);
});
