#!/bin/bash
# Transcodes an Instagram video for the web: H.264 + AAC, short side 720 (never upscaled).
# Example: _scripts/transcode_video.sh /tmp/reel.mp4 assets/videos/cuaderno/slug_1.mp4

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ROOT_DIR=$( cd -- "$SCRIPT_DIR/.." &> /dev/null && pwd )
cd "$ROOT_DIR"

MAX_BYTES=$((8 * 1024 * 1024))

input=$1
output=$2

if [ -z "$input" ] || [ -z "$output" ]; then
  echo "ERROR: Usage: transcode_video.sh <input> <output.mp4>"
  exit 1
fi

if [ ! -f "$input" ]; then
  echo "ERROR: Video '$input' not found"
  exit 2
fi

# Short side to 720 at most, both sides even (libx264 needs it)
scale="scale=w='if(gt(iw,ih),-2,trunc(min(720,iw)/2)*2)':h='if(gt(iw,ih),trunc(min(720,ih)/2)*2,-2)'"

ffmpeg -v error -y -i "$input" -vf "$scale" \
  -c:v libx264 -preset slow -crf 28 -maxrate 1.5M -bufsize 3M -pix_fmt yuv420p \
  -c:a aac -b:a 128k -movflags +faststart "$output" || exit 3

size=$(stat -c %s "$output")
if [ "$size" -gt "$MAX_BYTES" ]; then
  echo "WARNING: '$output' is $size bytes, over 8 MB" >&2
fi
