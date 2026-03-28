'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  type ArtistProfileState,
  DEFAULT_ARTIST_PROFILE,
  loadArtistProfileFromStorage,
  mergeWithDefaults,
  saveArtistProfileToStorage,
} from '@/lib/artistProfileStorage'

type ArtistProfileContextValue = {
  profile: ArtistProfileState
  updateProfile: (patch: Partial<ArtistProfileState>) => void
  replaceProfile: (next: ArtistProfileState) => void
}

const ArtistProfileContext = createContext<ArtistProfileContextValue | null>(null)

export function ArtistProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ArtistProfileState>(DEFAULT_ARTIST_PROFILE)
  const skipPersistRef = useRef(true)

  useEffect(() => {
    setProfile(loadArtistProfileFromStorage())
  }, [])

  useEffect(() => {
    if (skipPersistRef.current) {
      skipPersistRef.current = false
      return
    }
    saveArtistProfileToStorage(profile)
  }, [profile])

  const updateProfile = useCallback((patch: Partial<ArtistProfileState>) => {
    setProfile((prev) => mergeWithDefaults({ ...prev, ...patch }))
  }, [])

  const replaceProfile = useCallback((next: ArtistProfileState) => {
    setProfile(mergeWithDefaults(next))
  }, [])

  const value = useMemo(
    () => ({ profile, updateProfile, replaceProfile }),
    [profile, updateProfile, replaceProfile]
  )

  return (
    <ArtistProfileContext.Provider value={value}>{children}</ArtistProfileContext.Provider>
  )
}

export function useArtistProfile(): ArtistProfileContextValue {
  const ctx = useContext(ArtistProfileContext)
  if (!ctx) {
    throw new Error('useArtistProfile must be used within ArtistProfileProvider')
  }
  return ctx
}
