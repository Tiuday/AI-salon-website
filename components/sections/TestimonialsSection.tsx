'use client'

import { useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useTransform } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/utils'
import type { Testimonial } from '@/types'

const TESTIMONIALS: Testimonial[] = [
  { id:'1', created_at:'', client_name:'Sophie Turner', client_handle:'@sophiet', rating:5, quote:"Nakshatra completely transformed my hair. I came in with a vague idea of 'lighter' and left with the exact balayage I'd been looking for for two years. The whole experience felt genuinely luxurious.", service_name:'Balayage', is_published:true },
  { id:'2', created_at:'', client_name:'Priya Mehta', client_handle:'@priyam', rating:5, quote:"The precision on my bob is immaculate. I've been to a lot of stylists and nobody holds the line like Nakshatra. It's been 8 weeks and it still looks freshly cut.", service_name:'Signature Cut', is_published:true },
  { id:'3', created_at:'', client_name:'Emma Clarke', client_handle:'@emmac', rating:5, quote:"I was nervous about the keratin treatment but Nakshatra explained every step. Zero frizz for four months. My hair looks and feels better than it has in years.", service_name:'Keratin Treatment', is_published:true },
  { id:'4', created_at:'', client_name:'Aisha Rahman', client_handle:'@aishar', rating:5, quote:"Booked for my wedding hair and could not have been happier. Nakshatra remembered every tiny detail from our consultation trial. The updo was exactly what I envisioned.", service_name:'Bridal Hair', is_published:true },
  { id:'5', created_at:'', client_name:'Lucy Harrington', client_handle:'@lucyh', rating:5, quote:"The face shape consultation before my cut was genuinely eye-opening. I've never had a stylist take that kind of care before. The result was the best haircut I've ever had.", service_name:'Signature Cut', is_published:true },
]

interface Props {
  testimonials?: Testimonial[]
}

export function TestimonialsSection({ testimonials = TESTIMONIALS }: Props) {
  const ref             = useRef<HTMLDivElement>(null)
  const inView          = useInView(ref, { once: true, margin: '-80px 0px' })
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
  const next = () => setCurrent((c) => (c + 1) % testimonials.length)

  return (
    <section
      ref={ref}
      className="bg-carbon section-rhythm overflow-hidden"
      aria-label="Client testimonials"
    >
      <div className="container-content">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionHeading
              overline="Testimonials"
              headline="Love letters to *Nakshatra*"
              subtitle="What clients say after their first session — and why they keep coming back."
              size="section"
            />
          </motion.div>

          {/* Aggregate rating */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="shrink-0 flex flex-col items-start lg:items-end gap-1"
          >
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={16} className="star-filled" fill="currentColor" aria-hidden />
              ))}
            </div>
            <span className="text-body-sm text-pearl">5.0 from {testimonials.length}+ reviews</span>
          </motion.div>
        </div>

        {/* Carousel wrapper */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.25, duration: 0.8 }}
        >
          {/* Desktop: draggable horizontal scroll */}
          <div className="hidden sm:block">
            <DraggableCarousel testimonials={testimonials} />
          </div>

          {/* Mobile: step-by-step with controls */}
          <div className="sm:hidden">
            <MobileCarousel
              testimonials={testimonials}
              current={current}
              onPrev={prev}
              onNext={next}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── Desktop draggable carousel ─────────────────────────────────
function DraggableCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const x = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative overflow-hidden" ref={containerRef}>
      <motion.div
        drag="x"
        dragConstraints={containerRef}
        dragElastic={0.08}
        className="flex gap-5 cursor-grab active:cursor-grabbing"
        style={{ x }}
        whileTap={{ cursor: 'grabbing' }}
      >
        {testimonials.map((t) => (
          <TestimonialCard key={t.id} testimonial={t} />
        ))}
      </motion.div>

      {/* Fade edges */}
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-carbon to-transparent pointer-events-none" />
    </div>
  )
}

// ── Mobile step carousel ───────────────────────────────────────
function MobileCarousel({
  testimonials, current, onPrev, onNext,
}: {
  testimonials: Testimonial[]
  current: number
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <motion.div
        key={current}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <TestimonialCard testimonial={testimonials[current]} />
      </motion.div>

      <div className="flex items-center justify-between">
        <span className="text-caption text-mist">
          {current + 1} / {testimonials.length}
        </span>
        <div className="flex gap-2">
          <button
            onClick={onPrev}
            aria-label="Previous testimonial"
            className="w-9 h-9 rounded-full border border-wire flex items-center justify-center text-mist hover:text-chalk hover:border-gold/40 transition-colors duration-200"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={onNext}
            aria-label="Next testimonial"
            className="w-9 h-9 rounded-full border border-wire flex items-center justify-center text-mist hover:text-chalk hover:border-gold/40 transition-colors duration-200"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Testimonial card ───────────────────────────────────────────
function TestimonialCard({ testimonial: t }: { testimonial: Testimonial }) {
  return (
    <article
      className="testimonial-card shrink-0"
      aria-label={`Testimonial from ${t.client_name}`}
    >
      {/* Quote icon */}
      <Quote size={24} className="text-gold/30" aria-hidden />

      {/* Stars */}
      <div className="flex items-center gap-1" aria-label={`${t.rating} stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={13}
            className={i < t.rating ? 'star-filled' : 'star-empty'}
            fill="currentColor"
            aria-hidden
          />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-body-md text-pearl leading-relaxed flex-1">
        "{t.quote}"
      </blockquote>

      {/* Client */}
      <div className="flex items-center gap-3 pt-2 border-t border-wire mt-auto">
        {/* Avatar initial */}
        <div
          className="w-8 h-8 rounded-full bg-ash flex items-center justify-center text-caption text-gold font-medium shrink-0"
          aria-hidden
        >
          {t.client_name.charAt(0)}
        </div>
        <div>
          <p className="text-body-sm text-chalk font-medium">{t.client_name}</p>
          {t.service_name && (
            <p className="text-caption text-mist">{t.service_name}</p>
          )}
        </div>
      </div>
    </article>
  )
}
