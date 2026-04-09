'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ChevronDown, Sparkles, Droplets, Scissors, HelpCircle } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { FaqItem } from '@/types'

// ── Static data (replace with Supabase fetch) ─────────────────
const TIPS = [
  {
    icon: <Droplets size={18} />,
    title: 'Hydration is Everything',
    body: 'Deep condition once a week. Your hair is 25% more porous after colouring — it needs the moisture.',
    tag: 'Aftercare',
  },
  {
    icon: <Sparkles size={18} />,
    title: 'Heat Protection Always',
    body: 'Apply a heat protectant before any tool above 180°C. It\'s the difference between shine and damage.',
    tag: 'Styling',
  },
  {
    icon: <Scissors size={18} />,
    title: 'Trim Every 8 Weeks',
    body: 'Even if you\'re growing it out. Split ends travel upward — trimming keeps your length looking intentional.',
    tag: 'Maintenance',
  },
]

const FAQ_ITEMS: FaqItem[] = [
  { id:'1', question:'How do I book an appointment?', answer:'Use the booking page on this website — select your service, choose a date and time, fill in your details. You\'ll receive a confirmation email instantly.', category:'booking', sort_order:1 },
  { id:'2', question:'How far in advance should I book?', answer:'For cuts and styling, 1–2 weeks is usually enough. For colour services and bridal hair, 3–4 weeks is recommended to secure your preferred slot.', category:'booking', sort_order:2 },
  { id:'3', question:'What if I need to cancel or reschedule?', answer:'Please give at least 48 hours\' notice. Late cancellations (under 24h) may incur a 50% charge. Use the link in your confirmation email to reschedule.', category:'booking', sort_order:3 },
  { id:'4', question:'How long do keratin treatments last?', answer:'Between 3 and 5 months depending on your hair type, how often you wash, and the products you use at home. Sulphate-free shampoo extends longevity.', category:'aftercare', sort_order:1 },
  { id:'5', question:'Do you offer a consultation?', answer:'Yes — all bookings include a 10-minute consultation at the start of the appointment. For major colour changes or bridal services, a separate consultation can be booked.', category:'general', sort_order:1 },
  { id:'6', question:'What products do you use?', answer:'Predominantly Davines and Olaplex. Both are professional, ethically produced, and free from harsh sulphates and parabens.', category:'general', sort_order:2 },
]

interface Props {
  faq?: FaqItem[]
}

export function ContentHubSection({ faq = FAQ_ITEMS }: Props) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px 0px' })

  return (
    <section
      ref={ref}
      className="bg-ink section-rhythm"
      aria-label="Haircare tips and FAQ"
    >
      <div className="container-content">

        {/* Bento grid: 3 tips + FAQ panel */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">

          {/* Left: tips (2 col span) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <SectionHeading
                overline="Haircare Tips"
                headline="Your hair *between* appointments"
                size="card"
              />
            </motion.div>

            {TIPS.map((tip, i) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="bg-obsidian border border-wire rounded-xl p-6 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="w-8 h-8 rounded-full bg-ash flex items-center justify-center text-gold shrink-0">
                    {tip.icon}
                  </div>
                  <Badge variant="muted" size="sm">{tip.tag}</Badge>
                </div>
                <h3 className="font-sans text-heading-md text-chalk">{tip.title}</h3>
                <p className="text-body-sm text-mist leading-relaxed">{tip.body}</p>
              </motion.div>
            ))}
          </div>

          {/* Right: FAQ (3 col span) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              <SectionHeading
                overline="FAQ"
                headline="*Answers* at a glance"
                size="card"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="flex flex-col"
              role="list"
              aria-label="Frequently asked questions"
            >
              {faq.map((item, i) => (
                <FaqAccordionItem key={item.id} item={item} index={i} />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── FAQ Accordion Item ─────────────────────────────────────────
function FaqAccordionItem({ item, index }: { item: FaqItem; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      className="faq-item"
      role="listitem"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        className="faq-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`faq-answer-${item.id}`}
        id={`faq-trigger-${item.id}`}
      >
        <span className="pr-4">{item.question}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0 text-mist"
          aria-hidden
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`faq-answer-${item.id}`}
            role="region"
            aria-labelledby={`faq-trigger-${item.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p className="pt-4 pb-2 text-body-sm text-pearl leading-relaxed">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
