import { useEffect, useRef, useState } from 'react'

export default function useMediaPipe(videoRef, onResultado) {
  const handsRef = useRef(null)
  const animFrameRef = useRef(null)
  const [cargando, setCargando] = useState(false)
  const [activo, setActivo] = useState(false)

  async function cargarMediaPipe() {
    return new Promise((resolve) => {
      if (window.Hands) { resolve(); return }
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'
      script.crossOrigin = 'anonymous'
      script.onload = resolve
      document.head.appendChild(script)
    })
  }

  async function iniciar() {
    if (!videoRef.current) return
    setCargando(true)

    await cargarMediaPipe()

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

    await hands.initialize()
    handsRef.current = hands
    setCargando(false)
    setActivo(true)

    async function detectar() {
      if (handsRef.current && videoRef.current && videoRef.current.readyState >= 2) {
        await handsRef.current.send({ image: videoRef.current })
      }
      animFrameRef.current = requestAnimationFrame(detectar)
    }

    detectar()
  }

  function detener() {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (handsRef.current) handsRef.current.close()
    handsRef.current = null
    setActivo(false)
  }

  useEffect(() => {
    return () => detener()
  }, [])

  return { iniciar, detener, cargando, activo }
} 