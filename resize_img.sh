#!/bin/bash

# Example: ./resize_img.sh filename.jpg 1280 640 480 320

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
IMG_PATH="assets/images"
cd "$SCRIPT_DIR"

filename=$1
shift

if [ -z "$filename" ]; then
  echo "ERROR: You need to set the image filename to resize"
  exit 1
fi

if [ ! -f $IMG_PATH/$filename ]; then
  echo "ERROR: Image '$IMG_PATH/$filename' not found"
  exit 2
fi

base_name=$(basename -- "$filename")
extension="${base_name##*.}"
image="${base_name%.*}"

if [ "$extension" != "jpg" ]; then
  echo "ERROR: Image extension is not .jpg"
  exit 3
fi

while (( "$#" )); do

width=$1
echo "convert -resize ${width}x $IMG_PATH/$filename -quality 90 $IMG_PATH/${image}_${width}.jpg"
convert -resize ${width}x $IMG_PATH/$filename -quality 90 $IMG_PATH/${image}_${width}.jpg

shift

done
