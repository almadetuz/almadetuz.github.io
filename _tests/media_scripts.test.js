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

function probe(file) {
  return execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=codec_name,width,height', '-of', 'csv=p=0', file],
    { encoding: 'utf8' }).trim();
}

function makeVideo(name, size, pixFmt) {
  const out = path.join(VID_DIR, name);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', `testsrc=size=${size}:rate=30`,
    '-t', '1', '-c:v', 'libx264', '-pix_fmt', pixFmt, out]);
  return out;
}

test('seo_img.sh center-crops to 1280x720', () => {
  run('seo_img.sh', ['assets/images/_test_cuaderno_tmp/fix.jpg', 'assets/images/_test_cuaderno_tmp/fix_seo.jpg']);
  assert.equal(identify(path.join(IMG_DIR, 'fix_seo.jpg')), '1280x720');
});

test('transcode_video.sh scales a vertical video to 720 wide, faststart', () => {
  makeVideo('v.mp4', '1080x1920', 'yuv420p');
  run('transcode_video.sh', ['assets/videos/_test_cuaderno_tmp/v.mp4', 'assets/videos/_test_cuaderno_tmp/v_out.mp4']);
  const out = path.join(VID_DIR, 'v_out.mp4');
  assert.equal(probe(out), 'h264,720,1280');
  const bytes = fs.readFileSync(out);
  assert.ok(bytes.indexOf('moov') < bytes.indexOf('mdat'), 'moov atom must come first');
});

test('transcode_video.sh scales a horizontal video to 720 high', () => {
  makeVideo('h.mp4', '1920x1080', 'yuv420p');
  run('transcode_video.sh', ['assets/videos/_test_cuaderno_tmp/h.mp4', 'assets/videos/_test_cuaderno_tmp/h_out.mp4']);
  assert.equal(probe(path.join(VID_DIR, 'h_out.mp4')), 'h264,1280,720');
});

test('transcode_video.sh never upscales and evens odd sizes (no audio track)', () => {
  makeVideo('o.mp4', '481x855', 'yuv444p');
  run('transcode_video.sh', ['assets/videos/_test_cuaderno_tmp/o.mp4', 'assets/videos/_test_cuaderno_tmp/o_out.mp4']);
  assert.equal(probe(path.join(VID_DIR, 'o_out.mp4')), 'h264,480,854');
});
