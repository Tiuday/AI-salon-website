import Link from 'next/link'
import { Instagram, Youtube } from 'lucide-react'

const SERVICES = [
  { label: 'Signature Cut',       href: '/services#signature-cut' },
  { label: 'Balayage',            href: '/services#balayage' },
  { label: 'Keratin Treatment',   href: '/services#keratin-treatment' },
  { label: 'Bridal Hair',         href: '/services#bridal-hair' },
  { label: 'Full Colour',         href: '/services#full-colour' },
]

const NAVIGATION = [
  { label: 'Services',        href: '/services' },
  { label: 'Lookbook',        href: '/lookbook' },
  { label: 'Find My Style',   href: '/find-your-style' },
  { label: 'Book Now',        href: '/book' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-carbon border-t border-wire" aria-label="Site footer">

      {/* Main footer content */}
      <div className="container-content py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Brand column */}
          <div className="lg:col-span-2 flex flex-col gap-5 max-w-xs">
            <h2 className="font-display text-heading-xl text-chalk">
              Nakshatra Sharma
            </h2>
            <p className="text-body-sm text-mist leading-relaxed">
              Luxury hair studio. Precision cuts, transformative colour,
              and styling that honours your individuality.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-wire flex items-center justify-center text-mist hover:text-gold hover:border-gold/40 transition-colors duration-200"
              >
                <Instagram size={15} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full border border-wire flex items-center justify-center text-mist hover:text-gold hover:border-gold/40 transition-colors duration-200"
              >
                <Youtube size={15} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="flex flex-col gap-4">
            <h3 className="t-overline">Services</h3>
            <ul className="flex flex-col gap-2.5" role="list">
              {SERVICES.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-body-sm text-mist hover:text-pearl transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation + contact */}
          <div className="flex flex-col gap-4">
            <h3 className="t-overline">Navigate</h3>
            <ul className="flex flex-col gap-2.5" role="list">
              {NAVIGATION.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-body-sm text-mist hover:text-pearl transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-4 border-t border-wire flex flex-col gap-1.5">
              <a
                href="mailto:hello@nakshatra.com"
                className="text-body-sm text-mist hover:text-pearl transition-colors duration-200"
              >
                hello@nakshatra.com
              </a>
              <a
                href="tel:+441234567890"
                className="text-body-sm text-mist hover:text-pearl transition-colors duration-200"
              >
                +44 1234 567 890
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-wire">
        <div className="container-content py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-caption text-dim">
            © {year} Nakshatra Sharma. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-caption text-dim hover:text-mist transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-caption text-dim hover:text-mist transition-colors duration-200">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
