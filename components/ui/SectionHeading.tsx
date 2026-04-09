/**
 * SectionHeading — reusable heading block for every section
 *
 * Anatomy:
 *   [overline label]     ← small uppercase pill above
 *   [headline]           ← Playfair Display or Anton, can contain an <accent> word
 *   [subtitle]           ← optional body text beneath
 *
 * Headline accent: wrap one word in **asterisks** to auto-style it in gold or ember.
 *   "The Art of *Perfect* Hair" → "Perfect" renders in gold gradient
 *
 * Alignment: left | center | right
 */

import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/* ── Types ────────────────────────────────────────────────────── */
type HeadingSize    = 'display' | 'hero' | 'section' | 'card'
type HeadingFont    = 'display' | 'impact' | 'sans'
type HeadingAccent  = 'gold' | 'ember' | 'none'
type HeadingAlign   = 'left' | 'center' | 'right'

export interface SectionHeadingProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The main headline. Wrap a word in *asterisks* to apply the accent colour.
   * e.g.  "A cut *above* the rest"
   */
  headline: string

  /** Small uppercase label above the headline */
  overline?: string

  /** Body copy beneath the headline */
  subtitle?: string

  /** Font size of the headline */
  size?: HeadingSize

  /** Typeface family */
  font?: HeadingFont

  /** Accent colour for the starred word */
  accent?: HeadingAccent

  /** Text alignment */
  align?: HeadingAlign

  /** Max-width cap on subtitle for readability (applied when align="center") */
  subtitleMax?: string

  /** HTML heading level */
  as?: 'h1' | 'h2' | 'h3' | 'h4'
}

/* ── Style maps ───────────────────────────────────────────────── */
const sizeMap: Record<HeadingSize, string> = {
  display: 't-display-2xl',
  hero:    't-display-xl',
  section: 't-display-lg',
  card:    't-display-md',
}

const fontMap: Record<HeadingFont, string> = {
  display: 'font-display',
  impact:  't-impact-xl font-impact uppercase',
  sans:    'font-sans font-semibold',
}

const accentMap: Record<HeadingAccent, string> = {
  gold:  't-gold',
  ember: 'text-ember',
  none:  '',
}

const alignMap: Record<HeadingAlign, string> = {
  left:   'items-start text-left',
  center: 'items-center text-center',
  right:  'items-end text-right',
}

/* ── Accent word parser ───────────────────────────────────────── */
function parseHeadline(text: string, accentClass: string): React.ReactNode[] {
  // Split on *word* markers
  const parts = text.split(/\*([^*]+)\*/)
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      // Odd indexes are inside the *...* markers
      return (
        <span key={i} className={accentClass}>
          {part}
        </span>
      )
    }
    return part
  })
}

/* ── Component ────────────────────────────────────────────────── */
export function SectionHeading({
  headline,
  overline,
  subtitle,
  size = 'section',
  font = 'display',
  accent = 'gold',
  align = 'left',
  subtitleMax = '52ch',
  as: Tag = 'h2',
  className,
  ...props
}: SectionHeadingProps) {
  const accentClass  = accentMap[accent]
  const headlineNode = parseHeadline(headline, accentClass)
  const alignClass   = alignMap[align]

  return (
    <div
      className={cn('flex flex-col gap-4', alignClass, className)}
      {...props}
    >
      {/* Overline */}
      {overline && (
        <span className="t-overline flex items-center gap-3">
          {/* Gold tick mark before overline */}
          <span className="inline-block h-px w-8 bg-gold shrink-0" aria-hidden />
          {overline}
        </span>
      )}

      {/* Headline */}
      <Tag
        className={cn(
          sizeMap[size],
          fontMap[font],
          'text-chalk',
          // Impact font is uppercase by default; display font keeps casing
          font === 'display' && 'tracking-[-0.025em]'
        )}
      >
        {headlineNode}
      </Tag>

      {/* Subtitle */}
      {subtitle && (
        <p
          className="t-body-lg text-pearl"
          style={
            align === 'center'
              ? { maxWidth: subtitleMax, marginLeft: 'auto', marginRight: 'auto' }
              : { maxWidth: subtitleMax }
          }
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}

/* ── Usage examples (kept as comments for reference) ─────────────
 *
 * Section headings:
 *
 *   <SectionHeading
 *     overline="Our Craft"
 *     headline="The Art of *Perfect* Hair"
 *     subtitle="Every visit is a ritual. Every cut, a signature."
 *     size="section"
 *   />
 *
 *   <SectionHeading
 *     headline="*Exceptional* Is the Standard"
 *     font="impact"
 *     accent="ember"
 *     size="display"
 *   />
 *
 *   <SectionHeading
 *     overline="Testimonials"
 *     headline="Love letters to *Nakshatra*"
 *     align="center"
 *     subtitle="What clients say after their first session — and why they keep coming back."
 *   />
 *
 * ─────────────────────────────────────────────────────────────── */
