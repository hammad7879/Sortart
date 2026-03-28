'use client'

import { useState, useEffect } from 'react'

interface Tutorial {
  title: string
  url: string
}

interface ColourPopupProps {
  hex: string
  name: string
  mix: string
  tutorials: Tutorial[]
  onClose: () => void
}

export default function ColourPopup({ hex, name, mix, tutorials, onClose }: ColourPopupProps) {
  const [copied, setCopied] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleCopyHex = async () => {
    try {
      await navigator.clipboard.writeText(hex)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Mobile: Bottom sheet
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        <div 
          className="overlay"
          onClick={onClose}
          aria-hidden="true"
        />
        
        {/* Bottom Sheet */}
        <div className="bottom-sheet" style={{ height: '85vh' }}>
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-brown-300 rounded-full" />
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-brown-100 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-brown-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="px-6 pb-8 overflow-y-auto" style={{ height: 'calc(100% - 48px)' }}>
            <PopupContent 
              hex={hex} 
              name={name} 
              mix={mix} 
              tutorials={tutorials}
              copied={copied}
              onCopyHex={handleCopyHex}
            />
          </div>
        </div>
      </>
    )
  }

  // Desktop/Tablet: Floating card
  return (
    <>
      {/* Overlay */}
      <div 
        className="overlay"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Floating Card */}
      <div 
        className="
          pop-in fixed z-50
          top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          lg:left-auto lg:right-[380px] lg:translate-x-0
          w-[90vw] max-w-md
          bg-beige rounded-xl
          border-[1.5px] border-gold
          shadow-2xl
          max-h-[80vh] overflow-hidden
        "
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-brown-100 transition-colors z-10"
          aria-label="Close"
        >
          <svg className="w-5 h-5 text-brown-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          <PopupContent 
            hex={hex} 
            name={name} 
            mix={mix} 
            tutorials={tutorials}
            copied={copied}
            onCopyHex={handleCopyHex}
          />
        </div>
      </div>
    </>
  )
}

interface PopupContentProps {
  hex: string
  name: string
  mix: string
  tutorials: Tutorial[]
  copied: boolean
  onCopyHex: () => void
}

function PopupContent({ hex, name, mix, tutorials, copied, onCopyHex }: PopupContentProps) {
  return (
    <div className="space-y-6">
      {/* Color Swatch */}
      <div className="flex flex-col items-center">
        <div 
          className="w-24 h-24 rounded-xl shadow-lg border border-brown-100"
          style={{ backgroundColor: hex }}
        />
        <h2 className="font-serif text-xl font-semibold text-brown-900 mt-4">
          {name}
        </h2>
        
        {/* Hex code with copy */}
        <button
          onClick={onCopyHex}
          className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-brown-100/50 hover:bg-brown-100 transition-colors"
        >
          <code className="font-mono text-sm text-brown-700">{hex}</code>
          {copied ? (
            <svg className="w-4 h-4 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-brown-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>

      {/* How to Mix */}
      <div>
        <h3 className="font-serif text-base font-semibold text-brown-900 mb-2">
          How to Mix This
        </h3>
        <p className="text-brown-700 leading-relaxed text-sm">
          {mix}
        </p>
      </div>

      {/* Tutorials */}
      {tutorials.length > 0 && (
        <div>
          <h3 className="font-serif text-base font-semibold text-brown-900 mb-3">
            Watch a Tutorial
          </h3>
          <div className="space-y-2">
            {tutorials.slice(0, 3).map((tutorial, index) => (
              <a
                key={index}
                href={tutorial.url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex items-center gap-3 p-3 rounded-lg
                  bg-white border border-brown-100
                  hover:border-brown-300 hover:shadow-sm
                  transition-all duration-200
                "
              >
                <div className="w-8 h-8 rounded-full bg-brown-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-brown-700" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
                <span className="text-sm text-brown-700 font-medium line-clamp-2">
                  {tutorial.title}
                </span>
                <svg className="w-4 h-4 text-brown-400 flex-shrink-0 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
