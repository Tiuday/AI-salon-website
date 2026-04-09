'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, RefreshCw, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react'
import { getFaceLandmarker, calculateFaceShape } from '@/lib/cv/FaceLandmarker'
import { FaceShape, FaceMeasurements } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { HAIRSTYLES } from '@/data/hairstyles'

export function FaceAnalyzer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<{ shape: FaceShape; measurements: FaceMeasurements } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      })
      setStream(s)
      if (videoRef.current) videoRef.current.srcObject = s
      setError(null)
    } catch (err) {
      setError('Could not access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    stream?.getTracks().forEach(track => track.stop())
    setStream(null)
  }

  const analyzeFace = async () => {
    if (!videoRef.current) return
    setAnalyzing(true)
    
    try {
      const landmarker = await getFaceLandmarker()
      const detection = landmarker.detect(videoRef.current)
      
      if (detection.faceLandmarks.length > 0) {
        const analysis = calculateFaceShape(detection.faceLandmarks[0])
        setResult(analysis)
        stopCamera()
      } else {
        setError('No face detected. Please ensure your face is clearly visible.')
      }
    } catch (err) {
      setError('Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const reset = () => {
    setResult(null)
    setError(null)
    startCamera()
  }

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-[2.5rem] font-light text-chalk tracking-tight">
          Find Your <span className="text-gold italic">Perfect Style</span>
        </h2>
        <p className="text-mist text-lg max-w-xl mx-auto">
          Our AI analyzes your unique features to recommend styles that celebrate your natural beauty.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Left: Camera / Display */}
        <div className="relative aspect-[4/3] bg-obsidian rounded-3xl overflow-hidden border border-wire group">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
                
                {/* HUD Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-64 h-80 border-2 border-dashed border-gold/30 rounded-[3rem] animate-pulse" />
                </div>

                <div className="absolute bottom-6 inset-x-0 flex justify-center px-6">
                  <Button 
                    onClick={analyzeFace} 
                    disabled={analyzing}
                    className="w-full sm:w-auto h-14 px-8 rounded-full bg-gold text-ink hover:bg-gold-light shadow-gold/20"
                  >
                    {analyzing ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="animate-spin h-4 w-4" />
                        Analyzing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Capture & Analyze
                      </span>
                    )}
                  </Button>
                </div>
              </motion.div>
            ) : (
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
                </div>
                <Button 
                  variant="ghost" 
                  onClick={reset}
                  className="rounded-full border-wire hover:bg-ash transition-colors"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="absolute top-4 inset-x-4 bg-error/90 backdrop-blur-sm text-chalk px-4 py-2 rounded-xl text-sm text-center font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Right: Recommendations */}
        <div className="space-y-6">
          <h4 className="text-xl text-chalk font-light flex items-center gap-3">
            <Sparkles className="text-gold h-5 w-5" />
            Tailored Recommendations
          </h4>
          
          <div className="space-y-4">
            {!result ? (
              // Placeholder State
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-ash/50 border border-wire/50 rounded-2xl animate-pulse" />
              ))
            ) : (
              // Results State
              HAIRSTYLES.filter(h => h.face_shapes.includes(result.shape)).map((style) => (
                <motion.div
                  key={style.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="group relative flex gap-4 p-4 bg-ash border border-wire rounded-2xl hover:border-gold/40 transition-all cursor-pointer"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-obsidian shrink-0">
                    <img src={style.thumbnail} alt={style.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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

          {result && (
            <div className="p-6 bg-gold/[0.03] border border-gold/10 rounded-2xl space-y-3">
              <p className="text-chalk font-medium flex items-center gap-2">
                <Bot className="text-gold h-4 w-4" />
                Stylist's Note
              </p>
              <p className="text-mist text-sm leading-relaxed italic">
                "For a {result.shape} face shape, we focus on styles that create balance and softness. These picks are designed to complement your bone structure and enhance your natural symmetry."
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Bot({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  )
}
