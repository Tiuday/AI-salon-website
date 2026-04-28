'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, RefreshCw, Sparkles, CheckCircle2, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { getFaceLandmarker, calculateFaceShape, resetFaceLandmarker } from '@/lib/cv/FaceLandmarker'
import type { FaceShape, FaceMeasurements } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { HAIRSTYLES, getRecommendationsByFaceShape } from '@/data/hairstyles'
import { SHAPE_ADVICE } from '@/lib/face/classifyShape'

type ModelStatus = 'idle' | 'loading-model' | 'ready' | 'detecting' | 'done' | 'error'

export function FaceAnalyzer() {
  const videoRef   = useRef<HTMLVideoElement>(null)
  const streamRef  = useRef<MediaStream | null>(null)

  const [modelStatus, setModelStatus] = useState<ModelStatus>('idle')
  const [cameraError, setCameraError]  = useState<string | null>(null)
  const [faceError, setFaceError]      = useState<string | null>(null)
  const [result, setResult]            = useState<{ shape: FaceShape; measurements: FaceMeasurements } | null>(null)

  // ── Camera ──────────────────────────────────────────────────────

  const startCamera = useCallback(async () => {
    setCameraError(null)
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      })
      streamRef.current = s
      if (videoRef.current) {
        videoRef.current.srcObject = s
        await videoRef.current.play().catch(() => {})
      }
    } catch {
      setCameraError('Camera access denied. Please allow camera permissions and refresh.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])

  // ── Model pre-load ──────────────────────────────────────────────
  // Start warming the model as soon as the component mounts so the
  // user isn't waiting when they click "Capture & Analyse".

  useEffect(() => {
    let cancelled = false
    setModelStatus('loading-model')

    getFaceLandmarker()
      .then(() => { if (!cancelled) setModelStatus('ready') })
      .catch(() => { if (!cancelled) setModelStatus('error') })

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [startCamera, stopCamera])

  // ── Analysis ─────────────────────────────────────────────────

  const analyzeFace = async () => {
    if (!videoRef.current) return
    setFaceError(null)
    setModelStatus('detecting')

    try {
      const landmarker = await getFaceLandmarker()
      const detection  = landmarker.detect(videoRef.current)

      if (!detection.faceLandmarks?.length) {
        setFaceError('No face detected. Make sure your face is centred in the frame and well-lit.')
        setModelStatus('ready')
        return
      }

      const analysis = calculateFaceShape(detection.faceLandmarks[0])
      setResult(analysis)
      setModelStatus('done')
      stopCamera()
    } catch (err) {
      console.error('[FaceAnalyzer] detection failed:', err)
      // Force a fresh model load next attempt
      resetFaceLandmarker()
      setFaceError('Analysis failed. Please try again.')
      setModelStatus('ready')
    }
  }

  const reset = () => {
    setResult(null)
    setFaceError(null)
    setModelStatus('ready')
    startCamera()
  }

  const recommendations = result ? getRecommendationsByFaceShape(result.shape) : []
  const advice          = result ? SHAPE_ADVICE[result.shape] : null
  const isAnalyzing     = modelStatus === 'detecting'
  const canCapture      = modelStatus === 'ready' && !cameraError

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-[2.5rem] font-light text-chalk tracking-tight">
          Find Your <span className="text-gold italic">Perfect Style</span>
        </h2>
        <p className="text-mist text-lg max-w-xl mx-auto">
          Our AI analyses your unique features to recommend styles that celebrate your natural beauty.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">

        {/* ── Left: Camera panel ─────────────────────────────────── */}
        <div className="relative aspect-[4/3] bg-obsidian rounded-3xl overflow-hidden border border-wire group">
          <AnimatePresence mode="wait">

            {/* Result screen */}
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                  <CheckCircle2 size={40} />
                </div>
                <div className="space-y-2">
                  <p className="text-gold text-sm font-medium uppercase tracking-widest">Analysis Complete</p>
                  <h3 className="text-3xl text-chalk font-light capitalize">{result.shape} Face Shape</h3>
                  {advice && <p className="text-mist text-sm max-w-xs mx-auto">{advice.description}</p>}
                </div>
                <Button variant="ghost" onClick={reset} className="rounded-full border-wire hover:bg-ash">
                  <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                </Button>
              </motion.div>

            ) : (
              /* Camera / loading screen */
              <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />

                {/* Face-guide overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className={cn(
                    'w-56 h-72 border-2 border-dashed rounded-[3rem] transition-colors duration-500',
                    canCapture ? 'border-gold/40' : 'border-wire/30'
                  )} />
                </div>

                {/* Model loading indicator */}
                {modelStatus === 'loading-model' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/60 backdrop-blur-sm gap-3">
                    <Loader2 className="h-8 w-8 text-gold animate-spin" />
                    <p className="text-chalk text-sm">Loading AI model…</p>
                    <p className="text-mist text-xs">First load takes ~10 seconds</p>
                  </div>
                )}

                {/* Model error */}
                {modelStatus === 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/70 gap-4 p-6">
                    <AlertCircle className="h-10 w-10 text-ember" />
                    <p className="text-chalk text-sm text-center">Could not load AI model. Check your connection and try again.</p>
                    <Button size="sm" variant="ghost" onClick={() => { resetFaceLandmarker(); setModelStatus('loading-model'); getFaceLandmarker().then(() => setModelStatus('ready')).catch(() => setModelStatus('error')) }}>
                      Retry
                    </Button>
                  </div>
                )}

                {/* Capture button */}
                <div className="absolute bottom-6 inset-x-0 flex justify-center px-6">
                  <Button
                    onClick={analyzeFace}
                    disabled={!canCapture || isAnalyzing}
                    className="w-full sm:w-auto h-14 px-8 rounded-full bg-gold text-ink hover:bg-gold shadow-gold/20"
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center gap-2"><RefreshCw className="animate-spin h-4 w-4" />Analysing…</span>
                    ) : (
                      <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" />Capture &amp; Analyse</span>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Inline error toasts */}
          {(cameraError || faceError) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 inset-x-4 bg-ember/90 backdrop-blur-sm text-chalk px-4 py-2 rounded-xl text-sm text-center font-medium"
            >
              {cameraError ?? faceError}
            </motion.div>
          )}
        </div>

        {/* ── Right: Recommendations ─────────────────────────────── */}
        <div className="space-y-6">
          <h4 className="text-xl text-chalk font-light flex items-center gap-3">
            <Sparkles className="text-gold h-5 w-5" />
            {result ? `Styles for ${result.shape.charAt(0).toUpperCase() + result.shape.slice(1)} Face` : 'Tailored Recommendations'}
          </h4>

          <div className="space-y-4">
            {!result ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-ash/50 border border-wire/50 rounded-2xl animate-pulse" />
              ))
            ) : (
              recommendations.map((style, i) => (
                <motion.div
                  key={style.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="group relative flex gap-4 p-4 bg-ash border border-wire rounded-2xl hover:border-gold/40 transition-all cursor-pointer"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-obsidian shrink-0">
                    <img
                      src={style.thumbnail}
                      alt={style.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h5 className="text-chalk font-medium group-hover:text-gold transition-colors">{style.name}</h5>
                    <p className="text-mist text-sm line-clamp-2 mt-1">{style.description}</p>
                    <div className="mt-2 flex items-center text-gold text-xs font-semibold uppercase tracking-wider gap-1">
                      View Details <ChevronRight size={14} />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Stylist's note */}
          {result && advice && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="p-6 bg-gold/[0.03] border border-gold/10 rounded-2xl space-y-3"
            >
              <p className="text-chalk font-medium flex items-center gap-2">
                <BotIcon className="text-gold h-4 w-4" />
                Stylist's Note
              </p>
              <div className="space-y-2 text-sm text-mist leading-relaxed">
                <p><span className="text-gold font-medium">Love:</span> {advice.love}</p>
                <p><span className="text-chalk/70 font-medium">Avoid:</span> {advice.avoid}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function BotIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
    </svg>
  )
}
