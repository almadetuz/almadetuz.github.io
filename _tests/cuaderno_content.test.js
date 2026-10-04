const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const POSTS = path.join(ROOT, '_posts');
const REGISTRY = path.join(ROOT, '_data/cuaderno_instagram.yml');
const DECISIONS = ['accepted', 'rejected', 'pending'];
const SIZES = ['_320', '_480', '_640'];

// Psych (Ruby), the same YAML parser Jekyll uses, so yes/no and dates behave as on the site.
function yaml(text) {
  const json = execFileSync('ruby', ['-rdate', '-ryaml', '-rjson', '-e',
    'puts JSON.generate(YAML.safe_load($stdin.read, permitted_classes: [Time, Date]))'],
    { input: text, encoding: 'utf8' });
  return JSON.parse(json);
}

function realPosts() {
  if (!fs.existsSync(POSTS)) return [];
  return fs.readdirSync(POSTS)
    .filter((f) => f.endsWith('.md') && !f.includes('zz-fixture'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(POSTS, file), 'utf8');
      const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      assert.ok(m, `${file}: front matter block`);
      return { file, slug: file.replace(/^\d{4}-\d\d-\d\d-/, '').replace(/\.md$/, ''), fm: yaml(m[1]), body: m[2] };
    });
}

function exists(webPath) {
  return fs.existsSync(path.join(ROOT, webPath));
}

function assertVariants(base, where) {
  for (const ext of ['.jpg', '.webp']) {
    assert.ok(exists(base + ext), `${where}: ${base}${ext}`);
    for (const s of SIZES) assert.ok(exists(base + s + ext), `${where}: ${base}${s}${ext}`);
  }
}

test('registry is well formed', () => {
  const reg = yaml(fs.readFileSync(REGISTRY, 'utf8'));
  assert.equal(reg.account, 'amanda_tuz');
  assert.equal(typeof reg.backfill_done, 'boolean');
  const seen = new Set();
  for (const p of reg.posts) {
    assert.ok(!seen.has(p.shortcode), `duplicate ${p.shortcode}`);
    seen.add(p.shortcode);
    assert.ok(DECISIONS.includes(p.decision), `${p.shortcode}: decision "${p.decision}"`);
    assert.ok(['image', 'carousel', 'video'].includes(p.type), `${p.shortcode}: type`);
    if (p.decision === 'accepted') assert.ok(p.slug, `${p.shortcode}: accepted needs a slug`);
  }
  const dates = reg.posts.map((p) => Date.parse(p.date));
  assert.equal(Date.parse(reg.newest), Math.max(...dates), 'newest is the newest listed date');
  assert.equal(Date.parse(reg.oldest), Math.min(...dates), 'oldest is the oldest listed date');
});

test('every accepted registry entry has its post and every post is accepted', () => {
  const reg = yaml(fs.readFileSync(REGISTRY, 'utf8'));
  const posts = realPosts();
  for (const p of reg.posts.filter((x) => x.decision === 'accepted')) {
    const post = posts.find((x) => x.slug === p.slug);
    assert.ok(post, `post file for ${p.slug}`);
    assert.equal(post.fm.instagram, p.shortcode, `${p.slug}: instagram shortcode`);
  }
  for (const post of posts) {
    assert.ok(reg.posts.some((x) => x.decision === 'accepted' && x.slug === post.slug), `${post.file} in registry`);
  }
});

test('every post has complete front matter', () => {
  for (const { file, fm } of realPosts()) {
    for (const key of ['title', 'instagram', 'seo_description', 'seo_image', 'thumb', 'date']) {
      assert.ok(fm[key], `${file}: ${key}`);
    }
    assert.equal(typeof fm.title, 'string', `${file}: title is a string`);
    assert.ok(fm.seo_description.length <= 160, `${file}: seo_description <= 160`);
    assert.equal(fm.seo_image_width, 1280);
    assert.equal(fm.seo_image_height, 720);
  }
});

test('every referenced media file exists', () => {
  for (const { file, fm, body } of realPosts()) {
    assert.ok(exists(fm.seo_image), `${file}: ${fm.seo_image}`);
    assert.ok(exists(fm.seo_image.replace(/\.jpg$/, '.webp')), `${file}: seo webp`);
    assertVariants(fm.thumb, `${file} thumb`);
    for (const m of body.matchAll(/{%\s*include cuaderno_image\.html[^%]*src="([^"]+)"/g)) assertVariants(m[1], file);
    for (const m of body.matchAll(/{%\s*include cuaderno_carousel\.html[^%]*images="([^"]+)"/g)) {
      for (const base of m[1].split(',')) assertVariants(base.trim(), file);
    }
    for (const m of body.matchAll(/{%\s*include cuaderno_video\.html([^%]*)%}/g)) {
      const src = m[1].match(/src="([^"]+)"/)[1];
      const poster = m[1].match(/poster="([^"]+)"/)[1];
      assert.ok(exists(src), `${file}: ${src}`);
      assertVariants(poster, `${file} poster`);
    }
  }
});

test('no post ends with a hashtag-only paragraph', () => {
  for (const { file, body } of realPosts()) {
    const paragraphs = body.trim().split(/\n\s*\n/);
    const last = paragraphs[paragraphs.length - 1].trim();
    assert.ok(!/^(#[\p{L}\p{N}_]+\s*)+$/u.test(last), `${file}: trailing hashtags`);
  }
});
