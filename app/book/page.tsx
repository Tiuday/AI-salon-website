'use client'

/**
 * /book — Appointment Booking Page
 *
 * Flow:
 *   Step 1: Select service (pre-filled from URL ?service=slug)
 *   Step 2: Pick date on calendar
 *   Step 3: Select time slot
 *   Step 4: Fill in details (name, email, phone, notes)
 *   Step 5: Confirmation screen
 *
 * URL params supported:
 *   ?service=slug    — pre-selects a service
 *   ?date=YYYY-MM-DD — pre-selects a date
 *   ?time=HH:MM      — pre-selects a time
 */

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Check, Clock, Calendar,
  User, Mail, Phone, FileText, ArrowRight, Loader2, Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { cn, formatPrice } from '@/lib/utils'
import { addMonths, subMonths, format, startOfMonth, endOfMonth,
         eachDayOfInterval, isSameMonth, isToday, isBefore, startOfToday,
         parseISO, isSameDay } from 'date-fns'

// ── Static services (replace with Supabase in prod) ───────────
const SERVICES = [
  { id:'1', slug:'fringe-tidy',         name:'Fringe & Tidy',      category:'cut',       duration_min:30,  price_from:25,  price_to:undefined },
  { id:'2', slug:'signature-cut',       name:'Signature Cut',      category:'cut',       duration_min:60,  price_from:55,  price_to:undefined },
  { id:'3', slug:'full-colour',         name:'Full Colour',        category:'color',     duration_min:120, price_from:95,  price_to:140 },
  { id:'4', slug:'balayage',            name:'Balayage / Ombré',   category:'color',     duration_min:150, price_from:130, price_to:180 },
  { id:'5', slug:'toning-gloss',        name:'Toning & Gloss',     category:'color',     duration_min:45,  price_from:40,  price_to:undefined },
  { id:'6', slug:'keratin-treatment',   name:'Keratin Treatment',  category:'treatment', duration_min:120, price_from:150, price_to:200 },
  { id:'7', slug:'deep-conditioning',   name:'Deep Conditioning',  category:'treatment', duration_min:60,  price_from:45,  price_to:undefined },
  { id:'8', slug:'bridal-hair',         name:'Bridal Hair',        category:'bridal',    duration_min:180, price_from:250, price_to:350 },
  { id:'9', slug:'occasion-styling',    name:'Occasion Styling',   category:'styling',   duration_min:60,  price_from:65,  price_to:undefined },
]

// ── Booking form schema ────────────────────────────────────────
const bookingSchema = z.object({
  name:  z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  notes: z.string().max(500).optional(),
})
type BookingFormData = z.infer<typeof bookingSchema>

// ── Shared input style ─────────────────────────────────────────
const inputCls =
  'w-full bg-ash border border-wire rounded text-body-sm text-chalk placeholder-dim ' +
  'px-4 py-3 focus:outline-none focus:border-gold/50 focus:bg-obsidian ' +
  'transition-colors duration-200'

type Step = 1 | 2 | 3 | 4 | 5

