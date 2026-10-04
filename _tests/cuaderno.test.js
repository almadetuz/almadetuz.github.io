const test = require('node:test');
const { before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const SITE = fs.mkdtempSync(path.join(os.tmpdir(), 'cuaderno-site-'));
// Fixture posts are written into _posts for one build and always removed.
// Their names start with "zz-fixture" so cuaderno_content.test.js can skip them.
// Dates pin both prev/next boundaries whatever real posts exist: 2999 is newer
// than any real post (newest end), 1900 is older than any (oldest end).
const FIXTURES = {
  '2999-01-02-zz-fixture-media.md': `---
title: "Fixture: media"
instagram: FIXTUREnew
seo_description: "Fixture post with every media include"
seo_image: /assets/images/cuaderno/zz-fixture-media/zz-fixture-media_seo.jpg
seo_image_width: 1280
seo_image_height: 720
thumb: /assets/images/cuaderno/zz-fixture-media/zz-fixture-media_1
date: 2999-01-02 10:00:00 +0000
---

Primer párrafo.

{% include cuaderno_image.html src="/f/img" alt='Amanda "canta"' %}

{% include cuaderno_carousel.html id="fx-car" images="/f/a, /f/b ,/f/c" alt="Carrusel" %}

{% include cuaderno_video.html src="/f/v.mp4" poster="/f/v_poster" %}

{% include cuaderno_video.html src="/f/w.mp4" poster="/f/w_poster" ratio="4x5" %}
`,
  '2999-01-01-zz-fixture-older.md': `---
title: "Fixture older"
instagram: FIXTUREold
seo_description: "Older fixture post"
seo_image: /assets/images/cuaderno/zz-fixture-older/zz-fixture-older_seo.jpg
seo_image_width: 1280
seo_image_height: 720
thumb: /assets/images/cuaderno/zz-fixture-older/zz-fixture-older_1
date: 2999-01-01 10:00:00 +0000
---

Texto antiguo.
`,
  '1900-01-01-zz-fixture-oldest.md': `---
title: "Fixture oldest"
instagram: FIXTUREoldest
seo_description: "Oldest fixture post"
seo_image: /assets/images/cuaderno/zz-fixture-oldest/zz-fixture-oldest_seo.jpg
seo_image_width: 1280
seo_image_height: 720
thumb: /assets/images/cuaderno/zz-fixture-oldest/zz-fixture-oldest_1
date: 1900-01-01 10:00:00 +0000
---

Texto el mas antiguo.
`
};

function read(rel) {
  return fs.readFileSync(path.join(SITE, rel), 'utf8');
}

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

before(() => {
  try {
    for (const [name, body] of Object.entries(FIXTURES)) {
      fs.writeFileSync(path.join(ROOT, '_posts', name), body);
    }
    execFileSync('bundle', ['exec', 'jekyll', 'build', '-q', '--future', '-d', SITE], { cwd: ROOT, stdio: 'pipe' });
  } finally {
    for (const name of Object.keys(FIXTURES)) {
      fs.rmSync(path.join(ROOT, '_posts', name), { force: true });
    }
  }
});

after(() => fs.rmSync(SITE, { recursive: true, force: true }));

test('cuaderno_image renders webp and jpg srcsets with an escaped alt', () => {
  const html = read('cuaderno/zz-fixture-media/index.html');
  assert.match(html, /<source type="image\/webp" srcset="\/f\/img_320\.webp 320w, \/f\/img_480\.webp 480w, \/f\/img_640\.webp 640w"/);
  assert.match(html, /<img src="\/f\/img_640\.jpg" srcset="\/f\/img_320\.jpg 320w, \/f\/img_480\.jpg 480w, \/f\/img_640\.jpg 640w"/);
  assert.ok(html.includes('alt="Amanda &quot;canta&quot;"'));
});

test('cuaderno_carousel renders one slide per stripped base, first active and eager', () => {
  const html = read('cuaderno/zz-fixture-media/index.html');
  assert.equal(count(html, 'class="carousel-item'), 3);
  assert.equal(count(html, 'class="carousel-item active"'), 1);
  for (const b of ['/f/a', '/f/b', '/f/c']) assert.ok(html.includes(`src="${b}_640.jpg"`), b);
  assert.equal(count(html, 'data-bs-target="#fx-car"'), 5); // 3 indicators + prev + next
  assert.match(html, /src="\/f\/a_640\.jpg"[^>]*loading="eager"/);
  assert.match(html, /src="\/f\/b_640\.jpg"[^>]*loading="lazy"/);
});

test('cuaderno_video renders a 9x16 playsinline video with the 640 poster by default', () => {
  const html = read('cuaderno/zz-fixture-media/index.html');
  assert.match(html, /<div class="ratio ratio-9x16">\s*<video controls playsinline preload="metadata" poster="\/f\/v_poster_640\.jpg">\s*<source src="\/f\/v\.mp4" type="video\/mp4">/);
  assert.ok(html.includes('class="ratio ratio-4x5"'));
});

test('posts live at /cuaderno/<slug>/ with the cuaderno_post layout', () => {
  const html = read('cuaderno/zz-fixture-media/index.html');
  assert.ok(html.includes('<article class="cuaderno-post">'));
  assert.ok(html.includes('<h1 class="cuaderno-title">Fixture: media</h1>'));
  assert.ok(html.includes('<header>'), 'page layout header is present');
});

test('post date is written in Spanish', () => {
  const html = read('cuaderno/zz-fixture-media/index.html');
  assert.match(html, /<time datetime="2999-01-02T\d\d:00:00[+-]\d\d:\d\d">2 de enero de 2999<\/time>/);
});

test('post page does not link to the Instagram original', () => {
  const html = read('cuaderno/zz-fixture-media/index.html');
  assert.ok(!html.includes('instagram.com/p/'));
});

test('post page header reads Cuaderno, not the post title', () => {
  const html = read('cuaderno/zz-fixture-media/index.html');
  const header = html.slice(html.indexOf('<header>'), html.indexOf('</header>'));
  assert.ok(header.includes('<span>Cuaderno</span>'));
  assert.ok(!header.includes('Fixture: media'));
  assert.ok(html.includes('<title>Fixture: media'), 'post title stays in <title>');
});

test('non-post pages keep their own title in the header', () => {
  const html = read('cuaderno/index.html');
  const header = html.slice(html.indexOf('<header>'), html.indexOf('</header>'));
  assert.match(header, /<span>[^<]+<\/span>/);
  assert.ok(!header.includes('header_title'));
});

test('cuaderno carousel auto-advances every 4 seconds like /mis-canciones/', () => {
  const html = read('cuaderno/zz-fixture-media/index.html');
  assert.ok(html.includes('data-bs-ride="carousel"'));
  assert.ok(html.includes('data-bs-interval="4000"'));
  assert.ok(!html.includes('data-bs-interval="false"'));
  assert.ok(html.includes('carousel-control carousel-control-prev'));
  assert.ok(!html.includes('data-engage-carousel'));
});

test('back link is centered via its class', () => {
  const html = read('cuaderno/zz-fixture-media/index.html');
  assert.ok(html.includes('<p class="cuaderno-back"><a href="/cuaderno/">Volver al cuaderno</a></p>'));
});

test('previous/next links appear only when the neighbour exists', () => {
  const newer = read('cuaderno/zz-fixture-media/index.html');
  const older = read('cuaderno/zz-fixture-older/index.html');
  assert.ok(newer.includes('href="/cuaderno/zz-fixture-older/"'));
  assert.ok(!newer.includes('class="cuaderno-next"'));
  assert.ok(older.includes('href="/cuaderno/zz-fixture-media/"'));
  const oldest = read('cuaderno/zz-fixture-oldest/index.html');
  assert.ok(!oldest.includes('class="cuaderno-prev"'));
  assert.match(oldest, /class="cuaderno-next"[^>]*href="\/cuaderno\/[^"]+"/);
});

test('index lists posts newest first with thumb, date and description', () => {
  const html = read('cuaderno/index.html');
  const iNew = html.indexOf('href="/cuaderno/zz-fixture-media/"');
  const iOld = html.indexOf('href="/cuaderno/zz-fixture-older/"');
  assert.ok(iNew > -1 && iOld > iNew, 'newest first');
  assert.ok(html.includes('/assets/images/cuaderno/zz-fixture-media/zz-fixture-media_1_320.webp'));
  assert.ok(html.includes('Fixture post with every media include'));
  assert.ok(html.includes('2 de enero de 2999'));
});

test('posts are in the feed and the sitemap', () => {
  assert.ok(read('feed.xml').includes('/cuaderno/zz-fixture-media/'));
  assert.ok(read('sitemap.xml').includes('/cuaderno/zz-fixture-media/'));
  assert.ok(read('sitemap.xml').includes('/cuaderno/</loc>'));
});

test('post page carries its SEO description', () => {
  assert.ok(read('cuaderno/zz-fixture-media/index.html').includes('content="Fixture post with every media include"'));
});
