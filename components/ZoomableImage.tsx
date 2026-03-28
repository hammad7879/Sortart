'use client'

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

interface ZoomableImageProps {
  imageUrl: string
}

export default function ZoomableImage({ imageUrl }: ZoomableImageProps) {
  return (
    <div className="relative w-full h-full bg-beige-dark rounded-lg overflow-hidden">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit
        wheel={{ step: 0.1 }}
        pinch={{ step: 5 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
              }}
              contentStyle={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Artwork being analyzed"
                className="max-w-full max-h-full object-contain"
                crossOrigin="anonymous"
              />
            </TransformComponent>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
              <button
                onClick={() => zoomIn()}
                className="
                  w-11 h-11 rounded-lg bg-white/90 backdrop-blur-sm
                  border border-brown-100 shadow-md
                  flex items-center justify-center
                  hover:bg-white transition-colors duration-200
                  text-brown-700
                "
                aria-label="Zoom in"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                  <path d="M11 8v6M8 11h6" />
                </svg>
              </button>
              
              <button
                onClick={() => zoomOut()}
                className="
                  w-11 h-11 rounded-lg bg-white/90 backdrop-blur-sm
                  border border-brown-100 shadow-md
                  flex items-center justify-center
                  hover:bg-white transition-colors duration-200
                  text-brown-700
                "
                aria-label="Zoom out"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                  <path d="M8 11h6" />
                </svg>
              </button>
              
              <button
                onClick={() => resetTransform()}
                className="
                  w-11 h-11 rounded-lg bg-white/90 backdrop-blur-sm
                  border border-brown-100 shadow-md
                  flex items-center justify-center
                  hover:bg-white transition-colors duration-200
                  text-brown-700
                "
                aria-label="Reset zoom"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  )
}
