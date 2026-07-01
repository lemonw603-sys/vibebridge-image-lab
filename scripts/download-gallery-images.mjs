#!/usr/bin/env node
/**
 * Downloads every image referenced by public/data/gallery.json into a local
 * cache directory. Later steps (upload to R2, rewrite gallery.json) read this
 * cache — the download itself is the network-heavy part, so we run it once and
 * keep the results around.
 *
 * Output:
 *   .gallery-images-cache/
 *     ag2-0001-0.jpg
 *     ag2-0002-0.jpg
 *     ...
 *   .gallery-images-cache/manifest.json   { <originalUrl>: <localFilename> }
 */

import { mkdir, writeFile, readFile, access, stat } from 'node:fs/promises'
import { extname, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const GALLERY_JSON = resolve(REPO_ROOT, 'public/data/gallery.json')
const CACHE_DIR = resolve(REPO_ROOT, '.gallery-images-cache')
const MANIFEST_PATH = resolve(CACHE_DIR, 'manifest.json')

const CONCURRENCY = 8

function safeExtFromUrl(url) {
  try {
    const u = new URL(url)
    const ext = extname(u.pathname).toLowerCase()
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) return ext
    return '.jpg'
  } catch {
    return '.jpg'
  }
}

async function fileExists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function downloadOne(url, targetPath) {
  if (await fileExists(targetPath)) {
    const st = await stat(targetPath)
    if (st.size > 0) return { skipped: true, size: st.size }
  }
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0)',
      Accept: 'image/*,*/*;q=0.8',
    },
  })
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`)
  const buf = Buffer.from(await resp.arrayBuffer())
  if (buf.length < 200) throw new Error(`Too small (${buf.length} bytes) for ${url}`)
  await writeFile(targetPath, buf)
  return { skipped: false, size: buf.length }
}

async function main() {
  const raw = await readFile(GALLERY_JSON, 'utf-8')
  const gallery = JSON.parse(raw)
  const prompts = gallery.prompts ?? []

  await mkdir(CACHE_DIR, { recursive: true })

  const tasks = []
  for (const p of prompts) {
    const images = Array.isArray(p.images) ? p.images : []
    images.forEach((url, i) => {
      const ext = safeExtFromUrl(url)
      const key = `${p.id}-${i}${ext}`
      tasks.push({ url, key, target: resolve(CACHE_DIR, key) })
    })
  }
  console.log(`→ ${tasks.length} image(s) to fetch`)

  const manifest = {}
  let done = 0
  let failed = 0
  let skipped = 0
  let bytes = 0

  const queue = tasks.slice()
  async function worker() {
    while (queue.length) {
      const task = queue.shift()
      if (!task) return
      try {
        const r = await downloadOne(task.url, task.target)
        manifest[task.url] = task.key
        if (r.skipped) skipped++
        else bytes += r.size
        done++
        if (done % 10 === 0 || done === tasks.length) {
          console.log(`  ${done}/${tasks.length} (${skipped} skipped, ${failed} failed)`)
        }
      } catch (err) {
        console.warn(`! ${task.url}\n  ${err.message}`)
        failed++
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8')

  console.log('')
  console.log(`✓ Downloaded: ${done - skipped}`)
  console.log(`✓ Cached (already present): ${skipped}`)
  console.log(`✗ Failed: ${failed}`)
  console.log(`✓ Total bytes written this run: ${(bytes / 1024 / 1024).toFixed(2)} MiB`)
  console.log(`✓ Manifest: ${MANIFEST_PATH}`)
  if (failed > 0) process.exitCode = 1
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
