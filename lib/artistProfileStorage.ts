export type ArtistProfileState = {
  displayName: string
  /** Stored without @ */
  username: string
  /** data URL, or null to use default /image.png */
  profileImageDataUrl: string | null
}

export const ARTIST_PROFILE_STORAGE_KEY = 'sortart-artist-profile'

export const DEFAULT_ARTIST_PROFILE: ArtistProfileState = {
  displayName: 'Hammad Riyaz',
  username: 'hammad.riyaz',
  profileImageDataUrl: null,
}

function normalizeUsername(raw: string): string {
  let s = raw.trim().replace(/^@+/, '')
  return s.replace(/\s+/g, '').slice(0, 32)
}

export function mergeWithDefaults(
  partial: Partial<ArtistProfileState> | null | undefined
): ArtistProfileState {
  if (!partial || typeof partial !== 'object') return { ...DEFAULT_ARTIST_PROFILE }
  const displayName =
    typeof partial.displayName === 'string' && partial.displayName.trim()
      ? partial.displayName.trim().slice(0, 80)
      : DEFAULT_ARTIST_PROFILE.displayName
  const username =
    typeof partial.username === 'string' && normalizeUsername(partial.username)
      ? normalizeUsername(partial.username)
      : DEFAULT_ARTIST_PROFILE.username
  const profileImageDataUrl =
    typeof partial.profileImageDataUrl === 'string' &&
    partial.profileImageDataUrl.startsWith('data:image/')
      ? partial.profileImageDataUrl
      : null
  return { displayName, username, profileImageDataUrl }
}

export function loadArtistProfileFromStorage(): ArtistProfileState {
  if (typeof window === 'undefined') return { ...DEFAULT_ARTIST_PROFILE }
  try {
    const raw = localStorage.getItem(ARTIST_PROFILE_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_ARTIST_PROFILE }
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_ARTIST_PROFILE }
    return mergeWithDefaults(parsed as Partial<ArtistProfileState>)
  } catch {
    return { ...DEFAULT_ARTIST_PROFILE }
  }
}

export function saveArtistProfileToStorage(profile: ArtistProfileState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ARTIST_PROFILE_STORAGE_KEY, JSON.stringify(profile))
  } catch {
    /* quota or private mode */
  }
}
