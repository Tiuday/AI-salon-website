import { Query } from 'appwrite'
import { databases } from './client'
import { APPWRITE_CONFIG } from './config'
import type { Service, Hairstyle, Testimonial, FaqItem, FaceShape, TimeSlot } from '@/types'
import { HAIRSTYLES } from '@/data/hairstyles'

const { databaseId, collections } = APPWRITE_CONFIG

function isConfigured() {
  return Boolean(APPWRITE_CONFIG.projectId && APPWRITE_CONFIG.databaseId)
}

// ── Services ───────────────────────────────────────────────────────

export async function getAllServices(): Promise<Service[]> {
  if (!isConfigured()) return []
  try {
    const res = await databases.listDocuments(databaseId, collections.services, [
      Query.orderAsc('sort_order'),
    ])
    return res.documents as unknown as Service[]
  } catch {
    return []
  }
}

export async function getFeaturedServices(): Promise<Service[]> {
  if (!isConfigured()) return []
  try {
    const res = await databases.listDocuments(databaseId, collections.services, [
      Query.equal('is_featured', true),
      Query.orderAsc('sort_order'),
      Query.limit(6),
    ])
    return res.documents as unknown as Service[]
  } catch {
    return []
  }
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  if (!isConfigured()) return null
  try {
    const res = await databases.listDocuments(databaseId, collections.services, [
      Query.equal('slug', slug),
      Query.limit(1),
    ])
    return (res.documents[0] as unknown as Service) ?? null
  } catch {
    return null
  }
}

// ── Hairstyles ─────────────────────────────────────────────────────

export async function getHairstylesByFaceShape(shape: FaceShape): Promise<Hairstyle[]> {
  if (!isConfigured()) return HAIRSTYLES.filter(h => h.face_shapes.includes(shape))
  try {
    const res = await databases.listDocuments(databaseId, collections.hairstyles, [
      Query.search('face_shapes', shape),
      Query.orderAsc('sort_order'),
    ])
    const docs = res.documents as unknown as Hairstyle[]
    return docs.length ? docs : HAIRSTYLES.filter(h => h.face_shapes.includes(shape))
  } catch {
    return HAIRSTYLES.filter(h => h.face_shapes.includes(shape))
  }
}

export async function getFeaturedHairstyles(): Promise<Hairstyle[]> {
  if (!isConfigured()) return HAIRSTYLES.filter(h => h.is_featured)
  try {
    const res = await databases.listDocuments(databaseId, collections.hairstyles, [
      Query.equal('is_featured', true),
      Query.orderAsc('sort_order'),
    ])
    const docs = res.documents as unknown as Hairstyle[]
    return docs.length ? docs : HAIRSTYLES.filter(h => h.is_featured)
  } catch {
    return HAIRSTYLES.filter(h => h.is_featured)
  }
}

// ── Testimonials ───────────────────────────────────────────────────

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  if (!isConfigured()) return []
  try {
    const res = await databases.listDocuments(databaseId, collections.testimonials, [
      Query.equal('published', true),
      Query.orderDesc('created_at'),
      Query.limit(10),
    ])
    return res.documents as unknown as Testimonial[]
  } catch {
    return []
  }
}

// ── FAQ ────────────────────────────────────────────────────────────

export async function getAllFaq(): Promise<FaqItem[]> {
  if (!isConfigured()) return []
  try {
    const res = await databases.listDocuments(databaseId, collections.faq, [
      Query.orderAsc('sort_order'),
    ])
    return res.documents as unknown as FaqItem[]
  } catch {
    return []
  }
}

// ── Appointments ───────────────────────────────────────────────────

const BUSINESS_HOURS = {
  start: 9,
  end: 18,
  interval: 45,
}

export function generateTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = []
  const { start, end, interval } = BUSINESS_HOURS
  for (let h = start; h < end; h++) {
    for (let m = 0; m < 60; m += interval) {
      if (h * 60 + m + interval > end * 60) break
      slots.push({
        time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        available: true,
      })
    }
  }
  return slots
}

export async function getAvailableSlots(date: string, serviceId: string): Promise<TimeSlot[]> {
  const all = generateTimeSlots()
  if (!isConfigured()) return all
  try {
    const res = await databases.listDocuments(databaseId, collections.appointments, [
      Query.equal('date', date),
      Query.equal('service_id', serviceId),
      Query.notEqual('status', 'cancelled'),
    ])
    const booked = new Set(res.documents.map((d: any) => d.time_slot as string))
    return all.map(s => ({ ...s, available: !booked.has(s.time) }))
  } catch {
    return all
  }
}
