'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// ── Stagger container ──────────────────────────────────────────
const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
}

const item = {
  hidden:  { opacity: 0, y: 32 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
}

const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.2, ease: 'easeOut' } },
}

export function HeroSection() {
  const scrollToNext = () => {
    const next = document.getElementById('manifesto')
    next?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      className="relative min-h-screen flex items-end pb-16 sm:pb-24 overflow-hidden bg-ink"
      aria-label="Hero"
    >
      {/* Background image */}
      <motion.div
        className="absolute inset-0"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <Image
          src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1800&q=80"
          alt="Luxury hair salon — editorial photography"
          fill
          priority
          quality={90}
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Gradient scrim — lighter at top, heavy at bottom */}
        <div className="absolute inset-0 scrim-bottom" />
        {/* Subtle gold ambient at base */}
        <div className="absolute bottom-0 left-0 right-0 h-64 gold-ambient" />
      </motion.div>

      {/* Content */}
      <div className="relative z-raised container-content w-full">
        <motion.div
          className="max-w-3xl flex flex-col gap-6"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {/* Overline */}
          <motion.span variants={item} className="t-overline flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-gold shrink-0" aria-hidden />
            Luxury Hair Studio
          </motion.span>

          {/* Main headline */}
          <motion.h1
            variants={item}
            className="font-display text-display-xl text-chalk"
            style={{ lineHeight: '0.92', letterSpacing: '-0.03em' }}
          >
            The Art of
            <br />
            <span className="t-gold italic">Perfect Hair</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p variants={item} className="text-body-lg text-pearl max-w-md">
            Every visit is a ritual. Every cut, a signature.
            Nakshatra Sharma crafts looks that last.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="flex flex-wrap items-center gap-4 mt-2">
            <Button asChild size="lg" className="tracking-widest uppercase text-[0.75rem]"><Link href="/book">Book a Session</Link></Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="tracking-widest uppercase text-[0.75rem]"
            ><Link href="/lookbook" className="flex items-center gap-2">Explore Work<ArrowRight size={14} /></Link></Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToNext}
        aria-label="Scroll to next section"
        className="absolute bottom-8 right-8 sm:right-12 flex flex-col items-center gap-2 text-mist hover:text-gold transition-colors duration-200 cursor-pointer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        whileHover={{ y: 4 }}
      >
        <span className="t-overline hidden sm:block">Scroll</span>
        <ArrowDown size={18} />
      </motion.button>
    </section>
  )
}
