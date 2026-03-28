'use client'

import { useAction } from 'convex/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/convex/_generated/api'
import { isConvexConfigured } from '@/components/ConvexClientProvider'
import { approximateColorName } from '@/lib/colorUtils'
import ReferenceSourceModal from '@/components/ReferenceSourceModal'

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)))
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((c) => c.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  )
}

/** CSS pixel size that fits `containerW×containerH` while preserving image aspect (full image visible). */
function fittedCanvasSize(
  containerW: number,
  containerH: number,
  imageW: number,
  imageH: number
): { cssW: number; cssH: number } {
  const ir = imageW / imageH
  const cr = containerW / containerH
  if (cr > ir) {
    const cssH = containerH
    const cssW = Math.min(containerW, Math.floor(cssH * ir))
    return { cssW: Math.max(1, cssW), cssH: Math.max(1, cssH) }
  }
  const cssW = containerW
  const cssH = Math.min(containerH, Math.floor(cssW / ir))
  return { cssW: Math.max(1, cssW), cssH: Math.max(1, cssH) }
}

export interface ArtworkWorkspaceProps {
  imageUrl: string | null
  onImageChange: (dataUrl: string) => void
}

export default function ArtworkWorkspace({
  imageUrl,
  onImageChange,
}: ArtworkWorkspaceProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [popup, setPopup] = useState<{
    clientX: number
    clientY: number
    hex: string
  } | null>(null)
  const [mixText, setMixText] = useState<string | null>(null)
  const [tutorials, setTutorials] = useState<{ title: string; url: string }[]>(
    []
  )
  const [mixLoading, setMixLoading] = useState(false)
  const [tutorialsLoading, setTutorialsLoading] = useState(false)
  const [mixError, setMixError] = useState<string | null>(null)
  const [tutorialsError, setTutorialsError] = useState<string | null>(null)
  const [sourceModalOpen, setSourceModalOpen] = useState(false)

  const getColorMix = useAction(api.ai.getColorMix)
  const getTutorials = useAction(api.tutorials.getTutorials)

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    const img = imageRef.current
    if (!canvas || !container || !img?.complete || !img.naturalWidth) return

    const rect = container.getBoundingClientRect()
    const cw = Math.max(1, Math.floor(rect.width))
    const ch = Math.max(1, Math.floor(rect.height))
    const { cssW, cssH } = fittedCanvasSize(
      cw,
      ch,
      img.naturalWidth,
      img.naturalHeight
    )

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    canvas.width = Math.floor(cssW * dpr)
    canvas.height = Math.floor(cssH * dpr)
    canvas.style.width = `${cssW}px`
    canvas.style.height = `${cssH}px`

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.drawImage(img, 0, 0, cssW, cssH)
  }, [])

  useEffect(() => {
    if (!imageUrl) {
      imageRef.current = null
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageRef.current = img
      redraw()
    }
    img.src = imageUrl
  }, [imageUrl, redraw])

  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => redraw())
    ro.observe(el)
    return () => ro.disconnect()
  }, [redraw])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const data = ev.target?.result
      if (typeof data === 'string') onImageChange(data)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !imageRef.current) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const bx = Math.floor((e.clientX - rect.left) * scaleX)
    const by = Math.floor((e.clientY - rect.top) * scaleY)

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const data = ctx.getImageData(bx, by, 1, 1).data
    const hex = rgbToHex(data[0], data[1], data[2])

    setPopup({ clientX: e.clientX, clientY: e.clientY, hex })
    setMixText(null)
    setTutorials([])
    setMixError(null)
    setTutorialsError(null)
  }

  const closePopup = () => {
    setPopup(null)
    setMixText(null)
    setTutorials([])
    setMixError(null)
    setTutorialsError(null)
  }

  const handleMixColor = async () => {
    if (!popup || !isConvexConfigured()) {
      setMixError(
        'Convex is not configured. Set NEXT_PUBLIC_CONVEX_URL and deploy your backend.'
      )
      return
    }
    setMixLoading(true)
    setMixError(null)
    try {
      const text = await getColorMix({ hex: popup.hex })
      setMixText(text)
    } catch (err) {
      setMixError(err instanceof Error ? err.message : 'Could not get mix advice.')
    } finally {
      setMixLoading(false)
    }
  }

  const handleViewTutorials = async () => {
    if (!popup || !isConvexConfigured()) {
      setTutorialsError(
        'Convex is not configured. Set NEXT_PUBLIC_CONVEX_URL and deploy your backend.'
      )
      return
    }
    setTutorialsLoading(true)
    setTutorialsError(null)
    try {
      const list = await getTutorials({
        query: `how to mix and paint color ${popup.hex}`,
      })
      setTutorials(list.filter((t) => t.url))
    } catch (err) {
      setTutorialsError(
        err instanceof Error ? err.message : 'Could not load tutorials.'
      )
    } finally {
      setTutorialsLoading(false)
    }
  }

  const popupStyle = (): React.CSSProperties => {
    if (!popup) return {}
    const panelW = 300
    const margin = 12
    let left = popup.clientX + 10
    let top = popup.clientY + 10
    if (typeof window !== 'undefined') {
      if (left + panelW > window.innerWidth - margin) {
        left = window.innerWidth - panelW - margin
      }
      if (left < margin) left = margin
      if (top + 420 > window.innerHeight - margin) {
        top = window.innerHeight - 420 - margin
      }
      if (top < margin) top = margin
    }
    return { left, top, width: panelW }
  }

  return (
    <div className="flex flex-col h-full min-h-0 gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      <ReferenceSourceModal
        open={sourceModalOpen}
        onClose={() => setSourceModalOpen(false)}
        onChooseUpload={() => fileInputRef.current?.click()}
        onInspirationPicked={(dataUrl) => onImageChange(dataUrl)}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSourceModalOpen(true)}
          className="btn-gold min-h-[44px] px-5 text-sm transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          {imageUrl ? 'Replace image' : 'Upload image'}
        </button>
        {imageUrl && (
          <p className="text-sm text-brown-600 animate-in fade-in duration-300">
            Click the canvas to sample a color.
          </p>
        )}
      </div>

      <div
        ref={containerRef}
        className="
          relative flex flex-1 min-h-[280px] min-w-0 items-center justify-center
          rounded-xl overflow-auto
          bg-beige-dark border border-brown-100
          shadow-[0_8px_30px_rgba(44,26,14,0.08)]
        "
      >
        {imageUrl ? (
          <canvas
            ref={canvasRef}
            className="block max-w-full max-h-full cursor-crosshair touch-none rounded-sm shadow-sm"
            onClick={handleCanvasClick}
            role="img"
            aria-label="Reference artwork — click to pick a color"
          />
        ) : (
          <button
            type="button"
            onClick={() => setSourceModalOpen(true)}
            className="
              absolute inset-0 flex flex-col items-center justify-center gap-4 p-8
              text-brown-500 hover:text-brown-700 transition-colors duration-300
            "
          >
            <div
              className="
                w-20 h-20 rounded-2xl border-2 border-dashed border-brown-300
                flex items-center justify-center bg-white/40
                shadow-inner transition-all duration-300 hover:border-gold hover:shadow-md
              "
            >
              <svg
                className="w-10 h-10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <span className="font-serif text-lg text-brown-700 text-center max-w-xs">
              Add a reference — upload your own or get inspired
            </span>
          </button>
        )}
      </div>

      {popup && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-brown-900/20 animate-in fade-in duration-200"
            aria-label="Close color tools"
            onClick={closePopup}
          />
          <div
            className="
              fixed z-50 animate-in fade-in zoom-in-95 duration-200
              rounded-xl border-[1.5px] border-gold bg-beige
              shadow-[0_20px_50px_rgba(44,26,14,0.18)]
              p-4 flex flex-col gap-4 max-h-[min(85vh,520px)] overflow-y-auto
            "
            style={popupStyle()}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-lg border border-brown-100 shadow-md shrink-0"
                  style={{ backgroundColor: popup.hex }}
                />
                <div className="min-w-0 text-left">
                  <p className="text-xs uppercase tracking-wide text-muted">
                    Sampled
                  </p>
                  <p className="font-serif text-lg font-semibold text-brown-900 leading-snug mt-0.5 truncate">
                    {approximateColorName(popup.hex)}
                  </p>
                  <code className="font-mono text-sm font-medium text-brown-700 mt-1 block">
                    {popup.hex}
                  </code>
                </div>
              </div>
              <button
                type="button"
                onClick={closePopup}
                className="
                  w-9 h-9 rounded-full flex items-center justify-center shrink-0
                  text-brown-600 hover:bg-brown-100 transition-colors duration-200
                "
                aria-label="Close"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleMixColor}
                disabled={mixLoading}
                className="
                  btn-gold w-full min-h-[44px] text-sm
                  disabled:opacity-60 transition-all duration-200
                  hover:brightness-105
                "
              >
                {mixLoading ? 'Mixing…' : 'Mix Color'}
              </button>
              <button
                type="button"
                onClick={handleViewTutorials}
                disabled={tutorialsLoading}
                className="
                  w-full min-h-[44px] text-sm font-serif font-medium rounded-lg
                  text-white transition-all duration-200 hover:brightness-105
                  disabled:opacity-60
                  bg-gradient-to-r from-brown-700 via-brown-500 to-brown-700
                  shadow-md hover:shadow-lg
                "
              >
                {tutorialsLoading ? 'Searching…' : 'View Tutorials'}
              </button>
            </div>

            {(mixError || tutorialsError) && (
              <p className="text-sm text-sienna leading-snug">{mixError || tutorialsError}</p>
            )}

            {mixText && (
              <div
                className="
                  rounded-lg border border-brown-100 bg-white/80 p-3
                  animate-in fade-in slide-in-from-top-2 duration-300
                "
              >
                <h4 className="font-serif text-sm font-semibold text-brown-900 mb-1.5">
                  Mix guidance
                </h4>
                <p className="text-sm text-brown-700 leading-relaxed whitespace-pre-wrap">
                  {mixText}
                </p>
              </div>
            )}

            {tutorials.length > 0 && (
              <div className="animate-in fade-in duration-300 space-y-2">
                <h4 className="font-serif text-sm font-semibold text-brown-900">
                  Tutorials
                </h4>
                <ul className="space-y-2">
                  {tutorials.map((t, i) => (
                    <li key={`${t.url}-${i}`}>
                      <a
                        href={t.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          flex items-center gap-2 p-2.5 rounded-lg
                          bg-white border border-brown-100 text-sm text-brown-800
                          hover:border-brown-300 hover:shadow-sm
                          transition-all duration-200
                        "
                      >
                        <span className="line-clamp-2 font-medium">{t.title}</span>
                        <svg
                          className="w-4 h-4 shrink-0 text-gold ml-auto"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
