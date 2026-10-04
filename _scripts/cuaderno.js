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
const TRAILING_TAGS = /(?:\s*#[\p{L}\p{N}_]+)+\s*$/u;
const MENTION = /(?<![\w@.])@([A-Za-z0-9_](?:[A-Za-z0-9._]*[A-Za-z0-9_])?)/g;
const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}‍️⃣]/gu;
const RATIOS = { '9x16': 9 / 16, '4x5': 4 / 5, '1x1': 1, '16x9': 16 / 9 };

// Caption lines without the trailing hashtag block and its spacer lines, blank-looking lines emptied.
function captionLines(text) {
  let t = text.replace(/\r\n?/g, '\n');
  let prev;
  do {
    prev = t;
    t = t.replace(TRAILING_TAGS, '');
    const lines = t.split('\n');
    while (lines.length && SPACER.test(lines[lines.length - 1])) lines.pop();
    t = lines.join('\n');
  } while (t !== prev);
  return t.split('\n').map((l) => (BLANK.test(l) ? '' : l.trim()));
}

// Escape plain text segments (outside mentions): backslash-escape special characters,
// replace braces with entities so Liquid never sees them.
function escapePlainText(text) {
  // Escape backslash first so we don't double-escape
  text = text.replace(/\\/g, '\\\\');
  // Escape these characters anywhere: * _ ` [ ] < > | $
  text = text.replace(/([*_`\[\]<>|$])/g, '\\$1');
  // Replace braces with entities so Liquid never sees them
  text = text.replace(/\{/g, '&#123;');
  text = text.replace(/\}/g, '&#125;');
  return text;
}

// Escape line-leading characters that kramdown would read as markup.
function escapeLineStart(line) {
  // Line-leading # -> \#
  if (line.startsWith('#')) return '\\' + line;
  // Line-leading + - = : -> \+, \-, \=, \:
  if (/^[+\-=:]/.test(line)) return '\\' + line;
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
    result += `[@${match[1]}](https://www.instagram.com/${match[1]}/)`;
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
  if (s.length <= 150) return s;
  const cut = s.slice(0, 150);
  const space = cut.lastIndexOf(' ');
  return (space > 100 ? cut.slice(0, space) : cut).replace(/[\s,;:]+$/, '');
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

module.exports = { cleanCaption, seoDescription, slugify, scalar, ratioFor, thumbBase, mediaBlocks, buildPost };
