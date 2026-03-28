'use client'

import { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { useRouter } from 'next/navigation'
import { api } from '@/convex/_generated/api'
import { isConvexConfigured } from '@/components/ConvexClientProvider'
import type { Doc } from '@/convex/_generated/dataModel'
import { DEMO_ARTWORKS, formatArtworkDate } from '@/lib/artworkDemos'

interface ArtworkGalleryProps {
  title?: string
  description?: string
  className?: string
  /** When false, only the grid (and loading line) render — use when the page already has a main title. */
  showSectionHeading?: boolean
}

export default function ArtworkGallery({
  title = 'Recent Artworks',
  description = 'End a session in the studio to save a piece here. Demo tiles below are examples only.',
  className = '',
  showSectionHeading = true,
}: ArtworkGalleryProps) {
  const router = useRouter()
  const savedRaw = useQuery(
    api.artworks.getArtworks,
    isConvexConfigured() ? {} : 'skip'
  )

  const galleryRows = useMemo(() => {
    const saved: Doc<'artworks'>[] = savedRaw ?? []
    return [
      ...saved.map((doc) => ({ kind: 'saved' as const, doc })),
      ...DEMO_ARTWORKS.map((d) => ({ kind: 'demo' as const, demo: d })),
    ]
  }, [savedRaw])

  const openSavedInStudio = (referenceImage: string) => {
    localStorage.setItem('artwise-image', referenceImage)
    router.push('/studio')
  }

  const loadingSaved = isConvexConfigured() && savedRaw === undefined

  return (
    <section className={className}>
      {showSectionHeading && (
        <>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-brown-900 mb-2">
            {title}
          </h2>
          <p className="text-sm text-brown-500 mb-8 max-w-2xl">{description}</p>
        </>
      )}
      {loadingSaved && (
        <p className="text-sm text-muted mb-6 animate-pulse">Loading your saved work…</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryRows.map((row, index) =>
          row.kind === 'saved' ? (
            <ArtworkCard
              key={row.doc._id}
              delay={index * 80}
              title={row.doc.title}
              date={formatArtworkDate(row.doc.createdAt)}
              referenceImage={row.doc.referenceImage}
              onOpen={() => openSavedInStudio(row.doc.referenceImage)}
            />
          ) : (
            <ArtworkCard
              key={row.demo.id}
              delay={index * 80}
              title={row.demo.title}
              date={row.demo.date}
              referenceImage={row.demo.imageUrl}
            />
          )
        )}
      </div>
    </section>
  )
}

interface ArtworkCardProps {
  title: string
  date: string
  delay: number
  referenceImage?: string
  color?: string
  onOpen?: () => void
}

export function ArtworkCard({
  title,
  date,
  delay,
  referenceImage,
  color,
  onOpen,
}: ArtworkCardProps) {
  const interactive = Boolean(onOpen && referenceImage)

  return (
    <article
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onOpen : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpen?.()
              }
            }
          : undefined
      }
      className={`
        fade-in bg-white rounded-xl overflow-hidden
        border border-brown-100
        transition-all duration-300 ease-out
        ${interactive ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none' : 'cursor-default'}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="aspect-[4/3] w-full relative bg-beige-dark">
        {referenceImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={referenceImage}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: color ?? '#E8D5BE' }}
          >
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
        )}
      </div>

      <div className="p-4">
        <h3 className="font-serif text-lg font-semibold text-brown-900 truncate">
          {title}
        </h3>
        <p className="text-sm text-muted mt-1">{date}</p>
        {interactive && (
          <p className="text-xs text-gold mt-2 font-medium">Tap to open in studio</p>
        )}
      </div>
    </article>
  )
}
