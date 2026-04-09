/* ════════════════════════════════════════════════════════════════
   NAKSHATRA SHARMA — Shared TypeScript Types
   Single source of truth for all domain types used across
   components, API routes, hooks, and DB queries.
   ════════════════════════════════════════════════════════════════ */

// ── Enums / Literal Unions ─────────────────────────────────────

export type FaceShape =
  | 'oval'
  | 'round'
  | 'square'
  | 'heart'
  | 'oblong'

export type ServiceCategory =
  | 'cut'
  | 'color'
  | 'treatment'
  | 'styling'
  | 'bridal'

export type AppointmentStatus =
  | 'pending'      // just submitted
  | 'confirmed'    // stylist confirmed
  | 'completed'    // service done
  | 'cancelled'    // cancelled by either party
  | 'no_show'      // client didn't arrive

export type FaqCategory =
  | 'general'
  | 'services'
  | 'booking'
  | 'aftercare'
  | 'pricing'

export type HairstyleCategory =
  | 'cut'
  | 'color'
  | 'updo'
  | 'bridal'
  | 'treatment'
  | 'styling'

// ── Services ───────────────────────────────────────────────────

export interface Service {
  id:           string
  name:         string
  slug:         string
  category:     ServiceCategory
  description:  string
  /** What's included, formatted as bullet strings */
  includes:     string[]
  duration_min: number
  price_from:   number
  price_to?:    number
  is_featured:  boolean
  sort_order:   number
  image_url?:   string
  created_at:   string
}

export interface ServiceSummary {
  id:          string
  name:        string
  slug:        string
  category:    ServiceCategory
  duration_min:number
  price_from:  number
  price_to?:   number
  is_featured: boolean
}

// ── Appointments ───────────────────────────────────────────────

export interface Appointment {
  id:           string
  created_at:   string
  client_name:  string
  client_email: string
  client_phone?: string
  service_id:   string
  service?:     Service
  /** ISO date string: YYYY-MM-DD */
  date:         string
  /** 24h time string: HH:MM */
  time_slot:    string
  duration_min: number
  notes?:       string
  status:       AppointmentStatus
  /** Admin notes / confirmation reference */
  internal_note?: string
}

/** What the client submits via the booking form */
export interface BookingRequest {
  service_id:   string
  date:         string       // YYYY-MM-DD
  time_slot:    string       // HH:MM
  client_name:  string
  client_email: string
  client_phone?: string
  notes?:       string
}

/** A single displayable time slot */
export interface TimeSlot {
  time:      string    // "09:00"
  available: boolean
  /** Reason if unavailable */
  reason?:   'booked' | 'past' | 'outside_hours'
}

/** Summary of booked slots for a date (used by calendar) */
export interface DayAvailability {
  date:         string
  total_slots:  number
  booked_slots: number
  is_available: boolean   // any slot free?
}

// ── Testimonials ───────────────────────────────────────────────

export interface Testimonial {
  id:            string
  created_at:    string
  client_name:   string
  client_handle?: string  // @instagram handle
  avatar_url?:   string
  rating:        1 | 2 | 3 | 4 | 5
  quote:         string
  service_name?: string
  is_published:  boolean
}

// ── Hairstyles ─────────────────────────────────────────────────

export interface Hairstyle {
  id:          string
  name:        string
  slug:        string
  description: string
  /** Supabase Storage URLs */
  image_urls:  string[]
  /** Primary thumbnail */
  thumbnail:   string
  /** Which face shapes this style flatters */
  face_shapes: FaceShape[]
  category:    HairstyleCategory
  tags:        string[]
  /** Link to the service that achieves this look */
  service_id?: string
  service?:    ServiceSummary
  is_featured: boolean
  sort_order:  number
}

export interface HairstyleRecommendation {
  hairstyle:         Hairstyle
  /** 0–1: how strongly this matches the face shape */
  confidence:        number
  /** Why this works for the detected shape */
  why:               string
}

// ── Face Detection ─────────────────────────────────────────────

/** Raw 2D point from face-api.js */
export interface Point {
  x: number
  y: number
}

/** Geometric measurements derived from 68 face landmarks */
export interface FaceMeasurements {
  /** Cheekbone-to-cheekbone width (widest point) */
  cheekWidth:  number
  /** Mid-jaw width */
  jawWidth:    number
  /** Chin width */
  chinWidth:   number
  /** Eyebrow span (forehead proxy) */
  browWidth:   number
  /** Nose bridge to chin tip */
  faceHeight:  number
  // Derived ratios
  widthToHeight: number  // cheekWidth / faceHeight  — key ratio
  jawToCheek:    number  // jawWidth / cheekWidth    — jaw taper
  chinToJaw:     number  // chinWidth / jawWidth     — chin taper
  browToCheek:   number  // browWidth / cheekWidth   — forehead vs cheek
}

/** Output from the face shape classifier */
export interface FaceShapeResult {
  shape:        FaceShape
  /** 0–1 confidence — based on how cleanly the ratios match */
  confidence:   number
  measurements: FaceMeasurements
  /** All shapes scored (for debugging / UI display) */
  scores:       Record<FaceShape, number>
}

/** Messages exchanged with the face detection Web Worker */
export type WorkerInMessage =
  | { type: 'INIT' }
  | { type: 'DETECT'; imageData: ImageData; width: number; height: number }

export type WorkerOutMessage =
  | { type: 'READY' }
  | { type: 'RESULT'; result: FaceShapeResult }
  | { type: 'NO_FACE' }
  | { type: 'ERROR'; message: string }

// ── AI Chat ────────────────────────────────────────────────────

export interface ChatMessage {
  id:        string
  role:      'user' | 'assistant' | 'system'
  content:   string
  createdAt: Date
  /** Whether a tool was invoked during this turn */
  toolName?: string
}

/** Tool call results that come back via the streaming API */
export interface ToolResult {
  toolName: string
  result:   unknown
}

// ── FAQ ────────────────────────────────────────────────────────

export interface FaqItem {
  id:         string
  question:   string
  answer:     string
  category:   FaqCategory
  sort_order: number
}

// ── Salon Config (from env / admin settings) ──────────────────

export interface SalonHours {
  /** 24h HH:MM */
  open:  string
  close: string
  /** ISO day numbers: 0=Sun, 1=Mon … 6=Sat */
  days:  number[]
}

export interface SalonConfig {
  name:          string
  tagline:       string
  phone:         string
  email:         string
  address:       string
  instagram_url?: string
  /** Buffer in minutes added after each appointment */
  buffer_min:    number
  hours:         SalonHours
}

// ── API Response shapes ────────────────────────────────────────

export interface ApiSuccess<T> {
  data:    T
  message?: string
}

export interface ApiError {
  error:   string
  code?:   string
  details?: unknown
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ── Utility types ──────────────────────────────────────────────

export type WithId<T> = T & { id: string }
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type Prettify<T> = { [K in keyof T]: T[K] } & {}
