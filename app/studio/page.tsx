'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import ZoomableImage from '@/components/ZoomableImage'
import ColourPopup from '@/components/ColourPopup'
import ChatUI from '@/components/ChatUI'
import { pickColour } from '@/lib/colorUtils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface PopupData {
  hex: string
  name: string
  mix: string
  tutorials: { title: string; url: string }[]
}

type MobileTab = 'tools' | 'chat'

export default function StudioPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isPickingColour, setIsPickingColour] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [popupData, setPopupData] = useState<PopupData | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI Art Coach. Upload an artwork and ask me anything about colors, techniques, or composition.' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<MobileTab>('tools')
  const router = useRouter()

  useEffect(() => {
    const storedImage = localStorage.getItem('artwise-image')
    if (storedImage) {
      setImageUrl(storedImage)
    }
  }, [])

  const handlePickColour = async () => {
    setIsPickingColour(true)
    
    try {
      // Get color from placeholder function
      const colorResult = await pickColour()
      
      // Fetch mix instructions and tutorials in parallel
      const [mixResponse, tutorialsResponse] = await Promise.allSettled([
        fetch('/api/mix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hex: colorResult.hex, name: colorResult.name })
        }),
        fetch('/api/tutorials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ colourName: colorResult.name })
        })
      ])

      // Handle mix response
      let mix = 'Mix instructions will be available when the API is ready.'
      if (mixResponse.status === 'fulfilled' && mixResponse.value.ok) {
        const mixData = await mixResponse.value.json()
        mix = mixData.mix || mix
      }

      // Handle tutorials response
      let tutorials: { title: string; url: string }[] = []
      if (tutorialsResponse.status === 'fulfilled' && tutorialsResponse.value.ok) {
        const tutorialsData = await tutorialsResponse.value.json()
        tutorials = tutorialsData.tutorials || []
      }

      setPopupData({
        hex: colorResult.hex,
        name: colorResult.name,
        mix,
        tutorials
      })
      setShowPopup(true)
    } catch {
      // Fallback if everything fails
      setPopupData({
        hex: '#8B4513',
        name: 'Burnt Sienna',
        mix: 'API not ready. This color can typically be mixed using red, yellow, and a touch of blue.',
        tutorials: []
      })
      setShowPopup(true)
    } finally {
      setIsPickingColour(false)
    }
  }

  const handleEndArtwork = () => {
    localStorage.removeItem('artwise-image')
    router.push('/')
  }

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = { role: 'user', content }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          imageUrl 
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.' 
        }])
      }
    } catch {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'The chat API is not available yet. Stay tuned!' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative z-10 bg-beige">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Studio Layout */}
      <div className="pt-16 h-screen flex flex-col lg:flex-row">
        {/* Left Sidebar Space (Desktop/Tablet only) */}
        <div className="hidden md:block md:w-[200px] lg:w-[260px] flex-shrink-0" />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Toolbar - Mobile: Full width, Desktop: Below header */}
          <div className="flex-shrink-0 p-3 md:p-4 border-b border-brown-100 bg-beige/95">
            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
              <button
                onClick={handlePickColour}
                disabled={isPickingColour}
                className="btn-gold min-h-[48px] flex-1 md:flex-none md:px-6 disabled:opacity-50"
              >
                {isPickingColour ? 'Sampling...' : 'Pick Colour'}
              </button>
              <button
                onClick={handleEndArtwork}
                className="btn-outline min-h-[48px] flex-1 md:flex-none md:px-6"
              >
                End Artwork
              </button>
            </div>
            {isPickingColour && (
              <p className="text-sm text-muted mt-2 text-center md:text-left">
                Tap anywhere on the image to sample a colour
              </p>
            )}
          </div>

          {/* Content Grid */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
            {/* Image Viewer */}
            <div className="flex-1 p-3 md:p-4 min-h-[40vh] lg:min-h-0">
              {imageUrl ? (
                <ZoomableImage imageUrl={imageUrl} />
              ) : (
                <div className="w-full h-full bg-beige-dark rounded-lg flex items-center justify-center">
                  <div className="text-center p-6">
                    <svg 
                      className="w-16 h-16 text-brown-300 mx-auto mb-4" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21,15 16,10 5,21" />
                    </svg>
                    <p className="text-brown-500">No image loaded</p>
                    <button
                      onClick={() => router.push('/')}
                      className="btn-outline mt-4"
                    >
                      Upload Artwork
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Tabs */}
            <div className="lg:hidden border-t border-brown-100">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('tools')}
                  className={`
                    flex-1 py-3 text-center font-medium transition-colors
                    ${activeTab === 'tools' 
                      ? 'text-gold border-b-2 border-gold bg-white/50' 
                      : 'text-brown-500'
                    }
                  `}
                >
                  Tools
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`
                    flex-1 py-3 text-center font-medium transition-colors
                    ${activeTab === 'chat' 
                      ? 'text-gold border-b-2 border-gold bg-white/50' 
                      : 'text-brown-500'
                    }
                  `}
                >
                  AI Chat
                </button>
              </div>
            </div>

            {/* Mobile Tab Content */}
            <div className="lg:hidden flex-1 min-h-0 overflow-hidden">
              {activeTab === 'tools' ? (
                <div className="p-4 h-full overflow-y-auto">
                  <div className="bg-white rounded-lg border border-brown-100 p-4">
                    <h3 className="font-serif text-lg font-semibold text-brown-900 mb-3">
                      Color Tools
                    </h3>
                    <p className="text-brown-500 text-sm leading-relaxed">
                      Use the &quot;Pick Colour&quot; button above to sample colors from your artwork. 
                      Our AI will provide mixing instructions and tutorial recommendations.
                    </p>
                  </div>
                </div>
              ) : (
                <ChatUI
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                />
              )}
            </div>

            {/* Desktop Chat Panel */}
            <div className="hidden lg:block w-[320px] flex-shrink-0 border-l border-brown-100">
              <ChatUI
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Colour Popup */}
      {showPopup && popupData && (
        <ColourPopup
          hex={popupData.hex}
          name={popupData.name}
          mix={popupData.mix}
          tutorials={popupData.tutorials}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  )
}
