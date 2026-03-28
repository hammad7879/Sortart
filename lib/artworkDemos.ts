export type DemoArtwork = {
  id: string
  title: string
  date: string
  /** Stock preview (Unsplash). */
  imageUrl: string
}

/**
 * Unsplash image URLs must use real photo IDs (see unsplash.com). Invalid IDs return 404 and cards look blank.
 * These entries were checked with HTTP HEAD (200).
 */
const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`

/** Demo tiles after saved artworks — example paintings for preview only (not photos). */
export const DEMO_ARTWORKS: DemoArtwork[] = [
  {
    id: 'demo-1',
    title: 'Still life (oil)',
    date: 'Mar 18, 2026',
    imageUrl: unsplash('photo-1579783902614-a3fb3927b6a5'),
  },
  {
    id: 'demo-2',
    title: 'Abstract canvas',
    date: 'Mar 12, 2026',
    imageUrl: unsplash('photo-1513364776144-60967b0f800f'),
  },
]

/** Curated paintings for “Get inspired” (canvas / oil / abstract art — verified URLs). */
export const INSPIRATION_ARTWORKS: DemoArtwork[] = [
  {
    id: 'inspire-1',
    title: 'Classical still life',
    date: '',
    imageUrl: unsplash('photo-1579783902614-a3fb3927b6a5'),
  },
  {
    id: 'inspire-2',
    title: 'Bold abstract canvas',
    date: '',
    imageUrl: unsplash('photo-1513364776144-60967b0f800f'),
  },
  {
    id: 'inspire-3',
    title: 'Art & color studies',
    date: '',
    imageUrl: unsplash('photo-1541961017774-22349e4a1262'),
  },
  {
    id: 'inspire-4',
    title: 'Gallery texture',
    date: '',
    imageUrl: unsplash('photo-1536924940846-227afb31e2a5'),
  },
  {
    id: 'inspire-5',
    title: 'Fluid abstract',
    date: '',
    imageUrl: unsplash('photo-1618005182384-a83a8bd57fbe'),
  },
  {
    id: 'inspire-6',
    title: 'Painterly strokes',
    date: '',
    imageUrl: unsplash('photo-1582555172866-f73bb12a2ab3'),
  },
]

export function formatArtworkDate(createdAt: number): string {
  return new Date(createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
