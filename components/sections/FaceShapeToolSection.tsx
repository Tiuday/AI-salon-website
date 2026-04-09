'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Camera, ChevronRight, RefreshCw } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { manualShapeResult, SHAPE_ADVICE } from '@/lib/face/classifyShape'
import type { FaceShape, Hairstyle } from '@/types'

// ── Face shape SVG icons ───────────────────────────────────────
const FACE_SHAPES: {
  shape: FaceShape
  label: string
  icon: React.ReactNode
}[] = [
  {
    shape: 'oval',
    label: 'Oval',
    icon: (
      <svg viewBox="0 0 60 80" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <ellipse cx="30" cy="40" rx="22" ry="32" />
      </svg>
    ),
  },
  {
    shape: 'round',
    label: 'Round',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="40" cy="40" r="30" />
      </svg>
    ),
  },
  {
    shape: 'square',
    label: 'Square',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="12" y="12" width="56" height="56" rx="6" />
      </svg>
    ),
  },
  {
    shape: 'heart',
    label: 'Heart',
    icon: (
      <svg viewBox="0 0 80 90" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M40 80 C20 62 6 48 8 28 C10 12 22 5 40 22 C58 5 70 12 72 28 C74 48 60 62 40 80Z" />
      </svg>
    ),
  },
  {
    shape: 'oblong',
    label: 'Oblong',
    icon: (
      <svg viewBox="0 0 60 90" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <ellipse cx="30" cy="45" rx="20" ry="38" />
      </svg>
    ),
  },
]

// ── Placeholder hairstyle data ─────────────────────────────────
// In production: fetch from Supabase with getHairstylesByFaceShape()
const HAIRSTYLE_RECOMMENDATIONS: Record<FaceShape, Hairstyle[]> = {
  oval: [
    { id:'o1', name:'Blunt Bob', slug:'blunt-bob', description:'Clean, minimal bob at the jaw.', image_urls:['https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&q=80'], thumbnail:'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&q=80', face_shapes:['oval'], category:'cut', tags:['bob'], is_featured:true, sort_order:1 },
    { id:'o2', name:'Curtain Bangs', slug:'curtain-bangs', description:'Soft, face-framing fringe.', image_urls:['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80'], thumbnail:'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80', face_shapes:['oval','heart'], category:'cut', tags:['bangs'], is_featured:false, sort_order:2 },
    { id:'o3', name:'Layered Waves', slug:'layered-waves', description:'Soft movement through length.', image_urls:['https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=400&q=80'], thumbnail:'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=400&q=80', face_shapes:['oval','square'], category:'cut', tags:['waves'], is_featured:true, sort_order:3 },
  ],
  round: [
    { id:'r1', name:'Long Layers', slug:'long-layers', description:'Length and movement elongate the face.', image_urls:['https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80'], thumbnail:'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80', face_shapes:['round'], category:'cut', tags:['layers'], is_featured:true, sort_order:1 },
    { id:'r2', name:'Side-Swept Bangs', slug:'side-swept-bangs', description:'Diagonal fringe creates angles.', image_urls:['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80'], thumbnail:'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80', face_shapes:['round','heart'], category:'cut', tags:['bangs'], is_featured:false, sort_order:2 },
    { id:'r3', name:'Textured Lob', slug:'textured-lob', description:'Long bob with weight at the ends.', image_urls:['https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=400&q=80'], thumbnail:'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=400&q=80', face_shapes:['round'], category:'cut', tags:['lob'], is_featured:true, sort_order:3 },
  ],
  square: [
    { id:'s1', name:'Soft Waves', slug:'soft-waves', description:'Flowing waves soften strong angles.', image_urls:['https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&q=80'], thumbnail:'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&q=80', face_shapes:['square'], category:'cut', tags:['waves'], is_featured:true, sort_order:1 },
    { id:'s2', name:'Side Part Lob', slug:'side-part-lob', description:'Asymmetry breaks the square.', image_urls:['https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80'], thumbnail:'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80', face_shapes:['square','oval'], category:'cut', tags:['lob'], is_featured:false, sort_order:2 },
    { id:'s3', name:'Layered Cut', slug:'layered-cut', description:'Movement and texture around the jaw.', image_urls:['https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=400&q=80'], thumbnail:'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=400&q=80', face_shapes:['square'], category:'cut', tags:['layers'], is_featured:true, sort_order:3 },
  ],
  heart: [
    { id:'h1', name:'Chin-Length Bob', slug:'chin-bob', description:'Width at the jaw balances a wide forehead.', image_urls:['https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&q=80'], thumbnail:'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&q=80', face_shapes:['heart'], category:'cut', tags:['bob'], is_featured:true, sort_order:1 },
    { id:'h2', name:'Curtain Bangs', slug:'curtain-bangs-heart', description:'Soften the forehead width.', image_urls:['https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80'], thumbnail:'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80', face_shapes:['heart','oval'], category:'cut', tags:['bangs'], is_featured:false, sort_order:2 },
    { id:'h3', name:'Full Waves Below Chin', slug:'full-waves', description:'Volume below the chin adds balance.', image_urls:['https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=400&q=80'], thumbnail:'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=400&q=80', face_shapes:['heart'], category:'cut', tags:['waves'], is_featured:true, sort_order:3 },
  ],
  oblong: [
    { id:'ob1', name:'Blunt Fringe', slug:'blunt-fringe', description:'A fringe breaks up vertical length.', image_urls:['https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&q=80'], thumbnail:'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&q=80', face_shapes:['oblong'], category:'cut', tags:['fringe'], is_featured:true, sort_order:1 },
    { id:'ob2', name:'Volume Bob', slug:'volume-bob', description:'Width at the sides shortens the face.', image_urls:['https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80'], thumbnail:'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80', face_shapes:['oblong'], category:'cut', tags:['bob'], is_featured:false, sort_order:2 },
    { id:'ob3', name:'Shoulder Waves', slug:'shoulder-waves', description:'Side volume at shoulder length.', image_urls:['https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=400&q=80'], thumbnail:'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=400&q=80', face_shapes:['oblong'], category:'cut', tags:['waves'], is_featured:true, sort_order:3 },
  ],
}

