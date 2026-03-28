export type DemoArtwork = {
  id: string
  title: string
  date: string
  /** Stock preview (Unsplash). */
  imageUrl: string
}

/** Demo tiles shown after saved Convex artworks — stock photos for preview only. */
export const DEMO_ARTWORKS: DemoArtwork[] = [
  {
    id: 'demo-1',
    title: 'Golden Hour Study',
    date: 'Mar 18, 2026',
    imageUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'demo-2',
    title: 'Forest Path Sketch',
    date: 'Mar 12, 2026',
    imageUrl:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'demo-3',
    title: 'Coastal Wash',
    date: 'Mar 5, 2026',
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
  },
]

export function formatArtworkDate(createdAt: number): string {
  return new Date(createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
