#!/usr/bin/env node
/**
 * Fetches the awesome-gpt-image-2 README, parses every prompt entry,
 * and writes a structured JSON file we can later curate from.
 *
 * Source repo: https://github.com/YouMind-OpenLab/awesome-gpt-image-2
 * License: CC BY 4.0 (per the upstream README)
 *
 * Usage:
 *   node scripts/sync-prompt-candidates.mjs
 *   node scripts/sync-prompt-candidates.mjs --lang zh
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const lang = (() => {
  const i = args.indexOf('--lang')
  if (i >= 0 && args[i + 1]) return args[i + 1]
  return 'en'
})()

const README_PATHS = {
  en: 'README.md',
  zh: 'README_zh.md',
  'zh-TW': 'README_zh-TW.md',
  ja: 'README_ja-JP.md',
  ko: 'README_ko-KR.md',
}

const READMES_BASE = 'https://raw.githubusercontent.com/YouMind-OpenLab/awesome-gpt-image-2/main'
const readmePath = README_PATHS[lang]
if (!readmePath) {
  console.error(`Unknown --lang ${lang}. Supported: ${Object.keys(README_PATHS).join(', ')}`)
  process.exit(1)
}

const url = `${READMES_BASE}/${readmePath}`
console.log(`→ Fetching ${url}`)

const resp = await fetch(url)
if (!resp.ok) {
  console.error(`Fetch failed: ${resp.status} ${resp.statusText}`)
  process.exit(1)
}
const text = await resp.text()
console.log(`✓ Got ${text.length} chars`)

const promptHeading = /^### No\. (\d+): (.+?)(?:\r?\n|$)/gm
const headings = [...text.matchAll(promptHeading)]
console.log(`✓ Found ${headings.length} prompt entries`)

const entries = []

for (let i = 0; i < headings.length; i++) {
  const match = headings[i]
  const startIdx = match.index
  const endIdx = i + 1 < headings.length ? headings[i + 1].index : text.length
  const block = text.slice(startIdx, endIdx)

  const number = Number(match[1])
  const headingTitle = match[2].trim()

  let category = ''
  let title = headingTitle
  const splitIdx = headingTitle.indexOf(' - ')
  if (splitIdx > 0) {
    category = headingTitle.slice(0, splitIdx).trim()
    title = headingTitle.slice(splitIdx + 3).trim()
  }

  const descMatch = block.match(/####\s*[^\n]*Description[^\n]*\n+([\s\S]*?)(?=\n####|\n---|\n$)/)
  const description = descMatch ? descMatch[1].trim() : ''

  const promptMatch = block.match(/####\s*[^\n]*Prompt[^\n]*\n+```[a-zA-Z]*\n?([\s\S]*?)```/)
  const prompt = promptMatch ? promptMatch[1].trim() : ''

  const imageRegex = /<img\s+src="([^"]+)"/g
  const images = [...block.matchAll(imageRegex)].map((m) => m[1]).filter((u) => !u.endsWith('.svg'))

  const langTagMatch = block.match(/Language-([A-Z]{2,3})/)
  const langTag = langTagMatch ? langTagMatch[1].toLowerCase() : null

  const authorMatch = block.match(/\*\*Author:\*\*\s*\[([^\]]+)\]\(([^)]+)\)/)
  const sourceMatch = block.match(/\*\*Source:\*\*\s*\[([^\]]+)\]\(([^)]+)\)/)
  const publishedMatch = block.match(/\*\*Published:\*\*\s*([^\n]+)/)

  if (!prompt) {
    console.warn(`! No. ${number} "${title}" has no prompt block, skipping`)
    continue
  }

  entries.push({
    id: `ag2-${String(number).padStart(4, '0')}`,
    upstreamNumber: number,
    category,
    title,
    description,
    prompt,
    language: langTag,
    images,
    author: authorMatch ? { name: authorMatch[1], url: authorMatch[2] } : null,
    sourcePost: sourceMatch ? { label: sourceMatch[1], url: sourceMatch[2] } : null,
    publishedAt: publishedMatch ? publishedMatch[1].trim() : null,
  })
}

const output = {
  source: 'awesome-gpt-image-2',
  sourceUrl: 'https://github.com/YouMind-OpenLab/awesome-gpt-image-2',
  sourceReadme: url,
  license: 'CC BY 4.0',
  licenseNotice:
    'Prompts are collected from the community by the upstream maintainer for educational purposes. Always credit the original author and link to the source post when redistributing.',
  fetchedAt: new Date().toISOString(),
  language: lang,
  totalEntries: entries.length,
  prompts: entries,
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const fileName = lang === 'en' ? 'gallery.json' : `gallery.${lang}.json`
const outPath = resolve(__dirname, '..', 'public', 'data', fileName)
await mkdir(dirname(outPath), { recursive: true })
await writeFile(outPath, JSON.stringify(output, null, 2), 'utf-8')
console.log(`✓ Wrote ${entries.length} entries → ${outPath}`)
