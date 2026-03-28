'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import ArtworkGallery from '@/components/ArtworkGallery'

export default function ArtworksPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const goNew = () => {
    fileInputRef.current?.click()
  }

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      localStorage.setItem('artwise-image', reader.result as string)
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
        onChange={onFile}
      />

      <main
        className="
          pt-16 px-4 pb-12
          md:ml-[200px] md:px-6
          lg:ml-[260px] lg:px-8
        "
      >
        <div className="max-w-5xl mx-auto pt-8 md:pt-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-2">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-brown-900">
                My Artworks
              </h1>
              <p className="text-brown-500 mt-2 max-w-xl">
                Pieces you saved from the studio appear first. Demo tiles are inspiration
                only.
              </p>
            </div>
            <button type="button" onClick={goNew} className="btn-gold shrink-0 self-start sm:self-auto">
              New artwork
            </button>
          </div>

          <ArtworkGallery className="mt-10" showSectionHeading={false} />
        </div>
      </main>
    </div>
  )
}
