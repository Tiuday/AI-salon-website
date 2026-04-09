'use client'

import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, useInView } from 'framer-motion'
import { Instagram, Youtube, MapPin, Phone, Mail, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'

// ── Form schema ────────────────────────────────────────────────
const contactSchema = z.object({
  name:    z.string().min(2, 'Name must be at least 2 characters'),
  email:   z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
})
type ContactForm = z.infer<typeof contactSchema>

// ── Input shared styles ────────────────────────────────────────
const inputClass =
  'w-full bg-ash border border-wire rounded text-body-sm text-chalk placeholder-dim ' +
  'px-4 py-3 focus:outline-none focus:border-gold/50 focus:bg-obsidian ' +
  'transition-colors duration-200'

export function ContactSection() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px 0px' })

  const {
    register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful }, reset,
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) })

  const onSubmit = async (data: ContactForm) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to send message')
      console.log('Contact form submitted:', data)
      reset()
    } catch (error) {
      console.error(error)
      // Ideally show a toast error here
    }
  }

  return (
    <section
      ref={ref}
      id="contact"
      className="bg-carbon section-rhythm"
      aria-label="Contact"
    >
      <div className="container-content">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Left: heading + form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-8"
          >
            <SectionHeading
              overline="Get in Touch"
              headline="Contact *Us*"
              subtitle="Feel free to reach out with any questions — we'll get back to you as soon as we can."
              size="section"
            />

            {isSubmitSuccessful ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-success/10 border border-success/30 rounded-xl p-6 text-body-md text-chalk"
              >
                ✓ Message sent. We'll be in touch shortly.
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
                noValidate
              >
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-name" className="t-overline">Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Your name"
                    autoComplete="name"
                    className={inputClass}
                    {...register('name')}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-caption text-ember">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-email" className="t-overline">Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={inputClass}
                    {...register('email')}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-caption text-ember">{errors.email.message}</p>
                  )}
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-message" className="t-overline">Message</label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    placeholder="Tell us what you're looking for…"
                    className={inputClass}
                    style={{ resize: 'none' }}
                    {...register('message')}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                  />
                  {errors.message && (
                    <p id="message-error" className="text-caption text-ember">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  loading={isSubmitting}
                  loadingText="Sending…"
                  rightIcon={<Send size={14} />}
                  className="self-start tracking-widest uppercase text-[0.72rem]"
                >
                  Send Message
                </Button>
              </form>
            )}
          </motion.div>

          {/* Right: contact info */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="flex flex-col gap-10 lg:pt-20"
          >
            {/* Address */}
            <div className="flex flex-col gap-5">
              <ContactItem icon={<MapPin size={16} />} label="Visit us">
                <p className="text-body-sm text-pearl">
                  123 Style Street<br />
                  London, W1F 9AB
                </p>
              </ContactItem>

              <ContactItem icon={<Phone size={16} />} label="Call us">
                <a
                  href="tel:+441234567890"
                  className="text-body-sm text-pearl hover:text-gold transition-colors duration-200"
                >
                  +44 1234 567 890
                </a>
              </ContactItem>

              <ContactItem icon={<Mail size={16} />} label="Email us">
                <a
                  href="mailto:hello@nakshatra.com"
                  className="text-body-sm text-pearl hover:text-gold transition-colors duration-200"
                >
                  hello@nakshatra.com
                </a>
              </ContactItem>
            </div>

            {/* Socials */}
            <div className="flex flex-col gap-4">
              <span className="t-overline">Follow the work</span>
              <div className="flex items-center gap-3">
                {[
                  { icon: <Instagram size={16} />, label: 'Instagram', href: 'https://instagram.com' },
                  { icon: <Youtube size={16} />, label: 'YouTube', href: 'https://youtube.com' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex items-center gap-2 px-4 py-2.5 bg-ash border border-wire rounded-full text-body-sm text-mist hover:text-gold hover:border-gold/40 transition-colors duration-200"
                  >
                    {social.icon}
                    <span>{social.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Hours */}
            <div className="flex flex-col gap-3">
              <span className="t-overline">Opening Hours</span>
              {[
                { days: 'Monday – Friday', time: '9:00 – 18:00' },
                { days: 'Saturday',        time: '9:00 – 17:00' },
                { days: 'Sunday',          time: 'Closed' },
              ].map((row) => (
                <div key={row.days} className="flex justify-between items-center text-body-sm border-b border-wire py-2">
                  <span className="text-pearl">{row.days}</span>
                  <span className={row.time === 'Closed' ? 'text-mist' : 'text-gold'}>{row.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function ContactItem({ icon, label, children }: {
  icon: React.ReactNode; label: string; children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-8 h-8 rounded-full bg-ash border border-wire flex items-center justify-center text-gold shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="t-overline">{label}</span>
        {children}
      </div>
    </div>
  )
}
