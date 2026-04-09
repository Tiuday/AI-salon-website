'use client'

/**
 * ChatWidget — floating AI chat assistant
 *
 * Architecture:
 *  - Fixed bottom-right, always visible
 *  - Collapsed: single icon button with unread dot
 *  - Expanded: 380×560px panel — message list + input
 *  - useChat (Vercel AI SDK) streams from /api/chat
 *  - Tool call: redirectToBook navigates to /book
 *  - Framer Motion panel entrance/exit
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChat } from '@ai-sdk/react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Panel animation ────────────────────────────────────────────
const panelVariants = {
  hidden: {
    opacity: 0, scale: 0.92, y: 20, originX: 1, originY: 1,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 30, mass: 0.8 },
  },
}

// ── Suggested prompts ──────────────────────────────────────────
const SUGGESTIONS = [
  'What\'s available this week?',
  'How much is a balayage?',
  'What suits a round face?',
  'Tell me about keratin treatments',
]

export function ChatWidget() {
  const router   = useRouter()
  const [open, setOpen]   = useState(false)
  const [hasNew, setHasNew] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = (useChat as any)({
    api: '/api/chat',
    // Handle the redirectToBook tool call client-side
    onToolCall: async ({ toolCall }: { toolCall: any }) => {
      if (toolCall.toolName === 'redirectToBook') {
        const args = toolCall.args as { url: string }
        router.push(args.url)
        setOpen(false)
      }
    },
    onFinish: () => {
      if (!open) setHasNew(true)
    },
  })

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Clear new indicator on open
  useEffect(() => {
    if (open) setHasNew(false)
  }, [open])

  const handleSuggestion = (text: string) => {
    append({ role: 'user', content: text })
  }

  const showSuggestions = messages.length === 0 && !isLoading

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={cn(
              'absolute bottom-[3.5rem] right-0',
              'w-[min(380px,calc(100vw-1.5rem))]',
              'h-[560px] max-h-[80vh]',
              'bg-obsidian border border-wire rounded-2xl',
              'shadow-elevated flex flex-col overflow-hidden',
              // Top edge gold line
              'before:absolute before:top-0 before:left-8 before:right-8 before:h-px',
              'before:bg-gradient-to-r before:from-transparent before:via-gold/30 before:to-transparent'
            )}
            role="dialog"
            aria-modal="false"
            aria-label="AI Chat Assistant"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-wire shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
                  <Bot size={16} className="text-ink" aria-hidden />
                </div>
                <div>
                  <p className="text-body-sm text-chalk font-medium">Nakshatra AI</p>
                  <p className="text-caption text-mist flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-success" aria-hidden />
                    Online now
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="text-mist hover:text-chalk transition-colors duration-200 p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
              role="log"
              aria-live="polite"
              aria-label="Chat messages"
            >
              {/* Welcome */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-ash rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]"
                >
                  <p className="text-body-sm text-chalk">
                    Hi! I'm Nakshatra's AI assistant. I can help you explore services,
                    check availability, or find the perfect style for your face shape. 👋
                  </p>
                </motion.div>
              )}

              {/* Message list */}
              {messages.map((msg: any) => (
                <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-ash rounded-2xl rounded-tl-sm px-4 py-3 max-w-[60%] flex items-center gap-1.5"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-mist"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </motion.div>
              )}

              {/* Suggestion chips */}
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col gap-2 mt-2"
                >
                  <p className="text-caption text-mist px-1">Try asking:</p>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      className="text-left text-body-sm text-pearl px-3 py-2 rounded-lg border border-wire hover:border-gold/40 hover:text-gold hover:bg-gold/[0.04] transition-all duration-200"
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}

              <div ref={messagesEndRef} aria-hidden />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-3 px-4 py-3 border-t border-wire shrink-0"
            >
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about services, availability…"
                disabled={isLoading}
                className={cn(
                  'flex-1 bg-ash border border-wire rounded-full',
                  'px-4 py-2.5 text-body-sm text-chalk placeholder-dim',
                  'focus:outline-none focus:border-gold/40 focus:bg-obsidian',
                  'transition-colors duration-200 disabled:opacity-50'
                )}
                aria-label="Type your message"
              />
              <motion.button
                type="submit"
                disabled={isLoading || !input?.trim()}
                className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center text-ink shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Send message"
              >
                <Send size={14} />
              </motion.button>
            </form>

            {/* Booking shortcut */}
            <div className="px-4 pb-3 pt-1 shrink-0">
              <a
                href="/book"
                className="flex items-center justify-center gap-2 text-caption text-mist hover:text-gold transition-colors duration-200"
              >
                <ArrowUpRight size={12} />
                Book directly at nakshatra.com/book
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
        aria-expanded={open}
        className="relative w-13 h-13 rounded-full bg-gradient-gold shadow-gold-strong flex items-center justify-center text-ink"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={20} />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={20} />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Unread dot */}
        {hasNew && !open && (
          <span
            aria-label="New message"
            className="absolute top-0 right-0 w-3 h-3 rounded-full bg-ember border-2 border-ink"
          />
        )}
      </motion.button>
    </>
  )
}

// ── Message bubble ─────────────────────────────────────────────
function MessageBubble({ role, content }: { role: string; content: string }) {
  const isUser = role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex items-end gap-2', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center shrink-0 mb-1',
        isUser ? 'bg-ash' : 'bg-gradient-gold'
      )}>
        {isUser
          ? <User size={12} className="text-mist" aria-hidden />
          : <Bot size={12} className="text-ink" aria-hidden />
        }
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'px-4 py-2.5 rounded-2xl max-w-[80%] text-body-sm',
          isUser
            ? 'bg-gold/10 text-chalk border border-gold/20 rounded-br-sm'
            : 'bg-ash text-chalk rounded-bl-sm'
        )}
        role={isUser ? undefined : 'status'}
      >
        {content}
      </div>
    </motion.div>
  )
}
