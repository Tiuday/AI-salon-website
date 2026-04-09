'use client'

/**
 * AnimatedCounter — count-up number that fires when scrolled into view
 *
 * Used in ManifestoSection for stats like "250+ Clients", "98% Satisfaction"
 *
 * Implementation:
 * - Framer Motion `useInView` detects viewport entry
 * - `useSpring` with custom stiffness drives a smooth count-up
 * - `useTransform` converts the spring value to a formatted display string
 * - Only animates once (once: true)
 */

import { useRef, useEffect, useState } from 'react'
import {
  useInView,
  useSpring,
  useTransform,
  motion,
  type MotionValue,
} from 'framer-motion'
import { cn } from '@/lib/utils'

/* ── Types ────────────────────────────────────────────────────── */
export interface AnimatedCounterProps {
  /** The final value to count up to */
  value: number

  /** String prefix — displayed immediately (e.g. "£") */
  prefix?: string

  /** String suffix — displayed immediately (e.g. "+", "%", "K") */
  suffix?: string

  /** Decimal places for the formatted number */
  decimals?: number

  /** Duration in seconds for the full count-up */
  duration?: number

  /** Delay in ms before animation starts (useful for stagger) */
  delay?: number

  /** Typography class applied to the number */
  className?: string

  /** Inline styles applied to the wrapper span */
  style?: React.CSSProperties

  /** Class for the prefix/suffix spans */
  unitClassName?: string
}

/* ── Inner animated span ──────────────────────────────────────── */
function Counter({
  value,
  spring,
  decimals,
  prefix,
  suffix,
  unitClassName,
}: {
  value: number
  spring: MotionValue<number>
  decimals: number
  prefix?: string
  suffix?: string
  unitClassName?: string
}) {
  const display = useTransform(spring, (v) =>
    v.toLocaleString('en-GB', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  )

  return (
    <>
      {prefix && (
        <span className={cn('font-display', unitClassName)} aria-hidden>
          {prefix}
        </span>
      )}
      <motion.span>{display}</motion.span>
      {suffix && (
        <span className={cn('font-display', unitClassName)} aria-hidden>
          {suffix}
        </span>
      )}
    </>
  )
}

/* ── Main component ───────────────────────────────────────────── */
export function AnimatedCounter({
  value,
  prefix,
  suffix,
  decimals = 0,
  duration = 1.8,
  delay = 0,
  className,
  style,
  unitClassName,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px 0px' })
  const [hasStarted, setHasStarted] = useState(false)

  // Spring stiffness/damping tuned to feel premium — smooth decelerate
  const spring = useSpring(0, {
    stiffness: 60 / duration,     // slower = lower stiffness
    damping: 18,
    restDelta: 0.01,
  })

  useEffect(() => {
    if (isInView && !hasStarted) {
      const timer = setTimeout(() => {
        spring.set(value)
        setHasStarted(true)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [isInView, hasStarted, spring, value, delay])

  return (
    <span
      ref={ref}
      className={cn('stat-number tabular-nums', className)}
      style={style}
      aria-label={`${prefix ?? ''}${value}${suffix ?? ''}`}
    >
      <Counter
        value={value}
        spring={spring}
        decimals={decimals}
        prefix={prefix}
        suffix={suffix}
        unitClassName={unitClassName}
      />
    </span>
  )
}

/* ── Usage examples (kept as comments for reference) ─────────────
 *
 *   <AnimatedCounter value={250} suffix="+" />
 *   <AnimatedCounter value={98} suffix="%" delay={150} />
 *   <AnimatedCounter value={12} suffix=" yrs" delay={300} />
 *   <AnimatedCounter value={50} suffix="+" delay={450} />
 *
 *   Typical ManifestoSection usage:
 *
 *   const stats = [
 *     { value: 250, suffix: '+',  label: 'Happy Clients' },
 *     { value: 98,  suffix: '%',  label: 'Client Satisfaction' },
 *     { value: 12,  suffix: '',   label: 'Years Experience' },
 *     { value: 8,   suffix: '+',  label: 'Industry Awards' },
 *   ]
 *
 *   {stats.map((s, i) => (
 *     <div key={i} className="flex flex-col gap-2">
 *       <AnimatedCounter value={s.value} suffix={s.suffix} delay={i * 120} />
 *       <span className="stat-label">{s.label}</span>
 *     </div>
 *   ))}
 *
 * ─────────────────────────────────────────────────────────────── */
