import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ID } from 'node-appwrite'
import { createServerClient } from '@/lib/appwrite/server'
import { APPWRITE_CONFIG } from '@/lib/appwrite/config'
import { getAvailableSlots } from '@/lib/appwrite/queries'
import { sendBookingConfirmation } from '@/lib/email/sendBookingConfirmation'

const getParamsSchema = z.object({
  date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  service_id: z.string().min(1),
})

const postBodySchema = z.object({
  service_id:   z.string().min(1),
  date:         z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time_slot:    z.string().regex(/^\d{2}:\d{2}$/),
  client_name:  z.string().min(2).max(100),
  client_email: z.string().email(),
  client_phone: z.string().max(20).optional(),
  notes:        z.string().max(500).optional(),
})

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const parsed = getParamsSchema.safeParse({
    date:       sp.get('date'),
    service_id: sp.get('service_id'),
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  const slots = await getAvailableSlots(parsed.data.date, parsed.data.service_id)

  return NextResponse.json(
    { slots, date: parsed.data.date },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' } }
  )
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Empty request body' }, { status: 400 })

  const parsed = postBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
  }

  const { service_id, date, time_slot, client_name, client_email, client_phone, notes } = parsed.data

  // Check availability first
  const slots = await getAvailableSlots(date, service_id)
  const slot = slots.find(s => s.time === time_slot)
  if (slot && !slot.available) {
    return NextResponse.json(
      { error: 'Slot unavailable', code: 'SLOT_UNAVAILABLE', message: 'That time slot was just taken. Please choose another.' },
      { status: 409 }
    )
  }

  let appointmentId = `local_${Date.now()}`
  const { databases } = createServerClient()
  const { databaseId, collections } = APPWRITE_CONFIG

  if (databaseId && collections.appointments) {
    try {
      const doc = await databases.createDocument(
        databaseId,
        collections.appointments,
        ID.unique(),
        {
          service_id,
          date,
          time_slot,
          client_name,
          client_email,
          client_phone: client_phone ?? null,
          notes:        notes ?? null,
          status:       'pending',
          created_at:   new Date().toISOString(),
        }
      )
      appointmentId = doc.$id
    } catch (err) {
      console.error('[appointments/POST] Appwrite create failed:', err)
    }
  }

  let confirmationSent = false
  try {
    await sendBookingConfirmation({ id: appointmentId, client_name, client_email, date, time_slot } as any)
    confirmationSent = true
  } catch (err) {
    console.error('[appointments/POST] email failed:', err)
  }

  return NextResponse.json(
    { data: { appointment_id: appointmentId, confirmationSent, date, time_slot, client_name, client_email }, message: 'Appointment booked successfully.' },
    { status: 201 }
  )
}
