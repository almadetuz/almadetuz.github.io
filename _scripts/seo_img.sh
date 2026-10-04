#!/bin/bash
# Center-crops an image to the 1280x720 SEO size.
# Example: _scripts/seo_img.sh assets/images/cuaderno/slug/slug_1.jpg assets/images/cuaderno/slug/slug_seo.jpg

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ROOT_DIR=$( cd -- "$SCRIPT_DIR/.." &> /dev/null && pwd )
cd "$ROOT_DIR"

input=$1
output=$2

if [ -z "$input" ] || [ -z "$output" ]; then
  echo "ERROR: Usage: seo_img.sh <input.jpg> <output.jpg>"
  exit 1
fi

if [ ! -f "$input" ]; then
  echo "ERROR: Image '$input' not found"
  exit 2
fi

convert "$input" -resize 1280x720^ -gravity center -extent 1280x720 -quality 90 "$output"
