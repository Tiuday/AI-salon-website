'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'

const STATS = [
  { value: 250, suffix: '+',  label: 'Clients Served' },
  { value: 98,  suffix: '%',  label: 'Client Satisfaction' },
  { value: 12,  suffix: '',   label: 'Years Experience' },
  { value: 8,   suffix: '+',  label: 'Industry Awards' },
]

export function ManifestoSection() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px 0px' })

  return (
    <section
      id="manifesto"
      ref={ref}
      className="bg-carbon section-rhythm overflow-hidden"
      aria-label="Our story"
    >
      <div className="container-content">
        {/* Top: overline */}
        <motion.span
          className="t-overline flex items-center gap-3 mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-block h-px w-8 bg-gold shrink-0" aria-hidden />
          Our Craft
        </motion.span>

        {/* Main manifesto type — two-line impact */}
        <div className="mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <h2
              className="font-impact uppercase text-chalk"
              style={{
                fontSize: 'clamp(2.8rem, 7vw, 8rem)',
                lineHeight: '0.88',
                letterSpacing: '-0.02em',
              }}
            >
              We Create
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.22 }}
          >
            <h2
              className="font-impact uppercase"
              style={{
                fontSize: 'clamp(2.8rem, 7vw, 8rem)',
                lineHeight: '0.88',
                letterSpacing: '-0.02em',
                color: 'var(--c-ember)',    // ember red accent word
              }}
            >
              Exceptional
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.34 }}
          >
            <h2
              className="font-impact uppercase text-chalk"
              style={{
                fontSize: 'clamp(2.8rem, 7vw, 8rem)',
                lineHeight: '0.88',
                letterSpacing: '-0.02em',
              }}
            >
              Experiences
            </h2>
          </motion.div>
        </div>

        {/* Two-column: body copy + stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-end">

          {/* Left: editorial body text */}
          <motion.p
            className="text-body-lg text-pearl max-w-readable leading-relaxed"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.48 }}
          >
            An innovative studio dedicated to creating striking, distinctive looks.
            From the first consultation to the final blow-dry, every detail is
            considered. Nakshatra works personally with each client — no juniors,
            no shortcuts — just craft at its finest.
          </motion.p>

          {/* Right: stats grid */}
          <div className="grid grid-cols-2 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="flex flex-col gap-1.5"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.5 + i * 0.1,
                }}
              >
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  delay={600 + i * 120}
                  className="font-impact text-chalk"
                  style={{
                    fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                    lineHeight: '1',
                    letterSpacing: '-0.02em',
                  }}
                />
                <span className="t-overline text-mist">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom divider */}
        <motion.div
          className="divider-gold mt-16 lg:mt-20"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
          style={{ transformOrigin: 'left' }}
        />
      </div>
    </section>
  )
}
