#!/usr/bin/env node
/**
 * Rewrites the `images` URLs in public/data/gallery.json from the upstream
 * hotlink (cms-assets.youmind.com) to your own R2 pub URL.
 *
 * Usage:
 *   node scripts/rewrite-gallery-urls.mjs https://pub-abcdef.r2.dev
 *
 * The manifest at .gallery-images-cache/manifest.json (produced by
 * download-gallery-images.mjs) maps original URLs → local filenames, which
 * are also the R2 object keys after upload.
 */

import { readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const GALLERY_JSON = resolve(REPO_ROOT, 'public/data/gallery.json')
const GALLERY_BACKUP = resolve(REPO_ROOT, 'public/data/gallery.original.json')
const MANIFEST_PATH = resolve(REPO_ROOT, '.gallery-images-cache/manifest.json')

const pubUrlArg = process.argv[2]
if (!pubUrlArg) {
  console.error('Usage: node scripts/rewrite-gallery-urls.mjs <r2-pub-url>')
  console.error('  Example: node scripts/rewrite-gallery-urls.mjs https://pub-abcdef.r2.dev')
  process.exit(1)
}
const pubBase = pubUrlArg.replace(/\/+$/, '')

const galleryRaw = await readFile(GALLERY_JSON, 'utf-8')
const gallery = JSON.parse(galleryRaw)
const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf-8'))

let rewritten = 0
let missing = 0
const missingUrls = []

for (const p of gallery.prompts ?? []) {
  if (!Array.isArray(p.images)) continue
  p.images = p.images.map((url) => {
    const key = manifest[url]
    if (!key) {
      missing++
      missingUrls.push(url)
      return url
    }
    rewritten++
    return `${pubBase}/${key}`
  })
}

gallery.imageHost = pubBase
gallery.imageHostNote = `Images self-hosted on R2 as of ${new Date().toISOString()}`

await writeFile(GALLERY_BACKUP, galleryRaw, 'utf-8')
await writeFile(GALLERY_JSON, JSON.stringify(gallery, null, 2), 'utf-8')

console.log(`✓ Rewrote ${rewritten} URLs → ${pubBase}/…`)
console.log(`✓ Backup saved: ${GALLERY_BACKUP}`)
if (missing > 0) {
  console.log(`! ${missing} URL(s) were not in the manifest and were left unchanged:`)
  for (const u of missingUrls.slice(0, 5)) console.log(`    ${u}`)
  if (missingUrls.length > 5) console.log(`    ... and ${missingUrls.length - 5} more`)
}