// ── Main component ─────────────────────────────────────────────
export function FaceShapeToolSection() {
  const ref             = useRef<HTMLDivElement>(null)
  const inView          = useInView(ref, { once: true, margin: '-100px 0px' })
  const [selected, setSelected] = useState<FaceShape | null>(null)

  const advice    = selected ? SHAPE_ADVICE[selected] : null
  const hairstyles = selected ? HAIRSTYLE_RECOMMENDATIONS[selected] : []

  return (
    <section
      ref={ref}
      id="face-tool"
      className="bg-carbon section-rhythm overflow-hidden"
      aria-label="Face shape style finder"
    >
      <div className="container-content">

        {/* Header */}
        <motion.div
          className="max-w-xl mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <SectionHeading
            overline="Find Your Style"
            headline="What does your *face shape* say?"
            subtitle="Select your face shape below and instantly discover hairstyles that flatter your features."
            size="section"
          />
        </motion.div>

        {/* Face shape buttons */}
        <motion.div
          className="flex flex-wrap justify-start gap-4 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          role="radiogroup"
          aria-label="Select your face shape"
        >
          {FACE_SHAPES.map((fs, i) => (
            <FaceShapeButton
              key={fs.shape}
              {...fs}
              selected={selected === fs.shape}
              onSelect={() => setSelected(fs.shape)}
              delay={i * 0.07}
              parentInView={inView}
            />
          ))}

          {selected && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSelected(null)}
              className="flex items-center gap-2 text-caption text-mist hover:text-pearl transition-colors duration-200 self-center ml-2"
              aria-label="Reset selection"
            >
              <RefreshCw size={12} />
              Reset
            </motion.button>
          )}
        </motion.div>

        {/* Camera option */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mb-12"
        >
          <Link
            href="/find-your-style"
            className="inline-flex items-center gap-2 text-body-sm text-mist hover:text-gold transition-colors duration-200"
          >
            <Camera size={14} />
            Or use your camera for automatic detection
            <ChevronRight size={12} />
          </Link>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {selected && advice && (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Shape description */}
              <div className="mb-10 p-6 bg-obsidian border border-wire rounded-xl max-w-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="gold">{advice.label} Face</Badge>
                </div>
                <p className="text-body-md text-pearl">{advice.description}</p>
                <p className="text-body-sm text-mist mt-2">
                  <span className="text-gold font-medium">Loves:</span> {advice.love}
                </p>
              </div>

              {/* Recommendations grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {hairstyles.map((hairstyle, i) => (
                  <RecommendationCard key={hairstyle.id} hairstyle={hairstyle} index={i} />
                ))}
              </div>

              {/* CTA */}
              <div className="mt-10 flex gap-4">
                <Button asChild size="lg" className="tracking-widest uppercase text-[0.75rem]"><Link href={`/book?service=signature-cut`}>Book Your Look</Link></Button>
                <Button asChild variant="ghost" size="lg" pulse={false}><Link href="/find-your-style">Full Style Finder →</Link></Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

// ── Face shape button ──────────────────────────────────────────
function FaceShapeButton({
  shape, label, icon, selected, onSelect, delay, parentInView,
}: {
  shape: FaceShape; label: string; icon: React.ReactNode
  selected: boolean; onSelect: () => void; delay: number; parentInView: boolean
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={parentInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.25 + delay }}
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
      aria-label={`${label} face shape`}
      className="flex flex-col items-center gap-3 group cursor-pointer"
    >
      <motion.div
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          background: selected ? 'rgba(201,169,110,0.12)' : 'rgba(34,34,34,1)',
          border: selected ? '1.5px solid rgba(201,169,110,0.6)' : '1.5px solid rgba(44,44,44,1)',
          boxShadow: selected ? '0 0 28px rgba(201,169,110,0.2)' : 'none',
          color: selected ? '#C9A96E' : '#8A8278',
        }}
        whileHover={{
          scale: 1.06,
          borderColor: 'rgba(201,169,110,0.5)',
          color: '#C9A96E',
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <div className="w-7 h-7 sm:w-9 sm:h-9">
          {icon}
        </div>
      </motion.div>
      <span
        className="text-caption uppercase tracking-widest transition-colors duration-200"
        style={{ color: selected ? '#C9A96E' : '#8A8278' }}
      >
        {label}
      </span>
    </motion.button>
  )
}

// ── Recommendation card ────────────────────────────────────────
function RecommendationCard({ hairstyle, index }: { hairstyle: Hairstyle; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/book?service=signature-cut`} className="block">
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-obsidian hover-zoom">
          <Image
            src={hairstyle.thumbnail}
            alt={hairstyle.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors duration-400 flex items-end p-4">
            <motion.span
              className="text-caption uppercase tracking-widest text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              Book This Look →
            </motion.span>
          </div>
        </div>
        <div className="mt-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-body-sm text-chalk font-medium group-hover:text-gold transition-colors duration-200">
              {hairstyle.name}
            </p>
            <p className="text-caption text-mist mt-0.5">{hairstyle.description}</p>
          </div>
          {hairstyle.is_featured && (
            <Badge variant="gold" size="sm">Featured</Badge>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
