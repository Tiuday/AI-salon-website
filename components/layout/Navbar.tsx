'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Services',   href: '/services' },
  { label: 'Lookbook',   href: '/lookbook' },
  { label: 'Find Style', href: '/find-your-style' },
  { label: 'About',      href: '/#about' },
]

const drawerVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0, opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 32, mass: 0.8 },
  },
  exit: {
    x: '100%', opacity: 0,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
}

export function Navbar() {
  const [scrolled,     setScrolled]     = useState(false)
  const [drawerOpen,   setDrawerOpen]   = useState(false)
  const pathname = usePathname()

  // Shrink / solidify on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close drawer on route change
  useEffect(() => setDrawerOpen(false), [pathname])

  // Scroll-lock body when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-sticky',
          'transition-all duration-400 ease-luxury',
          scrolled
            ? 'bg-ink/90 backdrop-blur-xl border-b border-wire/60 py-4'
            : 'bg-transparent py-6'
        )}
      >
        <nav
          className="container-content flex items-center justify-between"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            href="/"
            className="font-display text-[1.1rem] tracking-[-0.01em] text-chalk hover:text-gold transition-colors duration-200"
            aria-label="Nakshatra Sharma — Home"
          >
            Nakshatra Sharma
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'font-sans text-body-sm tracking-wide',
                    'transition-colors duration-200',
                    'hover:text-gold',
                    pathname === link.href ? 'text-gold' : 'text-pearl'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button
              asChild
              size="sm"
              variant="primary"
              pulse={false}
              className="tracking-widest uppercase text-[0.7rem]"
            ><Link href="/book">Book Now</Link></Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 text-chalk"
            onClick={() => setDrawerOpen((o) => !o)}
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={drawerOpen}
          >
            {drawerOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 bg-ink/70 backdrop-blur-sm z-overlay md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              aria-hidden
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              className="fixed top-0 right-0 bottom-0 w-72 bg-obsidian border-l border-wire z-modal md:hidden flex flex-col"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Top — logo + close */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-wire">
                <span className="font-display text-[1rem] text-chalk">Menu</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="text-mist hover:text-chalk transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Links */}
              <nav className="flex-1 flex flex-col justify-center px-8 gap-2">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        'block py-3 font-display text-display-md',
                        'transition-colors duration-200 hover:text-gold',
                        pathname === link.href ? 'text-gold' : 'text-chalk'
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Bottom CTA */}
              <div className="px-8 py-8 border-t border-wire">
                <Button asChild size="lg" className="w-full tracking-widest uppercase text-[0.75rem]"><Link href="/book">Book an Appointment</Link></Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
