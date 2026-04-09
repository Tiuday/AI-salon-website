'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const PRICING_TIERS = [
  {
    name:        'Essential',
    tagline:     'Perfect for a refresh',
    price:       'From £25',
    badge:       null,
    featured:    false,
    includes: [
      'Fringe & tidy trim',
      'Consultation',
      'Style finish',
      'Product advice',
    ],
    cta:         'Book Essential',
    href:        '/book?service=fringe-tidy',
  },
  {
    name:        'Signature',
    tagline:     'The full experience',
    price:       'From £55',
    badge:       'Most Popular',
    featured:    true,
    includes: [
      'Everything in Essential',
      'Precision cut to face shape',
      'Wash & deep condition',
      'Blow-dry & style',
      'Personalised aftercare plan',
    ],
    cta:         'Book Signature',
    href:        '/book?service=signature-cut',
  },
  {
    name:        'Transformation',
    tagline:     'Colour & cut combined',
    price:       'From £130',
    badge:       null,
    featured:    false,
    includes: [
      'Everything in Signature',
      'Balayage or full colour',
      'Toner for depth & shine',
      'Olaplex bond treatment',
      'Priority booking access',
    ],
    cta:         'Book Transformation',
    href:        '/book?service=balayage',
  },
]

export function PricingSection() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px 0px' })

  return (
    <section
      ref={ref}
      className="bg-ink section-rhythm"
      aria-label="Pricing"
    >
      <div className="container-content">

        {/* Header */}
        <motion.div
          className="text-center mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <SectionHeading
            overline="Pricing"
            headline="Simple. *Transparent.* Honest."
            subtitle="No hidden fees, no surprises. Every service includes a consultation."
            align="center"
            size="section"
          />
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {PRICING_TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.15 + i * 0.12,
              }}
              className={tier.featured ? 'pricing-card--featured pricing-card relative' : 'pricing-card relative'}
            >
              {/* Featured badge */}
              {tier.badge && (
                <div className="absolute -top-3.5 left-6">
                  <Badge variant="gold">{tier.badge}</Badge>
                </div>
              )}

              {/* Tier name */}
              <div className="flex flex-col gap-1">
                <h3 className="font-display text-heading-xl text-chalk">{tier.name}</h3>
                <p className="text-body-sm text-mist">{tier.tagline}</p>
              </div>

              {/* Price */}
              <div className="py-5 border-t border-b border-wire">
                <span
                  className="font-impact text-chalk"
                  style={{
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {tier.price}
                </span>
                <span className="text-body-sm text-mist ml-2">per session</span>
              </div>

              {/* Includes */}
              <ul className="flex flex-col gap-3 flex-1" role="list">
                {tier.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-body-sm text-pearl">
                    <Check
                      size={14}
                      className="shrink-0 mt-0.5 text-gold"
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                asChild
                variant={tier.featured ? 'primary' : 'ghost'}
                size="md"
                className="w-full tracking-widest uppercase text-[0.7rem] mt-2"
                pulse={tier.featured}
                rightIcon={<ArrowRight size={13} />}
              >
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Footnote */}
        <motion.p
          className="text-caption text-dim text-center mt-8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          All prices include consultation. Colour services may vary based on hair length and density.{' '}
          <Link href="/services" className="text-mist hover:text-pearl transition-colors duration-200 underline underline-offset-2">
            View full price list →
          </Link>
        </motion.p>
      </div>
    </section>
  )
}
