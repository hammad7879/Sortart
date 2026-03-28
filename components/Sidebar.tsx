'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useArtistProfile } from '@/components/ArtistProfileProvider'
import EditProfileModal from '@/components/EditProfileModal'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface Project {
  title: string
  date: string
}

const projects: Project[] = [
  { title: 'Sunset Over Tuscany', date: 'Mar 15, 2026' },
  { title: 'Abstract Dreams', date: 'Mar 10, 2026' },
  { title: 'Portrait Study #7', date: 'Mar 5, 2026' },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { profile } = useArtistProfile()
  const [editProfileOpen, setEditProfileOpen] = useState(false)

  const avatarSrc = profile.profileImageDataUrl ?? '/image.png'

  const navLinks = [
    { href: '/', label: 'Home', icon: HomeIcon },
    { href: '/artworks', label: 'My Artworks', icon: GalleryIcon },
  ]

  return (
    <>
      <EditProfileModal open={editProfileOpen} onClose={() => setEditProfileOpen(false)} />

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="overlay md:hidden" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 bg-beige
          border-r border-brown-100
          transition-transform duration-300 ease-out
          
          /* Mobile: drawer behavior */
          w-[280px] -translate-x-full
          ${isOpen ? 'translate-x-0 slide-in-left' : ''}
          
          /* Tablet: always visible, narrower */
          md:translate-x-0 md:w-[200px]
          
          /* Desktop: always visible, full width */
          lg:w-[260px]
        `}
      >
        <div className="flex flex-col h-full pt-20 md:pt-20 px-4 lg:px-5">
          {/* Profile Section */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden mb-3 ring-2 ring-gold/50 shadow-md bg-brown-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarSrc}
                alt={profile.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="font-serif text-lg lg:text-xl font-semibold text-brown-900">
              {profile.displayName}
            </h2>
            <p className="text-sm text-muted">@{profile.username}</p>
            <p className="text-sm text-brown-500 mt-2 leading-relaxed">
              Capturing light one brushstroke at a time
            </p>
            <button
              type="button"
              onClick={() => setEditProfileOpen(true)}
              className="
                mt-4 text-sm font-medium text-gold hover:text-brown-700
                underline underline-offset-4 decoration-gold/50 hover:decoration-brown-500
                transition-colors min-h-[44px] px-2
              "
            >
              Edit profile
            </button>
          </div>

          {/* Navigation */}
          <nav className="mb-8">
            <ul className="space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg
                        transition-all duration-200 min-h-[48px]
                        ${isActive 
                          ? 'bg-brown-100 text-brown-900' 
                          : 'text-brown-700 hover:bg-brown-100/50'
                        }
                      `}
                    >
                      <link.icon className="w-5 h-5" />
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Previous Projects */}
          <div className="flex-1">
            <h3 className="font-serif text-sm font-semibold text-brown-700 uppercase tracking-wider mb-3 px-2">
              Recent Projects
            </h3>
            <ul className="space-y-1">
              {projects.map((project, index) => (
                <li key={index}>
                  <button
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-brown-100/50 transition-colors duration-200"
                  >
                    <p className="text-sm font-medium text-brown-900 truncate">
                      {project.title}
                    </p>
                    <p className="text-xs text-muted">{project.date}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  )
}

function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21,15 16,10 5,21" />
    </svg>
  )
}
