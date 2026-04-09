'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Mic, Calendar, Sparkles, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const CAPABILITIES = [
  { icon: <Calendar size={14} />, label: 'Check availability' },
  { icon: <Sparkles size={14} />, label: 'Style advice'       },
  { icon: <HelpCircle size={14} />, label: 'Haircare tips'    },
]

const BARS = Array.from({ length: 20 }, (_, i) => i)

export function VoiceAssistantSection() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px 0px' })

  return (
    <section
      ref={ref}
      className="bg-ink section-rhythm relative overflow-hidden"
      aria-label="Voice AI assistant"
    >
      {/* Ambient gold radial glow at base */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] gold-ambient pointer-events-none" aria-hidden />

      <div className="container-content relative z-raised">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-8">

          {/* Overline */}
          <motion.span
            className="t-overline flex items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-block h-px w-8 bg-gold shrink-0" aria-hidden />
            AI Voice Assistant
            <span className="inline-block h-px w-8 bg-gold shrink-0" aria-hidden />
          </motion.span>

          {/* Headline */}
          <motion.h2
            className="font-display text-display-lg text-chalk italic"
            style={{ letterSpacing: '-0.025em', lineHeight: '0.95' }}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            Do… just speak.
          </motion.h2>

          {/* Sub copy */}
          <motion.p
            className="text-body-lg text-pearl max-w-md"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            Talk to our AI stylist. Ask about services, find your perfect look,
            or book an appointment — all by voice.
          </motion.p>

          {/* Waveform visualiser */}
          <motion.div
            className="flex items-center gap-[3px] h-12"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.35, duration: 0.6 }}
          >
            {BARS.map((i) => (
              <motion.span
                key={i}
                className="w-[3px] rounded-full bg-gold/40"
                animate={
                  inView
                    ? {
                        scaleY: [0.15, Math.random() * 0.85 + 0.15, 0.15],
                        opacity: [0.3, 0.7, 0.3],
                      }
                    : { scaleY: 0.15, opacity: 0.3 }
                }
                transition={{
                  duration: 1.4 + Math.random() * 0.8,
                  repeat: Infinity,
                  delay: i * 0.06,
                  ease: 'easeInOut',
                }}
                style={{ height: 48, transformOrigin: 'center' }}
              />
            ))}
          </motion.div>

          {/* CTA button */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
          >
            <Button
              size="lg"
              leftIcon={<Mic size={16} />}
              className="tracking-widest uppercase text-[0.72rem] animate-gold-pulse"
              onClick={() => {
                // Scroll to the voice button or trigger it directly
                const voiceBtn = document.querySelector('[aria-label="Start voice assistant"]') as HTMLButtonElement
                voiceBtn?.click()
              }}
            >
              Start Voice Session
            </Button>
          </motion.div>

          {/* Capability chips */}
          <motion.div
            className="flex flex-wrap justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            {CAPABILITIES.map((cap) => (
              <span
                key={cap.label}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-ash border border-wire rounded-full text-caption text-mist"
              >
                <span className="text-gold" aria-hidden>{cap.icon}</span>
                {cap.label}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
