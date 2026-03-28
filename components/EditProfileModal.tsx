'use client'

import { useEffect, useRef, useState } from 'react'
import type { ArtistProfileState } from '@/lib/artistProfileStorage'
import { useArtistProfile } from '@/components/ArtistProfileProvider'

const MAX_IMAGE_BYTES = 1_800_000

interface EditProfileModalProps {
  open: boolean
  onClose: () => void
}

export default function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  const { profile, replaceProfile } = useArtistProfile()
  const fileRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setDisplayName(profile.displayName)
    setUsername(profile.username)
    setImageDataUrl(profile.profileImageDataUrl)
    setImageError(null)
  }, [open, profile])

  if (!open) return null

  const previewSrc = imageDataUrl ?? '/image.png'

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Image is too large. Try one under about 1.7 MB.')
      return
    }
    setImageError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const r = reader.result
      if (typeof r === 'string') setImageDataUrl(r)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    const next: ArtistProfileState = {
      displayName: displayName.trim() || profile.displayName,
      username: username.trim().replace(/^@+/, '').replace(/\s+/g, '') || profile.username,
      profileImageDataUrl: imageDataUrl,
    }
    replaceProfile(next)
    onClose()
  }

  const handleResetPhoto = () => {
    setImageDataUrl(null)
    setImageError(null)
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[80] bg-brown-900/40 animate-in fade-in duration-200"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="
          fixed left-1/2 top-1/2 z-[90] w-[min(100vw-1.5rem,400px)] max-h-[min(90dvh,560px)]
          -translate-x-1/2 -translate-y-1/2 flex flex-col
          rounded-2xl border-[1.5px] border-gold bg-beige shadow-[0_24px_60px_rgba(44,26,14,0.2)]
          animate-in fade-in zoom-in-95 duration-200 overflow-hidden
        "
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-brown-100 shrink-0">
          <h2 id="edit-profile-title" className="font-serif text-lg font-semibold text-brown-900">
            Edit profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-full flex items-center justify-center text-brown-600 hover:bg-brown-100"
            aria-label="Close"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 min-h-0 space-y-5">
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-gold/40 bg-brown-100 shrink-0">
              <img src={previewSrc} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn-gold text-sm min-h-[40px] px-4"
              >
                Change photo
              </button>
              {imageDataUrl !== null && (
                <button
                  type="button"
                  onClick={handleResetPhoto}
                  className="
                    text-sm min-h-[40px] px-4 rounded-lg border border-brown-300 text-brown-800
                    hover:bg-brown-100/80
                  "
                >
                  Use default photo
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
            {imageError && (
              <p className="text-sm text-sienna text-center" role="alert">
                {imageError}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="artist-display-name" className="text-sm font-medium text-brown-800">
              Name
            </label>
            <input
              id="artist-display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="
                w-full rounded-lg border border-brown-200 bg-white/90 px-3 py-2.5 text-brown-900
                outline-none focus-visible:ring-2 focus-visible:ring-gold/50
              "
              autoComplete="name"
              maxLength={80}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="artist-username" className="text-sm font-medium text-brown-800">
              Username
            </label>
            <div className="flex items-center rounded-lg border border-brown-200 bg-white/90 overflow-hidden focus-within:ring-2 focus-within:ring-gold/50">
              <span className="pl-3 text-brown-500 text-sm select-none">@</span>
              <input
                id="artist-username"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/^@+/, '').replace(/\s+/g, ''))}
                className="flex-1 min-w-0 py-2.5 pr-3 text-brown-900 outline-none bg-transparent"
                autoComplete="username"
                maxLength={32}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 pt-0 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="
              flex-1 min-h-[48px] rounded-lg border border-brown-300 text-brown-800 font-medium
              hover:bg-brown-100/80
            "
          >
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="btn-gold flex-1 min-h-[48px] justify-center">
            Save
          </button>
        </div>
      </div>
    </>
  )
}
