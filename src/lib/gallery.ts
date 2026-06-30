export type GalleryAuthor = { name: string; url: string }
export type GallerySource = { label: string; url: string }

export type GalleryPrompt = {
  id: string
  upstreamNumber: number
  category: string
  title: string
  description: string
  prompt: string
  language: string | null
  images: string[]
  author: GalleryAuthor | null
  sourcePost: GallerySource | null
  publishedAt: string | null
}

export type GalleryData = {
  source: string
  sourceUrl: string
  sourceReadme: string
  license: string
  licenseNotice: string
  fetchedAt: string
  language: string
  totalEntries: number
  prompts: GalleryPrompt[]
}

export const CATEGORY_LABELS: Record<string, string> = {
  '': '精选',
  'Profile / Avatar': '头像 · 人物',
  'YouTube Thumbnail': '视频封面',
  'Infographic / Edu Visual': '信息图 · 知识',
  'Comic / Storyboard': '漫画 · 分镜',
  'Social Media Post': '社媒图文',
  'Product Marketing': '产品营销',
  'E-commerce Main Image': '电商主图',
  'Game Asset': '游戏素材',
}

const ARGUMENT_PATTERN = /\{argument\s+name="[^"]*"\s+default="([^"]*)"\}/g
const MJ_PARAM_PATTERN = /\s+--(?:ar|v|stylize|q|chaos|s|niji|style)\s+\S+/g

export function cleanPromptText(raw: string): string {
  return raw.replace(ARGUMENT_PATTERN, (_, def) => def).replace(MJ_PARAM_PATTERN, '').trim()
}

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category
}

let cache: Promise<GalleryData> | null = null

export function loadGallery(): Promise<GalleryData> {
  if (!cache) {
    cache = fetch('/data/gallery.json', { cache: 'force-cache' }).then((r) => {
      if (!r.ok) throw new Error(`Failed to load gallery: ${r.status}`)
      return r.json() as Promise<GalleryData>
    })
  }
  return cache
}
