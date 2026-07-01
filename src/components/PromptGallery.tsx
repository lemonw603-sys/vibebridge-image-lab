import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store'
import {
  cleanPromptText,
  getCategoryLabel,
  loadGallery,
  loadHiddenIds,
  saveHiddenIds,
  type GalleryData,
  type GalleryPrompt,
} from '../lib/gallery'

type Props = {
  open: boolean
  onClose: () => void
}

function focusPromptTextarea() {
  if (typeof window === 'undefined') return
  window.requestAnimationFrame(() => {
    const el = document.querySelector<HTMLElement>('[data-prompt-textarea]')
    if (!el) return
    el.focus()
    const range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(false)
    const sel = window.getSelection()
    if (sel) {
      sel.removeAllRanges()
      sel.addRange(range)
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  })
}

export default function PromptGallery({ open, onClose }: Props) {
  const setPrompt = useStore((s) => s.setPrompt)
  const [data, setData] = useState<GalleryData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState<GalleryPrompt | null>(null)
  const [copied, setCopied] = useState(false)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => loadHiddenIds())
  const [showHidden, setShowHidden] = useState(false)

  const persistHidden = (next: Set<string>) => {
    setHiddenIds(next)
    saveHiddenIds(next)
  }
  const hideEntry = (id: string) => {
    const next = new Set(hiddenIds)
    next.add(id)
    persistHidden(next)
  }
  const restoreEntry = (id: string) => {
    const next = new Set(hiddenIds)
    next.delete(id)
    persistHidden(next)
  }

  useEffect(() => {
    if (!open || data) return
    loadGallery().then(setData).catch((e) => setError(String(e)))
  }, [open, data])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (detail) setDetail(null)
        else onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, detail, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const categories = useMemo(() => {
    if (!data) return [] as { key: string; label: string; count: number }[]
    const counts = new Map<string, number>()
    for (const p of data.prompts) {
      counts.set(p.category, (counts.get(p.category) || 0) + 1)
    }
    const arr = [...counts.entries()].map(([key, count]) => ({
      key,
      label: getCategoryLabel(key),
      count,
    }))
    arr.sort((a, b) => b.count - a.count)
    return arr
  }, [data])

  const filtered = useMemo(() => {
    if (!data) return []
    const q = search.trim().toLowerCase()
    return data.prompts.filter((p) => {
      const isHidden = hiddenIds.has(p.id)
      if (showHidden ? !isHidden : isHidden) return false
      if (activeCategory !== 'all' && p.category !== activeCategory) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        p.prompt.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        getCategoryLabel(p.category).toLowerCase().includes(q)
      )
    })
  }, [data, activeCategory, search, hiddenIds, showHidden])

  const handleUsePrompt = (entry: GalleryPrompt) => {
    setPrompt(cleanPromptText(entry.prompt))
    setDetail(null)
    onClose()
    focusPromptTextarea()
  }

  const handleCopyPrompt = async (entry: GalleryPrompt) => {
    try {
      await navigator.clipboard.writeText(cleanPromptText(entry.prompt))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur-xl">
      <div className="flex-shrink-0 border-b border-gray-200/70 dark:border-white/[0.06] bg-white/60 dark:bg-gray-900/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <h2 className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">案例库</h2>
            <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline whitespace-nowrap">
              {data ? `${data.totalEntries} 条精选 · 来自 awesome-gpt-image-2` : '加载中...'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden ml-auto p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-white/[0.06] transition-colors"
              aria-label="关闭案例库"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="hidden sm:block flex-1" />
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索风格、主题、关键词..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200/70 dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.03] focus:outline-none focus:ring-1 focus:ring-blue-300/40 dark:focus:ring-blue-500/30 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16 10a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hidden sm:inline-flex p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-white/[0.06] transition-colors"
            aria-label="关闭案例库"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {data && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-3 flex gap-2 overflow-x-auto custom-scrollbar">
            {hiddenIds.size > 0 && (
              <button
                type="button"
                onClick={() => setShowHidden((v) => !v)}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${
                  showHidden
                    ? 'bg-amber-500 text-white'
                    : 'bg-white/70 dark:bg-white/[0.04] text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.08] border border-dashed border-gray-300 dark:border-white/[0.12]'
                }`}
                title={showHidden ? '退出隐藏视图' : '查看已隐藏的案例'}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                <span>{showHidden ? '退出隐藏' : '已隐藏'}</span>
                <span className={`text-[10px] ${showHidden ? 'opacity-70' : 'opacity-50'}`}>{hiddenIds.size}</span>
              </button>
            )}
            <CategoryChip
              active={activeCategory === 'all'}
              label="全部"
              count={data.totalEntries - (showHidden ? 0 : hiddenIds.size)}
              onClick={() => setActiveCategory('all')}
            />
            {categories.map((cat) => (
              <CategoryChip
                key={cat.key || 'featured'}
                active={activeCategory === cat.key}
                label={cat.label}
                count={cat.count}
                onClick={() => setActiveCategory(cat.key)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {error && (
            <div className="text-center py-20 text-sm text-red-500">加载失败：{error}</div>
          )}
          {!error && !data && (
            <div className="text-center py-20 text-sm text-gray-400">正在加载案例库...</div>
          )}
          {data && filtered.length === 0 && (
            <div className="text-center py-20 text-sm text-gray-400">
              {showHidden ? '没有已隐藏的案例' : '没有匹配的案例'}
            </div>
          )}
          {data && filtered.length > 0 && (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4 [column-fill:_balance]">
              {filtered.map((entry) => (
                <GalleryCard
                  key={entry.id}
                  entry={entry}
                  hidden={showHidden}
                  onOpen={() => setDetail(entry)}
                  onHide={() => hideEntry(entry.id)}
                  onRestore={() => restoreEntry(entry.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {detail && (
        <DetailOverlay
          entry={detail}
          copied={copied}
          onClose={() => setDetail(null)}
          onUse={() => handleUsePrompt(detail)}
          onCopy={() => handleCopyPrompt(detail)}
        />
      )}
    </div>
  )
}

function CategoryChip({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean
  label: string
  count: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${
        active
          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
          : 'bg-white/70 dark:bg-white/[0.04] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.08] border border-gray-200/70 dark:border-white/[0.06]'
      }`}
    >
      <span>{label}</span>
      <span className={`text-[10px] ${active ? 'opacity-70' : 'opacity-50'}`}>{count}</span>
    </button>
  )
}

function GalleryCard({
  entry,
  hidden,
  onOpen,
  onHide,
  onRestore,
}: {
  entry: GalleryPrompt
  hidden: boolean
  onOpen: () => void
  onHide: () => void
  onRestore: () => void
}) {
  const img = entry.images[0]
  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hidden) onRestore()
    else onHide()
  }
  return (
    <div
      className={`group relative mb-3 sm:mb-4 block w-full overflow-hidden rounded-xl border border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] text-left transition-all hover:shadow-md hover:-translate-y-0.5 ${
        hidden ? 'opacity-60' : ''
      }`}
    >
      <button
        type="button"
        onClick={handleAction}
        title={hidden ? '恢复显示' : '不再显示这张'}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 dark:bg-gray-900/90 text-gray-500 hover:text-gray-800 dark:hover:text-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {hidden ? (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left"
      >
        {img ? (
          <img
            src={img}
            alt={entry.title}
            loading="lazy"
            className="w-full h-auto block"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="aspect-square bg-gray-100 dark:bg-white/[0.04]" />
        )}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="text-[10px] uppercase tracking-wide text-white/70 mb-0.5">
            {getCategoryLabel(entry.category)}
          </div>
          <div className="text-xs sm:text-sm font-medium text-white line-clamp-2">{entry.title}</div>
        </div>
      </button>
    </div>
  )
}

function DetailOverlay({
  entry,
  copied,
  onClose,
  onUse,
  onCopy,
}: {
  entry: GalleryPrompt
  copied: boolean
  onClose: () => void
  onUse: () => void
  onCopy: () => void
}) {
  const cleaned = cleanPromptText(entry.prompt)
  const img = entry.images[0]
  return (
    <div className="fixed inset-0 z-60 flex items-stretch sm:items-center justify-center p-0 sm:p-6 bg-black/70 backdrop-blur-sm">
      <div
        className="relative flex flex-col sm:flex-row w-full sm:max-w-5xl h-full sm:h-[80vh] bg-white dark:bg-gray-900 sm:rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur text-gray-600 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 transition-colors"
          aria-label="关闭详情"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="sm:w-1/2 flex-shrink-0 bg-gray-100 dark:bg-black flex items-center justify-center overflow-auto">
          {img && (
            <img
              src={img}
              alt={entry.title}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-full sm:max-h-[80vh] object-contain"
            />
          )}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            <div className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
              {getCategoryLabel(entry.category)}
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-gray-800 dark:text-gray-100 mb-3">{entry.title}</h3>
            {entry.description && (
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 mb-4">{entry.description}</p>
            )}

            <div className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
              Prompt
            </div>
            <pre className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words bg-gray-50 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] rounded-xl px-3 py-3 max-h-72 overflow-y-auto text-gray-700 dark:text-gray-200 font-mono">
              {cleaned}
            </pre>

            <div className="mt-4 text-xs text-gray-400 dark:text-gray-500 space-y-1">
              {entry.author && (
                <div>
                  原作者：
                  <a
                    href={entry.author.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 dark:text-gray-300 hover:underline"
                  >
                    {entry.author.name}
                  </a>
                </div>
              )}
              {entry.sourcePost && (
                <div>
                  来源：
                  <a
                    href={entry.sourcePost.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 dark:text-gray-300 hover:underline"
                  >
                    {entry.sourcePost.label}
                  </a>
                </div>
              )}
              {entry.publishedAt && <div>发布：{entry.publishedAt}</div>}
              <div>许可：CC BY 4.0 · 来自 awesome-gpt-image-2</div>
            </div>
          </div>

          <div className="flex-shrink-0 px-5 py-3 sm:px-6 sm:py-4 border-t border-gray-200/70 dark:border-white/[0.06] flex gap-2">
            <button
              type="button"
              onClick={onCopy}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied ? '已复制' : '复制 Prompt'}
            </button>
            <button
              type="button"
              onClick={onUse}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              使用这个 Prompt
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
