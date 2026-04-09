'use client'

/**
 * Button — premium salon design system component
 *
 * Variants:  primary | ghost | text | danger | gold-outline
 * Sizes:     sm | md | lg | xl | icon
 *
 * Micro-interactions (Framer Motion):
 * - whileHover: subtle scale up (1.02) + cursor pointer
 * - whileTap:   scale down (0.97) — confirms the press
 * - primary:    continuous gold-pulse glow on idle
 * - Disabled:   no motion, reduced opacity
 */

import React, { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

/* ── Variant map ──────────────────────────────────────────────── */
const buttonVariants = cva(
  // Base — shared across all variants
  [
    'relative inline-flex items-center justify-center gap-2.5',
    'font-sans font-medium tracking-wide',
    'cursor-pointer select-none',
    'overflow-hidden',               // contain the shimmer pseudo
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
    'focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-gold focus-visible:outline-offset-3',
    // Transition everything
    'transition-all duration-300 ease-luxury',
  ],
  {
    variants: {
      variant: {
        /**
         * primary — filled gold, glows on hover
         * Used for: "Book Now", "Book a Session", all primary CTAs
         */
        primary: [
          'bg-gradient-gold text-ink',
          'shadow-gold',
          'hover:shadow-gold-strong',
          'hover:brightness-105',
          'active:brightness-90 active:scale-[0.98]',
        ],

        /**
         * ghost — transparent with chalk border, turns gold on hover
         * Used for: secondary CTAs, "Explore Work", "View All"
         */
        ghost: [
          'bg-transparent text-chalk',
          'border border-wire',
          'hover:border-gold/50 hover:text-gold hover:bg-gold/[0.04]',
          'active:bg-gold/[0.08]',
        ],

        /**
         * gold-outline — gold border, transparent fill
         * Used for: nav CTA at low prominence, filter pills
         */
        'gold-outline': [
          'bg-transparent text-gold',
          'border border-gold/30',
          'hover:border-gold hover:bg-gold/[0.06]',
          'active:bg-gold/[0.12]',
        ],

        /**
         * text — no border, no bg, underlines on hover
         * Used for: inline links, "See more", "Learn more"
         */
        text: [
          'bg-transparent text-chalk',
          'underline-offset-4',
          'hover:text-gold hover:underline',
          'active:opacity-70',
        ],

        /**
         * danger — ember red, for destructive actions
         */
        danger: [
          'bg-ember text-chalk',
          'shadow-ember',
          'hover:bg-ember-light',
          'active:bg-ember-dark active:scale-[0.98]',
        ],
      },

      size: {
        sm:   'h-8 px-4 text-body-sm rounded',
        md:   'h-11 px-6 text-body-sm rounded',
        lg:   'h-[3.25rem] px-8 text-body-md rounded-md',
        xl:   'h-16 px-10 text-body-lg rounded-md',
        icon: 'h-11 w-11 rounded-full p-0',
      },
    },

    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

/* ── Framer Motion variants ───────────────────────────────────── */
const motionVariants = {
  primary: {
    rest:  { scale: 1 },
    hover: { scale: 1.025 },
    tap:   { scale: 0.970 },
  },
  ghost: {
    rest:  { scale: 1 },
    hover: { scale: 1.015 },
    tap:   { scale: 0.975 },
  },
  'gold-outline': {
    rest:  { scale: 1 },
    hover: { scale: 1.015 },
    tap:   { scale: 0.975 },
  },
  text: {
    rest:  { x: 0 },
    hover: { x: 2 },
    tap:   { x: 0 },
  },
  danger: {
    rest:  { scale: 1 },
    hover: { scale: 1.02 },
    tap:   { scale: 0.97 },
  },
}

/* ── Component ────────────────────────────────────────────────── */
export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'>,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  /**
   * Show the idle gold-pulse animation (primary CTAs)
   * Default: true for primary variant
   */
  pulse?: boolean
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      pulse,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const v = variant ?? 'primary'
    const isDisabled = disabled || loading
    const mv = motionVariants[v as keyof typeof motionVariants] ?? motionVariants.primary
    const shouldPulse = pulse ?? v === 'primary'

    const Comp = asChild ? motion.create(Slot) : motion.button

    // For asChild, we must ensure exactly ONE valid React element is passed to Slot.
    // We filter out any whitespace-only text nodes or fragments.
    const validChildren = asChild 
      ? React.Children.toArray(children).find((c) => React.isValidElement(c))
      : children

    return (
      <Comp
        ref={ref}
        className={cn(
          buttonVariants({ variant: v, size }),
          shouldPulse && !isDisabled && 'animate-gold-pulse',
          className
        )}
        disabled={isDisabled}
        initial="rest"
        whileHover={isDisabled ? undefined : 'hover'}
        whileTap={isDisabled ? undefined : 'tap'}
        variants={mv}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
          mass: 0.8,
        }}
        {...props}
      >
        {asChild ? (
          validChildren
        ) : (
          <>
            {/* Shimmer sweep on hover (primary only) */}
            {v === 'primary' && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-shimmer bg-[length:200%_100%] opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"
              />
            )}

            {/* Content */}
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                <span>{loadingText ?? children}</span>
              </>
            ) : (
              <>
                {leftIcon && <span className="shrink-0">{leftIcon}</span>}
                {children && <span>{children}</span>}
                {rightIcon && <span className="shrink-0">{rightIcon}</span>}
              </>
            )}
          </>
        )}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }

/* ── Usage examples (kept as comments for reference) ─────────────
 *
 * <Button>Book Now</Button>
 * <Button variant="ghost">Explore Work</Button>
 * <Button variant="gold-outline" size="sm">View Pricing</Button>
 * <Button variant="text" rightIcon={<ArrowRight size={16} />}>See all styles</Button>
 * <Button size="icon" variant="ghost" aria-label="Close"><X size={18} /></Button>
 * <Button loading loadingText="Booking...">Confirm</Button>
 *
 * ─────────────────────────────────────────────────────────────── */
