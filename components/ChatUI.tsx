'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatUIProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  isLoading: boolean
}

export default function ChatUI({ messages, onSendMessage, isLoading }: ChatUIProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    onSendMessage(input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col h-full bg-beige">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-brown-100 bg-beige/95">
        <div className="flex items-center gap-2">
          <SparkleIcon className="w-5 h-5 text-gold" />
          <h2 className="font-serif text-lg font-semibold text-brown-900">
            SortArt Coach
          </h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[75%] px-4 py-3 rounded-xl
                ${message.role === 'user'
                  ? 'bg-gold text-white rounded-br-sm'
                  : 'bg-white border border-brown-300 text-brown-900 rounded-bl-sm'
                }
              `}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-brown-300 rounded-xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="typing-dot w-2 h-2 bg-brown-300 rounded-full" />
                <span className="typing-dot w-2 h-2 bg-brown-300 rounded-full" />
                <span className="typing-dot w-2 h-2 bg-brown-300 rounded-full" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form 
        onSubmit={handleSubmit}
        className="flex-shrink-0 p-3 border-t border-brown-100 bg-beige/95"
      >
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your painting..."
            className="
              flex-1 min-h-[48px] px-4 py-3
              bg-white border border-brown-100 rounded-xl
              text-brown-900 placeholder:text-brown-400
              focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold
              transition-colors
            "
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="
              w-12 h-12 flex items-center justify-center
              bg-gold rounded-xl
              text-white
              hover:opacity-90 transition-opacity
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            aria-label="Send message"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}

function SparkleIcon({ className }: { className?: string }) {
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
      <path d="M12 3v1m0 16v1m-8-9h1m16 0h1m-3.5-6.5L17 6m-9.5-1.5L6 6m12.5 12.5L17 18m-9.5 1.5L6 18" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  )
}
