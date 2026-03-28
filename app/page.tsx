'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

interface Artwork {
  id: number
  title: string
  date: string
  color: string
}

const mockArtworks: Artwork[] = [
  { id: 1, title: 'Golden Hour Reflections', date: 'Mar 20, 2026', color: '#C4956A' },
  { id: 2, title: 'Autumn Leaves Study', date: 'Mar 18, 2026', color: '#A0522D' },
  { id: 3, title: 'Desert Sunset', date: 'Mar 14, 2026', color: '#C9A84C' },
]

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
  }

  return (
    <div className="min-h-screen relative z-10">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Main content */}
      <main 
        className="
          pt-16 px-4 pb-8
          md:ml-[200px] md:px-6
          lg:ml-[260px] lg:px-8
        "
      >
        {/* Hero Section */}
        <section className="fade-in max-w-4xl mx-auto pt-12 md:pt-16 lg:pt-20 text-center">
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

        {/* Artwork Grid */}
        <section className="max-w-5xl mx-auto mt-16 md:mt-20">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-brown-900 mb-8">
            Recent Artworks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockArtworks.map((artwork, index) => (
              <ArtworkCard 
                key={artwork.id} 
                artwork={artwork} 
                delay={index * 100}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

interface ArtworkCardProps {
  artwork: Artwork
  delay: number
}

function ArtworkCard({ artwork, delay }: ArtworkCardProps) {
  return (
    <article
      className="
        fade-in bg-white rounded-xl overflow-hidden
        border border-brown-100
        transition-all duration-300 ease-out
        hover:shadow-lg hover:-translate-y-1
        cursor-pointer
      "
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Placeholder artwork rectangle */}
      <div 
        className="aspect-[4/3] w-full"
        style={{ backgroundColor: artwork.color }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <svg 
            className="w-12 h-12 text-white/40" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21,15 16,10 5,21" />
          </svg>
        </div>
      </div>
      
      {/* Card content */}
      <div className="p-4">
        <h3 className="font-serif text-lg font-semibold text-brown-900 truncate">
          {artwork.title}
        </h3>
        <p className="text-sm text-muted mt-1">{artwork.date}</p>
      </div>
    </article>
  )
}
