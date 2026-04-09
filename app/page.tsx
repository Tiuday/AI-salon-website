import type { Metadata } from 'next'
import { HeroSection }            from '@/components/sections/HeroSection'
import { ManifestoSection }       from '@/components/sections/ManifestoSection'
import { ServicesPreviewSection } from '@/components/sections/ServicesPreviewSection'
import { FaceShapeToolSection }   from '@/components/sections/FaceShapeToolSection'
import { PricingSection }         from '@/components/sections/PricingSection'
import { TestimonialsSection }    from '@/components/sections/TestimonialsSection'
import { ContentHubSection }      from '@/components/sections/ContentHubSection'
import { ContactSection }         from '@/components/sections/ContactSection'
import { VoiceAssistantSection }  from '@/components/sections/VoiceAssistantSection'

// Optionally fetch live data for sections that need it
// import { getFeaturedServices, getPublishedTestimonials, getAllFaq } from '@/lib/supabase/queries'

export const metadata: Metadata = {
  title: 'Nakshatra Sharma — Luxury Hair Salon',
  description:
    'Award-winning hair stylist. Precision cuts, balayage, keratin treatments, and bridal styling. Book your appointment online.',
}

export default async function HomePage() {
  // Uncomment to connect to live Supabase data:
  // const [services, testimonials, faq] = await Promise.all([
  //   getFeaturedServices(),
  //   getPublishedTestimonials(),
  //   getAllFaq(),
  // ])

  return (
    <>
      {/* 1. Hero — full-bleed editorial photo + headline */}
      <HeroSection />

      {/* 2. Manifesto — bold typographic stats section */}
      <ManifestoSection />

      {/* 3. Services preview — 3 featured service cards */}
      <ServicesPreviewSection /* services={services} */ />

      {/* 4. Voice assistant — ElevenLabs CTA + waveform */}
      <VoiceAssistantSection />

      {/* 5. Face shape tool — 5 buttons + recommendations */}
      <FaceShapeToolSection />

      {/* 6. Pricing — 3 tier cards */}
      <PricingSection />

      {/* 7. Testimonials — draggable carousel */}
      <TestimonialsSection /* testimonials={testimonials} */ />

      {/* 8. Content hub — tips, FAQ, socials */}
      <ContentHubSection /* faq={faq} */ />

      {/* 9. Contact — form + details */}
      <ContactSection />
    </>
  )
}
