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

  const handlePick = (example: Example) => {
    setPrompt(example.prompt)
    focusPromptTextarea()
  }

  return (
    <div className="py-12 sm:py-16">
      <div className="text-center mb-8 sm:mb-10">
        <h2 className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-200">
          试试这些示例
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-gray-400 dark:text-gray-500">
          点击任意示例即可填入输入框，可继续编辑后再生成
        </p>
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
