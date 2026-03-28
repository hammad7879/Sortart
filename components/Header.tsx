'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/artworks', label: 'My Artworks' },
  ]

  return (
    <header
      className="header-crushed-paper fixed top-0 left-0 right-0 h-16 bg-beige/95 backdrop-blur-sm border-b border-brown-100 z-40"
    >
      <div
        className="
          relative z-10 flex items-center justify-between h-full
          px-4
          md:pl-[calc(200px+1.5rem)] md:pr-6
          lg:pl-[calc(260px+2rem)] lg:pr-8
        "
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group transition-opacity hover:opacity-90"
          aria-label="SortArt home"
        >
          <BrushIcon className="w-6 h-6 shrink-0 text-gold group-hover:text-brown-700 transition-colors" />
          <span className="font-serif text-xl lg:text-2xl tracking-tight leading-none">
            <span className="font-semibold text-brown-900">Sort</span>
            <span className="font-bold text-gold">Art</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  font-medium transition-colors duration-200
                  ${isActive 
                    ? 'text-gold' 
                    : 'text-brown-700 hover:text-brown-900'
                  }
                `}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Mobile Hamburger */}
        <button
          onClick={onMenuClick}
          className="md:hidden flex items-center justify-center w-12 h-12 rounded-lg hover:bg-brown-100/50 transition-colors duration-200"
          aria-label="Open menu"
        >
          <svg 
            className="w-6 h-6 text-brown-700" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </header>
  )
}

function BrushIcon({ className }: { className?: string }) {
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
      <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
      <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
    </svg>
  )
}
