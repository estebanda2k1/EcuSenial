import { useEffect, useRef, useState } from 'react'

export default function useMediaPipe(videoRef, onResultado) {
  const handsRef = useRef(null)
  const animFrameRef = useRef(null)
  const [cargando, setCargando] = useState(false)
  const [activo, setActivo] = useState(false)

  async function iniciar() {
    if (!videoRef.current) return
    setCargando(true)

    // Cargar MediaPipe desde CDN via script tag
    await new Promise((resolve) => {
      if (window.Hands) return resolve()
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'
      script.crossOrigin = 'anonymous'
      script.onload = resolve
      document.head.appendChild(script)
    })

    const hands = new window.Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    })

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    })

    hands.onResults((results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        onResultado(results.multiHandLandmarks[0])
      } else {
        onResultado(null)
      }
    })

    handsRef.current = hands

    async function loop() {
      try {
        if (
          videoRef.current &&
          videoRef.current.readyState >= 2 &&
          !videoRef.current.paused &&
          videoRef.current.videoWidth > 0
        ) {
          await hands.send({ image: videoRef.current })
        }
      } catch (e) {
        console.warn('MediaPipe error:', e)
      }
      animFrameRef.current = requestAnimationFrame(loop)
    }

    loop()
    setCargando(false)
    setActivo(true)
  }

  function detener() {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (handsRef.current) handsRef.current.close()
    setActivo(false)
  }

  useEffect(() => {
    return () => detener()
  }, [])

  return { iniciar, detener, cargando, activo }
}