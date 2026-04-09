'use client'

/**
 * VoiceCallButton — ElevenLabs conversational AI trigger
 *
 * States:
 *  idle      → mic icon, gold-pulse animation
 *  connecting → spinner
 *  active    → animated waveform bars, glowing red ring (recording)
 *  error     → red state, tooltip
 *
 * Integration:
 *  uses @11labs/react useConversation hook
 *  agentId from NEXT_PUBLIC_ELEVENLABS_AGENT_ID env var
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Loader2, PhoneOff } from 'lucide-react'
import { cn } from '@/lib/utils'

// NOTE: uncomment when @11labs/react is installed
// import { useConversation } from '@11labs/react'

type VoiceState = 'idle' | 'connecting' | 'active' | 'error'

const WAVEFORM_BARS = 5

export function VoiceCallButton() {
  const [state, setState] = useState<VoiceState>('idle')
  const [tooltip, setTooltip] = useState(false)

  // ── ElevenLabs integration (uncomment when package is installed) ──
  //
  // const conversation = useConversation({
  //   agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
  //   onConnect:    () => setState('active'),
  //   onDisconnect: () => setState('idle'),
  //   onError:      () => setState('error'),
  // })
  //
  // const toggle = async () => {
  //   if (state === 'active') {
  //     await conversation.endSession()
  //   } else {
  //     setState('connecting')
  //     await conversation.startSession({ agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID! })
  //   }
  // }

  // Placeholder toggle for UI preview
  const toggle = () => {
    if (state === 'active') {
      setState('idle')
    } else if (state === 'idle') {
      setState('connecting')
      setTimeout(() => setState('active'), 1200)
    } else if (state === 'error') {
      setState('idle')
    }
  }

  const label =
    state === 'idle'       ? 'Start voice assistant' :
    state === 'connecting' ? 'Connecting…' :
    state === 'active'     ? 'End voice call' :
    'Voice error — tap to reset'

  return (
    <div className="relative flex flex-col items-end gap-1">
      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, x: 8, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-obsidian border border-wire rounded-lg px-3 py-2 text-caption text-pearl shadow-elevated pointer-events-none"
            role="tooltip"
          >
            {state === 'idle'   ? 'Talk to our AI stylist' :
             state === 'active' ? 'AI is listening…' :
             label}
            <span className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-obsidian border-r border-t border-wire rotate-45" aria-hidden />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button */}
      <motion.button
        onClick={toggle}
        aria-label={label}
        aria-pressed={state === 'active'}
        onMouseEnter={() => setTooltip(true)}
        onFocus={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        onBlur={() => setTooltip(false)}
        className={cn(
          'relative w-12 h-12 rounded-full flex items-center justify-center',
          'shadow-card transition-all duration-300',
          state === 'active'
            ? 'bg-ember border-2 border-ember-light'
            : 'bg-obsidian border border-wire hover:border-gold/50',
        )}
        whileHover={state !== 'active' ? { scale: 1.05, borderColor: 'rgba(201,169,110,0.5)' } : undefined}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        style={
          state === 'idle'
            ? { boxShadow: undefined }  // gold-pulse via CSS animation
            : undefined
        }
      >
        {/* Active glow ring */}
        {state === 'active' && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-ember"
            animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            aria-hidden
          />
        )}

        {/* Idle gold-pulse */}
        {state === 'idle' && (
          <span className="absolute inset-0 rounded-full animate-gold-pulse" aria-hidden />
        )}

        {/* Icon */}
        <AnimatePresence mode="wait">
          {state === 'connecting' ? (
            <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Loader2 size={18} className="text-mist animate-spin" aria-hidden />
            </motion.span>
          ) : state === 'active' ? (
            <motion.span key="active" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <WaveformIcon />
            </motion.span>
          ) : state === 'error' ? (
            <motion.span key="error" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <MicOff size={18} className="text-ember" aria-hidden />
            </motion.span>
          ) : (
            <motion.span key="idle" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <Mic size={18} className="text-gold" aria-hidden />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

// ── Animated waveform ──────────────────────────────────────────
function WaveformIcon() {
  return (
    <div className="flex items-center gap-[2px]" aria-hidden>
      {Array.from({ length: WAVEFORM_BARS }).map((_, i) => (
        <motion.span
          key={i}
          className="w-[3px] bg-white rounded-full"
          animate={{ scaleY: [0.3, 1, 0.3] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.12,
            ease: 'easeInOut',
          }}
          style={{ height: 16, transformOrigin: 'bottom' }}
        />
      ))}
    </div>
  )
}