function BookingContent() {
  const params = useSearchParams()

  // Step state
  const [step, setStep] = useState<Step>(1)

  // Selections
  const [selectedService, setSelectedService] = useState(
    SERVICES.find((s) => s.slug === params.get('service')) ?? null
  )
  const [selectedDate, setSelectedDate]   = useState<Date | null>(
    params.get('date') ? parseISO(params.get('date')!) : null
  )
  const [selectedTime, setSelectedTime]   = useState<string | null>(params.get('time'))
  const [timeSlots,    setTimeSlots]      = useState<{ time: string; available: boolean }[]>([])
  const [loadingSlots, setLoadingSlots]   = useState(false)
  const [currentMonth, setCurrentMonth]  = useState(selectedDate ?? new Date())
  const [bookingResult, setBookingResult] = useState<{ appointment_id: string; service_name: string; date: string; time_slot: string } | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  })

  // ── Auto-advance when pre-filled from URL ───────────────────
  useEffect(() => {
    if (selectedService && selectedDate && selectedTime) setStep(4)
    else if (selectedService && selectedDate)             setStep(3)
    else if (selectedService)                             setStep(2)
  }, [])

  // ── Fetch time slots when date + service selected ───────────
  const fetchSlots = useCallback(async () => {
    if (!selectedDate || !selectedService) return
    setLoadingSlots(true)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const res = await fetch(
        `/api/appointments?date=${dateStr}&service_id=${selectedService.id}`
      )
      if (res.ok) {
        const data = await res.json()
        setTimeSlots(data.slots)
      } else {
        // Fallback mock slots
        setTimeSlots(generateMockSlots(selectedService.duration_min))
      }
    } catch {
      setTimeSlots(generateMockSlots(selectedService.duration_min))
    } finally {
      setLoadingSlots(false)
    }
  }, [selectedDate, selectedService])

  useEffect(() => { fetchSlots() }, [fetchSlots])

  // ── Submit booking ───────────────────────────────────────────
  const onSubmit = async (data: BookingFormData) => {
    if (!selectedService || !selectedDate || !selectedTime) return

    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id:   selectedService.id,
        date:         format(selectedDate, 'yyyy-MM-dd'),
        time_slot:    selectedTime,
        client_name:  data.name,
        client_email: data.email,
        client_phone: data.phone ?? null,
        notes:        data.notes ?? null,
      }),
    })

    if (res.ok) {
      const result = await res.json()
      setBookingResult(result.data)
      setStep(5)
    } else {
      const err = await res.json()
      if (err.code === 'SLOT_UNAVAILABLE') {
        alert('That slot was just taken — please choose another time.')
        setStep(3)
      }
    }
  }

  // ── Calendar helpers ─────────────────────────────────────────
  const calendarDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end:   endOfMonth(currentMonth),
  })
  const today = startOfToday()

  return (
    <div className="min-h-screen bg-ink pt-[72px]">
      <div className="container-content section-rhythm max-w-content">

        {/* Page heading */}
        <div className="mb-10">
          <SectionHeading
            overline="Online Booking"
            headline="Reserve your *appointment*"
            subtitle="Choose your service, select a date and time, and we'll confirm by email."
            size="section"
          />
        </div>

        {/* Progress indicator */}
        {step < 5 && (
          <div className="flex items-center gap-2 mb-10" role="list" aria-label="Booking steps">
            {(['Service', 'Date', 'Time', 'Details'] as const).map((label, i) => {
              const s = (i + 1) as Step
              const done = step > s
              const active = step === s
              return (
                <div key={label} className="flex items-center gap-2" role="listitem">
                  <div className={cn(
                    'flex items-center justify-center w-7 h-7 rounded-full text-caption font-medium transition-all duration-300',
                    done   ? 'bg-gold text-ink' :
                    active ? 'bg-gold/20 border border-gold text-gold' :
                             'bg-ash border border-wire text-mist'
                  )}>
                    {done ? <Check size={12} /> : i + 1}
                  </div>
                  <span className={cn(
                    'text-caption hidden sm:block transition-colors duration-200',
                    active ? 'text-chalk' : done ? 'text-gold' : 'text-mist'
                  )}>
                    {label}
                  </span>
                  {i < 3 && (
                    <div className={cn(
                      'h-px flex-1 min-w-[16px] transition-colors duration-300',
                      done ? 'bg-gold/60' : 'bg-wire'
                    )} aria-hidden />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Step content */}
        <AnimatePresence mode="wait">
          {/* ── Step 1: Service ─────────────────────────────── */}
          {step === 1 && (
            <StepPanel key="step1">
              <h2 className="font-display text-heading-xl text-chalk mb-6">
                Choose your service
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SERVICES.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => { setSelectedService(svc); setStep(2) }}
                    className={cn(
                      'text-left p-5 rounded-xl border transition-all duration-250',
                      selectedService?.id === svc.id
                        ? 'border-gold/50 bg-gold/[0.06] shadow-gold'
                        : 'border-wire bg-obsidian hover:border-gold/30 hover:bg-gold/[0.03]'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-body-sm text-chalk font-medium">{svc.name}</p>
                      <Badge variant="muted" size="sm">{svc.category}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-caption text-mist">
                      <span className="flex items-center gap-1"><Clock size={11} />{svc.duration_min} min</span>
                      <span className="text-gold">{formatPrice(svc.price_from, svc.price_to)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </StepPanel>
          )}

          {/* ── Step 2: Date ─────────────────────────────────── */}
          {step === 2 && (
            <StepPanel key="step2">
              <div className="flex items-center gap-4 mb-6">
                <BackButton onClick={() => setStep(1)} />
                <h2 className="font-display text-heading-xl text-chalk">Choose a date</h2>
              </div>

              {/* Calendar */}
              <div className="bg-obsidian border border-wire rounded-2xl p-6 max-w-sm">
                {/* Month nav */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
                    className="w-8 h-8 rounded-full border border-wire flex items-center justify-center text-mist hover:text-chalk hover:border-gold/40 transition-colors duration-200"
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="font-sans text-body-sm text-chalk font-medium">
                    {format(currentMonth, 'MMMM yyyy')}
                  </span>
                  <button
                    onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                    className="w-8 h-8 rounded-full border border-wire flex items-center justify-center text-mist hover:text-chalk hover:border-gold/40 transition-colors duration-200"
                    aria-label="Next month"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                  {['Mo','Tu','We','Th','Fr','Sa','Su'].map((d) => (
                    <div key={d} className="text-caption text-mist text-center py-1">{d}</div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-y-1">
                  {/* Offset */}
                  {Array.from({ length: (calendarDays[0].getDay() + 6) % 7 }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}

                  {calendarDays.map((day) => {
                    const isPast   = isBefore(day, today)
                    const isSunday = day.getDay() === 0
                    const isSelected = selectedDate && isSameDay(day, selectedDate)
                    const isTod  = isToday(day)
                    const disabled = isPast || isSunday

                    return (
                      <button
                        key={day.toISOString()}
                        disabled={disabled}
                        onClick={() => { setSelectedDate(day); setSelectedTime(null); setStep(3) }}
                        aria-label={format(day, 'EEEE d MMMM yyyy')}
                        aria-pressed={!!isSelected}
                        className={cn(
                          'h-9 w-9 mx-auto rounded-full text-body-sm font-sans transition-all duration-200 flex items-center justify-center',
                          disabled
                            ? 'text-dim cursor-not-allowed'
                            : isSelected
                            ? 'bg-gradient-gold text-ink font-medium shadow-gold'
                            : isTod
                            ? 'border border-gold/40 text-gold'
                            : 'text-pearl hover:bg-ash hover:text-chalk cursor-pointer'
                        )}
                      >
                        {format(day, 'd')}
                      </button>
                    )
                  })}
                </div>
              </div>
            </StepPanel>
          )}

          {/* ── Step 3: Time slot ─────────────────────────────── */}
          {step === 3 && (
            <StepPanel key="step3">
              <div className="flex items-center gap-4 mb-2">
                <BackButton onClick={() => setStep(2)} />
                <div>
                  <h2 className="font-display text-heading-xl text-chalk">Choose a time</h2>
                  {selectedDate && (
                    <p className="text-body-sm text-mist mt-0.5">
                      {format(selectedDate, 'EEEE, d MMMM yyyy')}
                    </p>
                  )}
                </div>
              </div>

              {loadingSlots ? (
                <div className="flex items-center gap-3 mt-8 text-mist">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-body-sm">Checking availability…</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-6">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => { setSelectedTime(slot.time); setStep(4) }}
                      aria-label={`${slot.time}${slot.available ? '' : ', unavailable'}`}
                      aria-pressed={selectedTime === slot.time}
                      className={cn(
                        'py-3 px-2 rounded-lg border text-body-sm font-sans transition-all duration-200',
                        !slot.available
                          ? 'border-wire text-dim cursor-not-allowed line-through'
                          : selectedTime === slot.time
                          ? 'border-gold bg-gold/10 text-gold shadow-gold'
                          : 'border-wire bg-obsidian text-pearl hover:border-gold/40 hover:bg-gold/[0.04] hover:text-gold cursor-pointer'
                      )}
                    >
                      {slot.time}
                    </button>
                  ))}
                  {timeSlots.length === 0 && (
                    <p className="col-span-full text-body-sm text-mist">
                      No availability on this date. Please choose another day.
                    </p>
                  )}
                </div>
              )}
            </StepPanel>
          )}

          {/* ── Step 4: Details form ───────────────────────────── */}
          {step === 4 && (
            <StepPanel key="step4">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16">

                {/* Form */}
                <div className="lg:col-span-3">
                  <div className="flex items-center gap-4 mb-6">
                    <BackButton onClick={() => setStep(3)} />
                    <h2 className="font-display text-heading-xl text-chalk">Your details</h2>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                    <FormField label="Full Name" icon={<User size={14} />} error={errors.name?.message}>
                      <input id="book-name" type="text" placeholder="Jane Smith" autoComplete="name" className={inputCls} {...register('name')} aria-invalid={!!errors.name} />
                    </FormField>

                    <FormField label="Email Address" icon={<Mail size={14} />} error={errors.email?.message}>
                      <input id="book-email" type="email" placeholder="jane@example.com" autoComplete="email" className={inputCls} {...register('email')} aria-invalid={!!errors.email} />
                    </FormField>

                    <FormField label="Phone (optional)" icon={<Phone size={14} />}>
                      <input id="book-phone" type="tel" placeholder="+44 7700 000000" autoComplete="tel" className={inputCls} {...register('phone')} />
                    </FormField>

                    <FormField label="Notes (optional)" icon={<FileText size={14} />} error={errors.notes?.message}>
                      <textarea id="book-notes" rows={3} placeholder="Any details we should know…" className={inputCls} style={{ resize: 'none' }} {...register('notes')} />
                    </FormField>

                    <Button
                      type="submit"
                      size="lg"
                      loading={isSubmitting}
                      loadingText="Confirming booking…"
                      rightIcon={<ArrowRight size={14} />}
                      className="self-start tracking-widest uppercase text-[0.72rem] mt-2"
                    >
                      Confirm Booking
                    </Button>
                  </form>
                </div>

                {/* Booking summary */}
                <div className="lg:col-span-2">
                  <div className="bg-obsidian border border-wire rounded-xl p-6 flex flex-col gap-4 sticky top-24">
                    <h3 className="font-sans text-heading-md text-chalk font-medium flex items-center gap-2">
                      <Sparkles size={16} className="text-gold" />
                      Booking Summary
                    </h3>
                    <div className="divider" />
                    <SummaryRow icon={<Sparkles size={14} />} label="Service">
                      <span className="text-chalk">{selectedService?.name}</span>
                    </SummaryRow>
                    <SummaryRow icon={<Calendar size={14} />} label="Date">
                      <span className="text-chalk">{selectedDate ? format(selectedDate, 'EEE, d MMM yyyy') : '—'}</span>
                    </SummaryRow>
                    <SummaryRow icon={<Clock size={14} />} label="Time">
                      <span className="text-chalk">{selectedTime ?? '—'}</span>
                    </SummaryRow>
                    <SummaryRow icon={<Clock size={14} />} label="Duration">
                      <span className="text-chalk">{selectedService?.duration_min} min</span>
                    </SummaryRow>
                    <div className="divider" />
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm text-mist">From</span>
                      <span className="font-impact text-chalk" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
                        {selectedService ? formatPrice(selectedService.price_from, selectedService.price_to) : '—'}
                      </span>
                    </div>
                    <p className="text-caption text-dim">
                      A confirmation email will be sent to you immediately.
                    </p>
                  </div>
                </div>
              </div>
            </StepPanel>
          )}

          {/* ── Step 5: Confirmation ───────────────────────────── */}
          {step === 5 && (
            <StepPanel key="step5">
              <motion.div
                className="max-w-lg mx-auto flex flex-col items-center text-center gap-8 py-8"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              >
                {/* Check icon */}
                <motion.div
                  className="w-20 h-20 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                >
                  <Check size={36} className="text-gold" />
                </motion.div>

                <div className="flex flex-col gap-2">
                  <h2 className="font-display text-display-md text-chalk">You're booked.</h2>
                  <p className="text-body-lg text-pearl">
                    A confirmation has been sent to your email. We'll see you soon.
                  </p>
                </div>

                {bookingResult && (
                  <div className="bg-obsidian border border-wire rounded-xl p-6 w-full text-left flex flex-col gap-3">
                    <SummaryRow icon={<Sparkles size={14} />} label="Service"><span className="text-chalk">{bookingResult.service_name}</span></SummaryRow>
                    <SummaryRow icon={<Calendar size={14} />} label="Date"><span className="text-chalk">{bookingResult.date}</span></SummaryRow>
                    <SummaryRow icon={<Clock size={14} />} label="Time"><span className="text-chalk">{bookingResult.time_slot}</span></SummaryRow>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button asChild variant="ghost" size="md" pulse={false}><a href="/">Back to Home</a></Button>
                  <Button asChild size="md"><a href="/book">Book Another</a></Button>
                </div>
              </motion.div>
            </StepPanel>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

import { Suspense } from 'react'

export default function BookPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-ink flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  )
}

// ── Helpers ────────────────────────────────────────────────────

function StepPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Go back"
      className="w-8 h-8 rounded-full border border-wire flex items-center justify-center text-mist hover:text-chalk hover:border-gold/40 transition-colors duration-200 shrink-0"
    >
      <ChevronLeft size={16} />
    </button>
  )
}

function FormField({ label, icon, error, children }: {
  label: string; icon: React.ReactNode; error?: string; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="t-overline flex items-center gap-1.5 text-mist">
        <span className="text-gold" aria-hidden>{icon}</span>
        {label}
      </label>
      {children}
      {error && <p className="text-caption text-ember">{error}</p>}
    </div>
  )
}

function SummaryRow({ icon, label, children }: {
  icon: React.ReactNode; label: string; children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-caption text-mist">
        <span className="text-gold" aria-hidden>{icon}</span>
        {label}
      </span>
      <div className="text-body-sm">{children}</div>
    </div>
  )
}

function generateMockSlots(durationMin: number) {
  const slots = []
  const open = 9 * 60, close = 18 * 60
  for (let t = open; t + durationMin <= close; t += durationMin + 15) {
    const h = Math.floor(t / 60).toString().padStart(2, '0')
    const m = (t % 60).toString().padStart(2, '0')
    slots.push({ time: `${h}:${m}`, available: Math.random() > 0.3 })
  }
  return slots
}
