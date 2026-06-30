import { useStore } from '../store'

type Example = {
  label: string
  prompt: string
}

const EXAMPLES: Example[] = [
  {
    label: '人像 · 自然光',
    prompt:
      'Cinematic portrait of a young woman by a rainy window, soft natural light, shallow depth of field, 35mm film grain',
  },
  {
    label: '风景 · 氛围',
    prompt:
      'Misty pine forest at dawn, golden light filtering through fog, painterly mood, wide shot',
  },
  {
    label: '静物 · 编辑感',
    prompt:
      'A minimalist ceramic coffee cup on linen, morning side light, editorial product photography',
  },
  {
    label: '中国风 · 水墨',
    prompt: '水墨风格的江南庭院，远山若隐，细雨润湿青瓦，大面积留白构图',
  },
  {
    label: '平面 · 图标',
    prompt:
      'Flat geometric vector icon of a fox, two-tone palette on cream background, minimal clean lines',
  },
  {
    label: '插画 · 复古印刷',
    prompt:
      'Abstract risograph print, overlapping organic shapes, muted earth tones, grainy paper texture',
  },
]

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

export default function EmptyStateExamples() {
  const setPrompt = useStore((s) => s.setPrompt)
  const setShowPromptGallery = useStore((s) => s.setShowPromptGallery)

  const handlePick = (example: Example) => {
    setPrompt(example.prompt)
    focusPromptTextarea()
  }

  return (
    <div className="py-10 sm:py-14">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-200">
          从案例开始，再调整成你的风格
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-gray-400 dark:text-gray-500">
          浏览完整案例库找灵感，或直接点下方任意示例填入输入框
        </p>
      </div>

      <button
        type="button"
        onClick={() => setShowPromptGallery(true)}
        className="group block w-full mb-6 sm:mb-8 rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-gradient-to-br from-white via-white to-gray-50 dark:from-white/[0.06] dark:via-white/[0.04] dark:to-white/[0.02] hover:border-gray-300 dark:hover:border-white/20 hover:shadow-md transition-all px-5 py-4 sm:px-6 sm:py-5 text-left"
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 grid grid-cols-2 gap-1 w-12 h-12 sm:w-14 sm:h-14">
            <div className="rounded-md bg-gray-200 dark:bg-white/10" />
            <div className="rounded-md bg-gray-300 dark:bg-white/15" />
            <div className="rounded-md bg-gray-300 dark:bg-white/15" />
            <div className="rounded-md bg-gray-200 dark:bg-white/10" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-800 dark:text-gray-100">
              <span>浏览案例库</span>
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
            <div className="mt-0.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              126 条精选 prompt + 预览图 · 头像 / 视频封面 / 信息图 / 漫画 / 营销
            </div>
          </div>
        </div>
      </button>

      <div className="text-center mb-3 sm:mb-4 text-xs text-gray-400 dark:text-gray-500">
        或试试这些快速示例
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {EXAMPLES.map((example) => (
          <button
            key={example.label}
            type="button"
            onClick={() => handlePick(example)}
            className="group text-left rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50/80 dark:hover:bg-white/[0.06] transition-colors px-4 py-3.5 sm:px-5 sm:py-4"
          >
            <div className="text-[11px] sm:text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
              {example.label}
            </div>
            <div className="text-[13px] sm:text-sm leading-relaxed text-gray-700 dark:text-gray-200 line-clamp-3">
              {example.prompt}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
