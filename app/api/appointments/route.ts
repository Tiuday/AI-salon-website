/**
 * /api/appointments
 *
 * GET  — return available time slots for a date + service
 * POST — create a new appointment (atomic conflict check)
 *
 * ── Conflict prevention strategy ─────────────────────────────
 *
 * The naive approach (SELECT → check → INSERT) has a race condition:
 * two simultaneous requests can both see an empty slot and both insert.
 *
 * Solution: PostgreSQL stored procedure `book_appointment()` wraps
 * the check + insert in one transaction with SELECT FOR UPDATE.
 * This row-locks any conflicting appointments before inserting,
 * so concurrent requests are serialised at the DB level.
 *
 * ── POST flow ────────────────────────────────────────────────
 *
 *  1. Validate input (zod)
 *  2. Call Supabase RPC `book_appointment(...)` — atomic
 *  3. On success: send confirmation email (Resend)
 *  4. Return { appointment_id, confirmationSent: boolean }
 *
 * ── GET flow ──────────────────────────────────────────────────
 *
 *  1. Validate query params
 *  2. Call Supabase RPC `get_available_slots(date, service_id)`
 *  3. Return array of { time, available, reason }
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { sendBookingConfirmation } from '@/lib/email/sendBookingConfirmation'
import type { TimeSlot, Appointment } from '@/types'

// ── Input schemas ──────────────────────────────────────────────

const getParamsSchema = z.object({
  date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  service_id: z.string().uuid('Must be a valid UUID'),
})

const postBodySchema = z.object({
  service_id:   z.string().uuid(),
  date:         z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time_slot:    z.string().regex(/^\d{2}:\d{2}$/),
  client_name:  z.string().min(2).max(100),
  client_email: z.string().email(),
  client_phone: z.string().max(20).optional(),
  notes:        z.string().max(500).optional(),
})

// ── GET /api/appointments?date=YYYY-MM-DD&service_id=UUID ──────

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams

  const parsed = getParamsSchema.safeParse({
    date:       searchParams.get('date'),
    service_id: searchParams.get('service_id'),
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { date, service_id } = parsed.data
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_available_slots', {
    p_date:       date,
    p_service_id: service_id,
  })

  if (error) {
    console.error('[appointments/GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }

  const slots: TimeSlot[] = (data ?? []).map((row: { time_slot: string; available: boolean; reason?: string }) => ({
    time:      row.time_slot,
    available: row.available,
    reason:    row.reason ?? undefined,
  }))

  return NextResponse.json(
    { slots, date },
    {
      // Cache for 60 seconds — slots change often but not per-request
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
    }
  )
}

// ── POST /api/appointments ─────────────────────────────────────

export async function POST(req: NextRequest) {
  // Parse body
  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Empty request body' }, { status: 400 })
  }

  const parsed = postBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const {
    service_id,
    date,
    time_slot,
    client_name,
    client_email,
    client_phone,
    notes,
  } = parsed.data

  const supabase = await createClient()

  // ── Atomic booking via stored procedure ───────────────────
  const { data: appointmentId, error: bookError } = await supabase.rpc(
    'book_appointment',
    {
      p_service_id:   service_id,
      p_date:         date,
      p_time_slot:    time_slot,
      p_client_name:  client_name,
      p_client_email: client_email,
      p_client_phone: client_phone ?? null,
      p_notes:        notes ?? null,
    }
  )

  // ── Handle conflicts ────────────────────────────────────────
  if (bookError) {
    if (bookError.message?.includes('SLOT_UNAVAILABLE')) {
      return NextResponse.json(
        {
          error: 'Slot unavailable',
          code:  'SLOT_UNAVAILABLE',
          message: 'That time slot was just taken. Please choose another.',
        },
        { status: 409 }  // Conflict
      )
    }

    console.error('[appointments/POST] book_appointment RPC error:', bookError)
    return NextResponse.json(
      { error: 'Booking failed. Please try again.' },
      { status: 500 }
    )
  }

  // ── Fetch the full appointment for email ───────────────────
  const { data: appointment } = await supabase
    .from('appointments')
    .select('*, service:services(*)')
    .eq('id', appointmentId)
    .single<Appointment>()

  // ── Send confirmation email (non-blocking) ────────────────
  let confirmationSent = false
  if (appointment) {
    try {
      await sendBookingConfirmation(appointment)
      confirmationSent = true
    } catch (emailErr) {
      // Email failure shouldn't fail the booking — log and move on
      console.error('[appointments/POST] email send failed:', emailErr)
    }
  }

  return NextResponse.json(
    {
      data: {
        appointment_id:   appointmentId,
        confirmationSent,
        // Return enough info for the client confirmation screen
        service_name: appointment?.service?.name,
        date,
        time_slot,
        client_name,
        client_email,
      },
      message: 'Appointment booked successfully.',
    },
    { status: 201 }
  )
}
