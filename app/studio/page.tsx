'use client'

import { useState, useEffect } from 'react'
import { useAction, useMutation } from 'convex/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import ArtworkWorkspace from '@/components/ArtworkWorkspace'
import ChatUI from '@/components/ChatUI'
import { api } from '@/convex/_generated/api'
import { isConvexConfigured } from '@/components/ConvexClientProvider'
import { compressDataUrlForStorage } from '@/lib/imageForStorage'
import {
  clearStudioReferenceImage,
  getStudioReferenceImage,
  setStudioReferenceImage,
} from '@/lib/studioReferenceImage'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

type MobileTab = 'tools' | 'chat'

export default function StudioPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm your SortArt coach. Upload an artwork and ask me anything about colors, techniques, or composition.",
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<MobileTab>('tools')
  const [endingSession, setEndingSession] = useState(false)
  const router = useRouter()
  const sendCoachMessage = useAction(api.chat.sendCoachMessage)
  const createArtwork = useMutation(api.artworks.createArtwork)

  useEffect(() => {
    const storedImage = getStudioReferenceImage()
    if (storedImage) {
      setImageUrl(storedImage)
    }
  }, [])

  const persistImage = (dataUrl: string) => {
    setImageUrl(dataUrl)
    setStudioReferenceImage(dataUrl)
  }

  const handleEndArtwork = async () => {
    if (endingSession) return
    setEndingSession(true)
    try {
      if (imageUrl && isConvexConfigured()) {
        try {
          const referenceImage = await compressDataUrlForStorage(imageUrl)
          const title = `Artwork – ${new Date().toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}`
          await createArtwork({ title, referenceImage })
        } catch {
          /* still leave studio if save fails */
        }
      }
      clearStudioReferenceImage()
      setImageUrl(null)
      router.push('/')
    } finally {
      setEndingSession(false)
    }
  }

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = { role: 'user', content }
    const thread = [...messages, userMessage]
    setMessages(thread)
    setIsLoading(true)

    if (!isConvexConfigured()) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Connect Convex to use chat: set NEXT_PUBLIC_CONVEX_URL in .env.local and run `npx convex dev`. Add OPENAI_API_KEY in the Convex dashboard.',
        },
      ])
      setIsLoading(false)
      return
    }

    try {
      const reply = await sendCoachMessage({
        messages: thread,
        imageUrl: imageUrl ?? undefined,
      })
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      const detail =
        err instanceof Error ? err.message : 'Something went wrong.'
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I couldn’t reach the coach just now. (${detail})`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative z-10 bg-beige">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="pt-16 h-screen flex flex-col lg:flex-row">
        <div className="hidden md:block md:w-[200px] lg:w-[260px] flex-shrink-0" />

        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          <div className="flex-shrink-0 p-3 md:p-4 border-b border-brown-100 bg-beige/95">
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:items-center">
              <button
                type="button"
                onClick={() => void handleEndArtwork()}
                disabled={endingSession}
                className="btn-outline min-h-[48px] flex-1 md:flex-none md:px-6 transition-all duration-200 hover:shadow-md disabled:opacity-60"
              >
                {endingSession ? 'Saving…' : 'End Artwork'}
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
            <div className="flex-1 p-3 md:p-4 min-h-[40vh] lg:min-h-0 flex flex-col">
              <ArtworkWorkspace imageUrl={imageUrl} onImageChange={persistImage} />
            </div>

            <div className="lg:hidden border-t border-brown-100">
              <div className="flex">
                <button
                  type="button"
                  onClick={() => setActiveTab('tools')}
                  className={`
                    flex-1 py-3 text-center font-medium transition-colors duration-200
                    ${
                      activeTab === 'tools'
                        ? 'text-gold border-b-2 border-gold bg-white/50'
                        : 'text-brown-500'
                    }
                  `}
                >
                  Tools
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className={`
                    flex-1 py-3 text-center font-medium transition-colors duration-200
                    ${
                      activeTab === 'chat'
                        ? 'text-gold border-b-2 border-gold bg-white/50'
                        : 'text-brown-500'
                    }
                  `}
                >
                  AI Chat
                </button>
              </div>
            </div>

            <div className="lg:hidden flex-1 min-h-0 overflow-hidden">
              {activeTab === 'tools' ? (
                <div className="p-4 h-full overflow-y-auto">
                  <div className="bg-white rounded-lg border border-brown-100 p-4 shadow-sm animate-in fade-in duration-300">
                    <h3 className="font-serif text-lg font-semibold text-brown-900 mb-3">
                      Artwork workspace
                    </h3>
                    <p className="text-brown-500 text-sm leading-relaxed">
                      Use the canvas above to upload your reference, then click any
                      pixel to sample its color. Open Mix Color or View Tutorials from
                      the popup.
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
    </div>
  )
}
