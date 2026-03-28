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
      className="header-crushed-paper fixed top-0 left-0 right-0 h-16 border-b border-brown-100 z-40"
    >
      <div className="header-photo-bg" aria-hidden />
      <div
        className="
          relative z-10 flex items-center justify-between h-full
          px-4
          md:pl-[calc(200px+1.5rem)] md:pr-6
          lg:pl-[calc(260px+2rem)] lg:pr-8
        "
      >
        <Link
          href="/"
          className="
            shrink-0 rounded-full overflow-hidden ring-2 ring-brown-100 shadow-sm
            transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-beige
          "
          aria-label="SortArt home"
        >
          <img
            src="/image%20copy.png"
            alt="SortArt"
            width={40}
            height={40}
            className="h-10 w-10 origin-center object-cover scale-[1.22]"
          />
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
