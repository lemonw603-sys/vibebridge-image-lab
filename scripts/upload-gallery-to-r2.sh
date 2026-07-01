#!/bin/bash
# Uploads every image in .gallery-images-cache/ to the vibebridge-gallery R2
# bucket, creating it first if necessary. Requires `wrangler login` to have
# been run at least once.
#
# Usage: bash scripts/upload-gallery-to-r2.sh
set -e

BUCKET="vibebridge-gallery"
CACHE_DIR=".gallery-images-cache"

if [ ! -d "$CACHE_DIR" ]; then
  echo "✗ $CACHE_DIR not found. Run scripts/download-gallery-images.mjs first."
  exit 1
fi

echo "→ Ensuring bucket '$BUCKET' exists..."
npx wrangler r2 bucket create "$BUCKET" 2>&1 | tail -3 || echo "  (bucket may already exist — continuing)"
echo ""

echo "→ Uploading images to R2..."
count=0
total=$(find "$CACHE_DIR" -maxdepth 1 -type f \( -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' -o -name '*.webp' -o -name '*.gif' \) | wc -l | tr -d ' ')
echo "  Total files: $total"
echo ""

for f in "$CACHE_DIR"/*.jpg "$CACHE_DIR"/*.jpeg "$CACHE_DIR"/*.png "$CACHE_DIR"/*.webp "$CACHE_DIR"/*.gif; do
  [ -e "$f" ] || continue
  key=$(basename "$f")
  count=$((count+1))
  printf "  [%d/%d] %s ... " "$count" "$total" "$key"
  if npx wrangler r2 object put "$BUCKET/$key" --file "$f" --remote > /dev/null 2>&1; then
    echo "ok"
  else
    echo "FAILED"
  fi
done

echo ""
echo "✓ Upload complete."
echo ""
echo "Next step — enable Public Access (r2.dev subdomain):"
echo "  Option A (dashboard): https://dash.cloudflare.com/ → R2 → $BUCKET → Settings → Public Access → Allow"
echo "  Option B (CLI, if supported by your wrangler version):"
echo "     npx wrangler r2 bucket dev-url enable $BUCKET"
echo ""
echo "Then paste the pub-<hash>.r2.dev URL back to Claude."
