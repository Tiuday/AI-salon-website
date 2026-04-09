'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Clock } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import type { Service } from '@/types'

// ── Static fallback data ───────────────────────────────────────
// Replace with live Supabase data passed as props from server component
const FALLBACK_SERVICES: Service[] = [
  {
    id: '1', slug: 'signature-cut', name: 'Signature Cut', category: 'cut',
    description: 'Precision cut tailored to your face shape. Includes wash, cut, and blow-dry.',
    includes: ['Consultation', 'Precision cut', 'Blow-dry & style'],
    duration_min: 60, price_from: 55, is_featured: true, sort_order: 1, created_at: '',
  },
  {
    id: '2', slug: 'balayage', name: 'Balayage / Ombré', category: 'color',
    description: 'Hand-painted highlights for a lived-in, dimensional look.',
    includes: ['Balayage placement', 'Toner', 'Blow-dry'],
    duration_min: 150, price_from: 130, price_to: 180, is_featured: true, sort_order: 4, created_at: '',
  },
  {
    id: '3', slug: 'keratin-treatment', name: 'Keratin Treatment', category: 'treatment',
    description: 'Smooth, de-frizz, and strengthen. Results last 3–5 months.',
    includes: ['Deep cleanse', 'Keratin application', 'Sealing iron'],
    duration_min: 120, price_from: 150, price_to: 200, is_featured: true, sort_order: 6, created_at: '',
  },
]

interface Props {
  services?: Service[]
}

export function ServicesPreviewSection({ services = FALLBACK_SERVICES }: Props) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px 0px' })

  return (
    <section ref={ref} className="bg-ink section-rhythm" aria-label="Services preview">
      <div className="container-content">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionHeading
              overline="What We Offer"
              headline="Services built around *you*"
              size="section"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="shrink-0"
          >
            <Button
              asChild
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight size={14} />}
              pulse={false}
            ><Link href="/services">View all services</Link></Button>
          </motion.div>
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {services.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Service Card ───────────────────────────────────────────────
function ServiceCard({
  service,
  index,
  inView,
}: {
  service: Service
  index: number
  inView: boolean
}) {
  const categoryLabel =
    service.category.charAt(0).toUpperCase() + service.category.slice(1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.2 + index * 0.12,
      }}
    >
      <Link
        href={`/book?service=${service.slug}`}
        className="service-card group block h-full"
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-heading-xl text-chalk group-hover:text-gold transition-colors duration-300">
            {service.name}
          </h3>
          <Badge variant="muted" size="sm">{categoryLabel}</Badge>
        </div>

        {/* Description */}
        <p className="text-body-sm text-mist leading-relaxed mt-3 flex-1">
          {service.description}
        </p>

        {/* What's included */}
        <ul className="flex flex-col gap-1.5 mt-5" role="list">
          {service.includes.map((item) => (
            <li key={item} className="flex items-center gap-2 text-body-sm text-pearl">
              <span className="w-1 h-1 rounded-full bg-gold shrink-0" aria-hidden />
              {item}
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-6 border-t border-wire">
          <div className="flex items-center gap-1.5 text-caption text-mist">
            <Clock size={12} aria-hidden />
            <span>{service.duration_min} min</span>
          </div>
          <div className="font-sans text-body-sm font-medium text-gold">
            {formatPrice(service.price_from, service.price_to)}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
