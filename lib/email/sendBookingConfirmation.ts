import { Resend } from 'resend'
import type { Appointment } from '@/types'


export async function sendBookingConfirmation(appointment: Appointment) {
  const resend = new Resend(process.env.RESEND_API_KEY || 're_stub_for_build')
  
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set. Skipping email.')
    return { data: null, error: null }
  }

  const {
    client_name,
    client_email,
    date,
    time_slot,
    service
  } = appointment

  const serviceName = service?.name ?? 'your service'

  return resend.emails.send({
    from: 'Nakshatra Sharma <onboarding@resend.dev>',
    to: client_email,
    subject: `Booking Confirmation: ${serviceName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Booking Confirmed!</h2>
        <p>Hi ${client_name},</p>
        <p>Your appointment for <strong>${serviceName}</strong> has been confirmed.</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time_slot}</p>
        <br />
        <p>We look forward to seeing you!</p>
        <p>Nakshatra Sharma</p>
      </div>
    `,
  })
}
