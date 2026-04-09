/**
 * Badge — small label chip for tags, status, categories
 *
 * Variants:  gold | muted | ember | outline | outline-gold
 * Sizes:     sm | md
 */

import { type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1.5',
    'font-sans text-overline uppercase tracking-[0.12em] font-medium',
    'rounded-full leading-none',
    'transition-colors duration-200',
  ],
  {
    variants: {
      variant: {
        /** Subtle gold — "Popular", "Recommended" */
        gold: [
          'bg-gold/10 text-gold',
          'border border-gold/20',
        ],

        /** Neutral muted — categories, filters */
        muted: [
          'bg-ash text-mist',
          'border border-wire',
        ],

        /** Ember red — "New", "Limited", alerts */
        ember: [
          'bg-ember/10 text-ember-light',
          'border border-ember/20',
        ],

        /** Chalk outline — minimal on dark bg */
        outline: [
          'bg-transparent text-pearl',
          'border border-wire',
          'hover:border-gold/40 hover:text-gold',
        ],

        /** Gold outline — feature call-out */
        'outline-gold': [
          'bg-transparent text-gold',
          'border border-gold/40',
        ],

        /** Filled chalk on dark bg */
        solid: [
          'bg-ash text-chalk',
          'border border-wire',
        ],
      },

      size: {
        sm: 'px-2.5 py-1 text-[0.6rem]',
        md: 'px-3 py-1.5 text-overline',
      },
    },

    defaultVariants: {
      variant: 'muted',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Optional leading dot indicator */
  dot?: boolean
  dotColor?: string
}

export function Badge({
  className,
  variant,
  size,
  dot,
  dotColor,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
          style={{ backgroundColor: dotColor ?? 'currentColor' }}
        />
      )}
      {children}
    </span>
  )
}

/* ── Usage examples (kept as comments for reference) ─────────────
 *
 *   <Badge variant="gold">Popular</Badge>
 *   <Badge variant="ember" size="sm">New</Badge>
 *   <Badge variant="outline">Color</Badge>
 *   <Badge variant="gold" dot>Recommended</Badge>
 *   <Badge variant="muted">Bridal</Badge>
 *
 * ─────────────────────────────────────────────────────────────── */
