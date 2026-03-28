'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import ArtworkGallery from '@/components/ArtworkGallery'

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleStartNewArtwork = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      localStorage.setItem('artwise-image', base64)
      router.push('/studio')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="min-h-screen relative z-10">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      <main
        className="
          pt-16 px-4 pb-8
          md:ml-[200px] md:px-6
          lg:ml-[260px] lg:px-8
        "
      >
        <section
          className="
          fade-in max-w-4xl mx-auto text-center
          flex flex-col justify-center
          min-h-[calc(100dvh-4rem)] pt-6 pb-10
          md:min-h-0 md:block md:justify-start
          md:pt-32 lg:pt-40 md:pb-0
        "
        >
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-brown-900 leading-tight text-balance mb-6">
            Your Canvas Guided by AI
          </h1>
          <p className="text-lg md:text-xl text-brown-500 leading-relaxed max-w-2xl mx-auto mb-10">
            Upload your artwork and let our AI companion help you perfect your palette,
            understand color theory, and master mixing techniques.
          </p>
          <button
            onClick={handleStartNewArtwork}
            className="btn-gold text-lg px-8 py-4 w-full md:w-auto"
          >
            Start New Artwork
          </button>
        </section>

        <ArtworkGallery className="max-w-5xl mx-auto mt-16 md:mt-20" />
      </main>
    </div>
  )
}
