const test = require('node:test');
const { before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'assets/images/_test_cuaderno_tmp');
const VID_DIR = path.join(ROOT, 'assets/videos/_test_cuaderno_tmp');

// Scripts run from an unrelated cwd to prove they resolve the repo root themselves.
function run(script, args) {
  return execFileSync(path.join(ROOT, '_scripts', script), args, {
    cwd: os.tmpdir(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']
  });
}

function identify(file) {
  return execFileSync('identify', ['-format', '%wx%h', file], { encoding: 'utf8' });
}

before(() => {
  fs.mkdirSync(IMG_DIR, { recursive: true });
  fs.mkdirSync(VID_DIR, { recursive: true });
  execFileSync('convert', ['-size', '1080x1350', 'xc:#c08080', path.join(IMG_DIR, 'fix.jpg')]);
});

after(() => {
  fs.rmSync(IMG_DIR, { recursive: true, force: true });
  fs.rmSync(VID_DIR, { recursive: true, force: true });
});

test('resize_img.sh writes width variants from any cwd', () => {
  run('resize_img.sh', ['_test_cuaderno_tmp/fix.jpg', '640', '480', '320']);
  assert.equal(identify(path.join(IMG_DIR, 'fix_640.jpg')), '640x800');
  assert.equal(identify(path.join(IMG_DIR, 'fix_480.jpg')), '480x600');
  assert.equal(identify(path.join(IMG_DIR, 'fix_320.jpg')), '320x400');
});

test('convert_img.sh writes a webp for every jpg in the subdir', () => {
  run('resize_img.sh', ['_test_cuaderno_tmp/fix.jpg', '320']);
  run('convert_img.sh', ['_test_cuaderno_tmp']);
  assert.ok(fs.existsSync(path.join(IMG_DIR, 'fix.webp')));
  assert.ok(fs.existsSync(path.join(IMG_DIR, 'fix_320.webp')));
});
