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
const FIXTURES = {
  '2000-01-02-zz-fixture-media.md': `---
title: "Fixture: media"
instagram: FIXTUREnew
seo_description: "Fixture post with every media include"
seo_image: /assets/images/cuaderno/zz-fixture-media/zz-fixture-media_seo.jpg
seo_image_width: 1280
seo_image_height: 720
thumb: /assets/images/cuaderno/zz-fixture-media/zz-fixture-media_1
date: 2000-01-02 10:00:00 +0000
---

Primer párrafo.

{% include cuaderno_image.html src="/f/img" alt='Amanda "canta"' %}

{% include cuaderno_carousel.html id="fx-car" images="/f/a, /f/b ,/f/c" alt="Carrusel" %}

{% include cuaderno_video.html src="/f/v.mp4" poster="/f/v_poster" %}

{% include cuaderno_video.html src="/f/w.mp4" poster="/f/w_poster" ratio="4x5" %}
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
    execFileSync('bundle', ['exec', 'jekyll', 'build', '-q', '-d', SITE], { cwd: ROOT, stdio: 'pipe' });
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
