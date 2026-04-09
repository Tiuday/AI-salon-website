import { FaceAnalyzer } from '@/components/stylist/FaceAnalyzer'

export const metadata = {
  title: 'AI Style Assistant',
  description: 'Precision analysis of your face shape to recommend the perfect hairstyle. AI-driven personalization for your aesthetic.',
  openGraph: {
    title: 'Discover Your Perfect Look | AI Stylist',
    description: 'Bespoke hairstyle recommendations based on your unique facial geometry.',
  }
}

export default function FindYourStylePage() {
  return (
    <main className="min-h-screen bg-ink pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Intro Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/5 border border-gold/10 text-gold text-xs font-bold uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
            </span>
            Next-Gen Personalization
          </div>
          <h1 className="text-5xl md:text-7xl font-light text-chalk leading-tight">
            Elevate Your <span className="text-gold italic">Natural Aesthetic</span>
          </h1>
          <p className="text-mist text-lg md:text-xl leading-relaxed">
            Stop guessing and start glowing. Our AI-driven stylist analyzes your unique geometry 
            to curate a Lookbook that balances your features and matches your vibe.
          </p>
        </section>

        {/* The Analyzer Component */}
        <section className="relative">
          <div className="absolute inset-0 bg-gold/5 blur-[120px] rounded-full -z-10" />
          <FaceAnalyzer />
        </section>

        {/* How it Works / Trust Section */}
        <section className="grid md:grid-cols-3 gap-12 pt-20 border-t border-wire">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-ash flex items-center justify-center text-gold text-xl font-medium border border-wire">1</div>
            <h3 className="text-chalk text-xl font-light">Capture</h3>
            <p className="text-mist text-sm leading-relaxed">
              Use your camera to capture high-fidelity geometric data. We look at width-to-height ratios, jawlines, and focal points.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-ash flex items-center justify-center text-gold text-xl font-medium border border-wire">2</div>
            <h3 className="text-chalk text-xl font-light">Analyze</h3>
            <p className="text-mist text-sm leading-relaxed">
              Our algorithm compares your measurements against thousands of stylistic archetypes to identify your exact face shape.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-ash flex items-center justify-center text-gold text-xl font-medium border border-wire">3</div>
            <h3 className="text-chalk text-xl font-light">Curate</h3>
            <p className="text-mist text-sm leading-relaxed">
              Gemini AI recommends a bespoke selection of cuts and color gradients designed to highlight your best self.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
