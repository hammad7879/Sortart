'use client'

import { useEffect, useState } from 'react'
import type { DemoArtwork } from '@/lib/artworkDemos'
import { INSPIRATION_ARTWORKS } from '@/lib/artworkDemos'
import { remoteImageToDataUrl } from '@/lib/remoteImageToDataUrl'

type View = 'pick' | 'inspire'

function InspirationPreview({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-brown-100 px-2 text-center">
        <span className="text-xs text-brown-500 leading-snug">Preview unavailable</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={title}
      className="w-full h-full object-cover"
      onError={() => setFailed(true)}
    />
  )
}

interface ReferenceSourceModalProps {
  open: boolean
  onClose: () => void
  /** Trigger the hidden file input; modal closes when this runs. */
  onChooseUpload: () => void
  onInspirationPicked: (dataUrl: string) => void
}

export default function ReferenceSourceModal({
  open,
  onClose,
  onChooseUpload,
  onInspirationPicked,
}: ReferenceSourceModalProps) {
  const [view, setView] = useState<View>('pick')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setView('pick')
      setLoadingId(null)
      setError(null)
    }
  }, [open])

  if (!open) return null

  const handleUpload = () => {
    onChooseUpload()
    onClose()
  }

  const handlePickInspiration = async (item: DemoArtwork) => {
    setLoadingId(item.id)
    setError(null)
    try {
      const dataUrl = await remoteImageToDataUrl(item.imageUrl)
      onInspirationPicked(dataUrl)
      onClose()
    } catch {
      setError('Could not load that image. Try another or upload your own.')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-brown-900/35 animate-in fade-in duration-200"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reference-source-title"
        className="
          fixed left-1/2 top-1/2 z-[70] w-[min(100vw-1.5rem,440px)] max-h-[min(90dvh,640px)]
          -translate-x-1/2 -translate-y-1/2
          flex flex-col rounded-2xl border-[1.5px] border-gold bg-beige
          shadow-[0_24px_60px_rgba(44,26,14,0.2)]
          animate-in fade-in zoom-in-95 duration-200 overflow-hidden
        "
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-4 py-4 border-b border-brown-100 shrink-0">
          <div className="flex justify-start min-w-0">
            {view === 'inspire' ? (
              <button
                type="button"
                onClick={() => {
                  setView('pick')
                  setError(null)
                }}
                className="
                  text-sm font-medium text-brown-700 hover:text-brown-900
                  flex items-center gap-1.5 min-h-[44px] px-2 rounded-lg hover:bg-brown-100/60
                "
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Back
              </button>
            ) : null}
          </div>
          <h2
            id="reference-source-title"
            className="font-serif text-lg font-semibold text-brown-900 text-center px-1"
          >
            {view === 'pick' ? 'Add reference' : 'Get inspired'}
          </h2>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="
                w-11 h-11 rounded-full flex items-center justify-center
                text-brown-600 hover:bg-brown-100 transition-colors
              "
              aria-label="Close"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto flex-1 min-h-0">
          {view === 'pick' ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-brown-600 text-center leading-relaxed mb-1">
                Upload your own piece or browse curated references to open on the canvas.
              </p>
              <button
                type="button"
                onClick={handleUpload}
                className="btn-gold w-full min-h-[48px] text-base justify-center"
              >
                Upload reference
              </button>
              <button
                type="button"
                onClick={() => setView('inspire')}
                className="
                  w-full min-h-[48px] text-base font-serif font-medium rounded-lg
                  border-[1.5px] border-brown-500 text-brown-800
                  bg-white/60 hover:bg-brown-100/80 transition-colors
                "
              >
                Get inspired
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-brown-600 text-center">
                Tap an image to open it on the main canvas — same as uploading a reference.
              </p>
              {error && (
                <p className="text-sm text-sienna text-center leading-snug" role="alert">
                  {error}
                </p>
              )}
              <ul className="grid grid-cols-2 gap-3">
                {INSPIRATION_ARTWORKS.map((item) => {
                  const busy = loadingId === item.id
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        disabled={busy || loadingId !== null}
                        onClick={() => handlePickInspiration(item)}
                        className="
                          group w-full text-left rounded-xl overflow-hidden
                          border border-brown-100 bg-white shadow-sm
                          hover:border-gold hover:shadow-md transition-all
                          disabled:opacity-60 disabled:pointer-events-none
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50
                        "
                      >
                        <div className="relative aspect-[4/3] bg-beige-dark">
                          <InspirationPreview src={item.imageUrl} title={item.title} />
                          {busy && (
                            <div className="absolute inset-0 bg-brown-900/40 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">Loading…</span>
                            </div>
                          )}
                        </div>
                        <p className="px-2 py-2 font-serif text-sm font-medium text-brown-900 truncate group-hover:text-brown-700">
                          {item.title}
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
