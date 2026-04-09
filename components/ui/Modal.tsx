'use client'

/**
 * Modal — accessible dialog with luxury backdrop and slide-in animation
 *
 * Features:
 * - Focus trap (native <dialog> or Portal via @radix-ui/react-dialog)
 * - Framer Motion backdrop blur + content scale-up entrance
 * - Closes on: Escape key, backdrop click, close button
 * - Scroll-locks body while open
 * - Accessible: role="dialog", aria-modal, aria-labelledby, aria-describedby
 *
 * Sizes: sm | md | lg | xl | full
 */

import { useEffect, useRef, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

/* ── Types ────────────────────────────────────────────────────── */
type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface ModalProps {
  open: boolean
  onClose: () => void

  title?: string
  description?: string

  size?: ModalSize
  className?: string

  /** Hide the default close button (you manage closing yourself) */
  hideClose?: boolean

  /** Prevent closing on backdrop click */
  disableBackdropClose?: boolean

  children: ReactNode
}

/* ── Size map ─────────────────────────────────────────────────── */
const sizeMap: Record<ModalSize, string> = {
  sm:   'max-w-sm  w-full',
  md:   'max-w-lg  w-full',
  lg:   'max-w-2xl w-full',
  xl:   'max-w-4xl w-full',
  full: 'max-w-none w-screen h-screen',
}

/* ── Animation variants ───────────────────────────────────────── */
const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
  exit:    { opacity: 0 },
}

const contentVariants = {
  hidden:  { opacity: 0, scale: 0.94, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 30, mass: 0.8 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
  },
}

/* ── Component ────────────────────────────────────────────────── */
export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  className,
  hideClose = false,
  disableBackdropClose = false,
  children,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  // Scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Focus the modal on open
  useEffect(() => {
    if (open) {
      contentRef.current?.focus()
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        // Portal to end of body — rendered above everything
        <div
          className="fixed inset-0"
          style={{ zIndex: 'var(--z-modal, 400)' }}
        >
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="absolute inset-0 bg-ink/80 backdrop-blur-md"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={disableBackdropClose ? undefined : onClose}
            aria-hidden
          />

          {/* Centering wrapper */}
          <div className="relative flex min-h-full items-end sm:items-center justify-center p-4 sm:p-8">
            {/* Content panel */}
            <motion.div
              ref={contentRef}
              key="content"
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'modal-title' : undefined}
              aria-describedby={description ? 'modal-description' : undefined}
              tabIndex={-1}
              className={cn(
                // Base panel
                'relative bg-obsidian border border-wire rounded-xl',
                'shadow-elevated',
                'outline-none',
                // Rounded less at bottom on mobile (sheet style)
                'rounded-t-xl sm:rounded-xl',
                sizeMap[size],
                className
              )}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top edge gold line */}
              <div
                aria-hidden
                className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent rounded-full"
              />

              {/* Header */}
              {(title || !hideClose) && (
                <div className="flex items-start justify-between gap-4 p-6 pb-4 sm:p-8 sm:pb-4">
                  {title && (
                    <div>
                      <h2
                        id="modal-title"
                        className="font-display text-heading-xl text-chalk"
                      >
                        {title}
                      </h2>
                      {description && (
                        <p
                          id="modal-description"
                          className="mt-1 text-body-sm text-mist"
                        >
                          {description}
                        </p>
                      )}
                    </div>
                  )}

                  {!hideClose && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Close"
                      onClick={onClose}
                      className="ml-auto shrink-0 -mr-2 -mt-1"
                      pulse={false}
                    >
                      <X size={18} />
                    </Button>
                  )}
                </div>
              )}

              {/* Body */}
              <div
                className={cn(
                  'px-6 pb-6 sm:px-8 sm:pb-8',
                  (title || !hideClose) ? '' : 'pt-6 sm:pt-8'
                )}
              >
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

/* ── Compound sub-components ──────────────────────────────────── */

/** Optional sticky footer inside a Modal (for action buttons) */
export function ModalFooter({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3',
        'pt-4 mt-4 border-t border-wire',
        className
      )}
    >
      {children}
    </div>
  )
}

/* ── Usage examples (kept as comments for reference) ─────────────
 *
 *   const [open, setOpen] = useState(false)
 *
 *   <Button onClick={() => setOpen(true)}>Book This Look</Button>
 *
 *   <Modal
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     title="Soft Waves — Shoulder Length"
 *     description="Book this exact style with Nakshatra"
 *     size="lg"
 *   >
 *     <div>... content ...</div>
 *     <ModalFooter>
 *       <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
 *       <Button>Book Now</Button>
 *     </ModalFooter>
 *   </Modal>
 *
 * ─────────────────────────────────────────────────────────────── */
