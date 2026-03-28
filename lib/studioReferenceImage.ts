/** Image data URL passed from home / gallery into the studio (localStorage). */
export const STUDIO_REFERENCE_IMAGE_KEY = 'sortart-image'

const LEGACY_STUDIO_REFERENCE_IMAGE_KEY = 'artwise-image'

export function getStudioReferenceImage(): string | null {
  if (typeof window === 'undefined') return null
  return (
    localStorage.getItem(STUDIO_REFERENCE_IMAGE_KEY) ??
    localStorage.getItem(LEGACY_STUDIO_REFERENCE_IMAGE_KEY)
  )
}

export function setStudioReferenceImage(dataUrl: string): void {
  localStorage.setItem(STUDIO_REFERENCE_IMAGE_KEY, dataUrl)
  localStorage.removeItem(LEGACY_STUDIO_REFERENCE_IMAGE_KEY)
}

export function clearStudioReferenceImage(): void {
  localStorage.removeItem(STUDIO_REFERENCE_IMAGE_KEY)
  localStorage.removeItem(LEGACY_STUDIO_REFERENCE_IMAGE_KEY)
}
