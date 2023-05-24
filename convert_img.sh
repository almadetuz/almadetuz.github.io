#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
IMG_PATH="assets/images"
cd "$SCRIPT_DIR"

for image in $IMG_PATH/*.jpg; do
  base_img=`basename "${image%.jpg}"`
  webp_img="${base_img}.webp"

  echo -n "${base_img} ... "
  if [ -f "$IMG_PATH/$webp_img" ]; then
    echo "OK"
  else
    echo "CONVERTING"
    cwebp "$image" -o "$IMG_PATH/$webp_img";
  fi
done
