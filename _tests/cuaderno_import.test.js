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
    'Gracias [@edu.vino](https://www.instagram.com/edu.vino/) y [@amanda_tuz](https://www.instagram.com/amanda_tuz/). Escríbeme a hola@almadetuz.com');
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
{% endraw %}`;
  
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
  assert.ok(!html.includes('<a '), 'Should not render links (other than auto-links)');
  
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
