const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { COMMANDS } = require('../_scripts/cuaderno.js');

const ROOT = path.resolve(__dirname, '..');
const SKILL = fs.readFileSync(path.join(ROOT, '.claude/skills/cuaderno-instagram/SKILL.md'), 'utf8');

test('skill front matter names the skill and says when to use it', () => {
  const fm = SKILL.match(/^---\n([\s\S]*?)\n---\n/)[1];
  assert.match(fm, /^name: cuaderno-instagram$/m);
  assert.match(fm, /^description: .*Instagram.*$/m);
});

test('every cuaderno.js command the skill runs exists', () => {
  const cmds = [...SKILL.matchAll(/node _scripts\/cuaderno\.js (\w+)/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(cmds)].sort(), ['decide', 'import', 'list', 'slug']);
  for (const cmd of cmds) assert.ok(COMMANDS[cmd], cmd);
});

test('every repo path the skill names exists', () => {
  const paths = [...SKILL.matchAll(/`((?:_scripts|_data|_tests|\.claude\/skills)\/[^`\s]+)`/g)].map((m) => m[1]);
  assert.ok(paths.length >= 5, `found ${paths.length}`);
  for (const p of paths) assert.ok(fs.existsSync(path.join(ROOT, p)), p);
});

test('the skill never commits or pushes', () => {
  assert.ok(!/git (commit|push|add)/.test(SKILL));
});
