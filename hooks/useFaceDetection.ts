'use client'

/**
 * useFaceDetection
 *
 * React hook that manages the face detection Web Worker lifecycle
 * and exposes a clean interface to the CameraCapture component.
 *
 * ── Responsibilities ─────────────────────────────────────────
 * 1. Spawn the Worker on mount, terminate on unmount
 * 2. Send INIT — wait for READY before accepting frames
 * 3. Throttle DETECT messages (one per 400ms) to avoid overloading
 * 4. Expose the latest FaceShapeResult + detection state
 * 5. Handle errors gracefully (fall back to manual selection)
 *
 * ── Usage ─────────────────────────────────────────────────────
 *
 *   const { detect, result, status, error } = useFaceDetection()
 *
 *   // In your animation loop / canvas ref:
 *   const imageData = ctx.getImageData(0, 0, width, height)
 *   detect(imageData, width, height)
 *
 *   // Render:
 *   if (result) <HairstyleRecommendations shape={result.shape} />
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import type { FaceShapeResult, WorkerInMessage, WorkerOutMessage } from '@/types'

// ── Types ──────────────────────────────────────────────────────

type DetectionStatus =
  | 'idle'       // hook mounted, worker not yet initialised
  | 'loading'    // INIT sent, waiting for READY
  | 'ready'      // READY received, accepting DETECT frames
  | 'detecting'  // a DETECT is in-flight
  | 'done'       // stable result returned
  | 'no_face'    // last frame had no detectable face
  | 'error'      // something went wrong

export interface UseFaceDetectionReturn {
  /** Call with a canvas ImageData frame to trigger detection */
  detect: (imageData: ImageData, width: number, height: number) => void
  /** The latest stable result */
  result: FaceShapeResult | null
  /** Detection lifecycle state */
  status: DetectionStatus
  /** Human-readable error message if status === 'error' */
  error: string | null
  /** Reset result and status to idle (allows re-detection) */
  reset: () => void
}

// ── Hook ───────────────────────────────────────────────────────

const DETECT_THROTTLE_MS = 400   // min ms between DETECT sends

export function useFaceDetection(): UseFaceDetectionReturn {
  const workerRef      = useRef<Worker | null>(null)
  const lastDetectRef  = useRef<number>(0)
  const pendingRef     = useRef<boolean>(false)   // one in-flight at a time

  const [status, setStatus] = useState<DetectionStatus>('idle')
  const [result, setResult] = useState<FaceShapeResult | null>(null)
  const [error,  setError]  = useState<string | null>(null)

  // ── Spawn worker and wire up message handler ───────────────
  useEffect(() => {
    // Dynamic import: Next.js bundles this separately via the Worker URL trick
    const worker = new Worker(
      new URL('../lib/face/faceWorker.ts', import.meta.url),
      { type: 'module' }
    )

    workerRef.current = worker
    setStatus('loading')

    worker.onmessage = (event: MessageEvent<WorkerOutMessage>) => {
      const msg = event.data

      switch (msg.type) {
        case 'READY':
          setStatus('ready')
          break

        case 'RESULT':
          pendingRef.current = false
          setResult(msg.result)
          setStatus('done')
          break

        case 'NO_FACE':
          pendingRef.current = false
          setStatus('no_face')
          break

        case 'ERROR':
          pendingRef.current = false
          setError(msg.message)
          setStatus('error')
          break
      }
    }

    worker.onerror = (e) => {
      setError(`Worker error: ${e.message}`)
      setStatus('error')
    }

    // Send INIT
    worker.postMessage({ type: 'INIT' } satisfies WorkerInMessage)

    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  // ── detect — throttled, one-at-a-time ─────────────────────
  const detect = useCallback(
    (imageData: ImageData, width: number, height: number) => {
      const worker = workerRef.current

      // Only send if ready, no in-flight, and throttle passed
      if (!worker) return
      if (status !== 'ready' && status !== 'no_face') return
      if (pendingRef.current) return

      const now = Date.now()
      if (now - lastDetectRef.current < DETECT_THROTTLE_MS) return

      lastDetectRef.current = now
      pendingRef.current = true
      setStatus('detecting')

      // Transfer the ImageData.data buffer for zero-copy send
      worker.postMessage(
        { type: 'DETECT', imageData, width, height } satisfies WorkerInMessage,
        [imageData.data.buffer]
      )
    },
    [status]
  )

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    pendingRef.current = false
    setStatus(workerRef.current ? 'ready' : 'idle')
  }, [])

  return { detect, result, status, error, reset }
}
