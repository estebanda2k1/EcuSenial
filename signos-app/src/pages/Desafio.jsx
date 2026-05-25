import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useMediaPipe from '../hooks/useMediaPipe'
import { predecir, cargarModelo } from '../utils/modeloLetras'
import { detectarLetra } from '../utils/detectarLetra'

const TODAS = ['A','B','C','D','E','F','G','I','K','L','M','N','O','R','S','T','U','V','W','Y','1','2','3','4','5','6','7','8','9','10']

function letraAleatoria(excluir = null) {
  let nueva
  do { nueva = TODAS[Math.floor(Math.random() * TODAS.length)] }
  while (nueva === excluir)
  return nueva
}

export default function Desafio() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const navigate = useNavigate()

  const [cameraActiva, setCameraActiva] = useState(false)
  const [letraObjetivo, setLetraObjetivo] = useState(() => letraAleatoria())
  const [letraDetectada, setLetraDetectada] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [contadorSegundos, setContadorSegundos] = useState(null)
  const [puntaje, setPuntaje] = useState(0)
  const [racha, setRacha] = useState(0)
  const [mejor, setMejor] = useState(0)
  const [rondas, setRondas] = useState(0)
  const [modeloCargado, setModeloCargado] = useState(false)
  const [fase, setFase] = useState('jugando') // jugando | correcto

  const letraRef = useRef(letraObjetivo)
  const bloqueadoRef = useRef(false)
  const modeloCargadoRef = useRef(false)
  const deteccionEstableRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    cargarModelo().then(ok => {
      setModeloCargado(ok)
      modeloCargadoRef.current = ok
    })
  }, [])

  useEffect(() => {
    letraRef.current = letraObjetivo
    deteccionEstableRef.current = null
    if (timerRef.current) clearTimeout(timerRef.current)
    setContadorSegundos(null)
    setFeedback(null)
    setLetraDetectada(null)
    bloqueadoRef.current = false
  }, [letraObjetivo])

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  function dibujarPuntos(landmarks) {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return
    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    landmarks.forEach(punto => {
      ctx.beginPath()
      ctx.arc(punto.x * canvas.width, punto.y * canvas.height, 6, 0, 2 * Math.PI)
      ctx.fillStyle = '#7F77DD'
      ctx.fill()
    })
  }

  async function onResultado(landmarks) {
    if (!landmarks || bloqueadoRef.current) return
    dibujarPuntos(landmarks)

    let detectada = null
    if (modeloCargadoRef.current) {
      detectada = await predecir(landmarks, TODAS)
    } else {
      detectada = detectarLetra(landmarks)
    }
    setLetraDetectada(detectada)

    if (detectada === letraRef.current) {
      setFeedback('correcto')
      if (deteccionEstableRef.current !== detectada) {
        deteccionEstableRef.current = detectada
        if (timerRef.current) clearTimeout(timerRef.current)
        setContadorSegundos(2)
        setTimeout(() => setContadorSegundos(1), 1000)
        setTimeout(() => setContadorSegundos(null), 2000)
        timerRef.current = setTimeout(() => {
          if (deteccionEstableRef.current === letraRef.current) {
            bloqueadoRef.current = true
            const nuevaRacha = racha + 1
            const nuevoMejor = Math.max(mejor, nuevaRacha)
            setPuntaje(prev => prev + 10 + nuevaRacha)
            setRacha(nuevaRacha)
            setMejor(nuevoMejor)
            setRondas(prev => prev + 1)
            setFase('correcto')
          }
        }, 2000)
      }
    } else {
      deteccionEstableRef.current = null
      if (timerRef.current) clearTimeout(timerRef.current)
      setContadorSegundos(null)
      if (detectada) {
        setFeedback('incorrecto')
        setRacha(0)
      }
    }
  }

  const { iniciar, detener } = useMediaPipe(videoRef, onResultado)

  async function activarCamara() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } }
      })
      streamRef.current = stream
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setCameraActiva(true)
      await iniciar()
    } catch (err) {
      alert('Error: ' + err.name + ' - ' + err.message)
    }
  }

  function detenerCamara() {
    detener()
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraActiva(false)
  }

  function siguienteRonda() {
    setLetraObjetivo(letraAleatoria(letraObjetivo))
    setFase('jugando')
    bloqueadoRef.current = false
  }

  function volverAtras() {
    detenerCamara()
    navigate('/')
  }

  // ── Pantalla correcto ────────────────────────────────────
  if (fase === 'correcto') {
    return (
      <div className="min-h-screen bg-teal-50 flex flex-col items-center justify-center p-6 text-center">
        <div
          style={{
            position: 'fixed', top: 0, left: 0,
            width: 0, height: 0, overflow: 'hidden', opacity: 0
          }}
        >
          <video ref={videoRef} autoPlay playsInline muted />
        </div>
        <div className="text-7xl mb-3 animate-bounce">🎉</div>
        <h2 className="text-3xl font-extrabold text-teal-700 mb-1">¡Correcto!</h2>
        <p className="text-teal-500 text-lg mb-1">
          Hiciste la seña <strong>{letraObjetivo}</strong> perfectamente
        </p>
        <p className="text-teal-400 text-sm mb-6">+{10 + racha} puntos</p>

        <div className="grid grid-cols-3 gap-4 w-full max-w-xs mb-8">
          <div className="bg-white rounded-2xl p-4 border border-teal-100 text-center">
            <p className="text-2xl font-bold text-teal-700">{puntaje}</p>
            <p className="text-xs text-gray-400">Puntos</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-teal-100 text-center">
            <p className="text-2xl font-bold text-teal-700">{racha}</p>
            <p className="text-xs text-gray-400">Racha</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-teal-100 text-center">
            <p className="text-2xl font-bold text-teal-700">{rondas}</p>
            <p className="text-xs text-gray-400">Rondas</p>
          </div>
        </div>

        <div className="w-full max-w-xs flex flex-col gap-3">
          <button
            onClick={siguienteRonda}
            className="w-full bg-teal-600 text-white py-4 rounded-2xl font-bold text-lg"
          >
            Siguiente seña →
          </button>
          <button
            onClick={volverAtras}
            className="text-sm text-gray-400"
          >
            ← Salir al inicio
          </button>
        </div>
      </div>
    )
  }

  // ── Pantalla jugando ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-purple-50 p-4">

      <div className="flex items-center justify-between mb-3">
        <button onClick={volverAtras} className="text-purple-600 font-medium text-sm">
          ← Salir
        </button>
        <span className="text-xs font-medium text-purple-500 bg-purple-100 px-3 py-1 rounded-full">
          🎯 Desafío
        </span>
        <span className="text-sm font-bold text-purple-700">{puntaje} pts</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
          <p className="text-xl font-bold text-gray-800">{puntaje}</p>
          <p className="text-xs text-gray-400">Puntos</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
          <p className="text-xl font-bold text-gray-800">{racha}</p>
          <p className="text-xs text-gray-400">Racha</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
          <p className="text-xl font-bold text-gray-800">{mejor}</p>
          <p className="text-xs text-gray-400">Mejor racha</p>
        </div>
      </div>

      <div className={`rounded-3xl p-6 mb-4 text-center transition-all ${
        feedback === 'correcto' ? 'bg-teal-500' : 'bg-purple-600'
      }`}>
        <p className="text-sm text-purple-200 mb-1">¿Puedes hacer esta seña?</p>
        <p className="text-8xl font-extrabold text-white leading-none">{letraObjetivo}</p>
        <p className="text-purple-200 text-sm mt-2">
          {isNaN(letraObjetivo) ? `Letra ${letraObjetivo}` : `Número ${letraObjetivo}`}
        </p>
        {contadorSegundos && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="w-full bg-white bg-opacity-30 rounded-full h-2 max-w-xs">
              <div
                className="bg-white h-2 rounded-full transition-all duration-1000"
                style={{ width: contadorSegundos === 2 ? '50%' : '100%' }}
              />
            </div>
            <span className="text-white font-bold text-sm">{contadorSegundos}s</span>
          </div>
        )}
      </div>

      <div className="flex gap-3 mb-4">
        <div
          className="flex-1 bg-gray-900 rounded-2xl overflow-hidden"
          style={{ height: '180px', position: 'relative' }}
        >
          <video
            ref={videoRef}
            autoPlay playsInline muted
            style={{ width: '100%', height: '180px', objectFit: 'contain', display: 'block', background: '#1a1a1a' }}
          />
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
          {!cameraActiva && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
              onClick={activarCamara}
            >
              <span className="text-4xl mb-2">📷</span>
              <p className="text-sm text-gray-300">Toca para activar</p>
            </div>
          )}
        </div>

        <div className={`w-32 rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${
          feedback === 'correcto' ? 'bg-teal-100 border-teal-400'
          : feedback === 'incorrecto' ? 'bg-amber-50 border-amber-300'
          : 'bg-white border-gray-200'
        }`}>
          <p className="font-extrabold leading-none mb-1" style={{
            fontSize: letraDetectada && letraDetectada.length > 1 ? '2.5rem' : '4rem',
            color: feedback === 'correcto' ? '#0F6E56'
              : feedback === 'incorrecto' ? '#B45309' : '#C4B5FD'
          }}>
            {letraDetectada || '?'}
          </p>
          <p className={`text-xs font-medium ${
            feedback === 'correcto' ? 'text-teal-600'
            : feedback === 'incorrecto' ? 'text-amber-600'
            : 'text-gray-400'
          }`}>
            {feedback === 'correcto' ? (contadorSegundos ? '¡Mantén!' : '✅ ¡Bien!')
              : feedback === 'incorrecto' ? '🙂 Intenta'
              : 'Detectado'}
          </p>
        </div>
      </div>

      {!cameraActiva ? (
        <button onClick={activarCamara} className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium text-sm mb-3">
          📷 Activar cámara
        </button>
      ) : (
        <button onClick={detenerCamara} className="w-full bg-red-100 text-red-600 border border-red-200 py-3 rounded-xl font-medium text-sm mb-3">
          ⏹ Detener cámara
        </button>
      )}

      <button
        onClick={siguienteRonda}
        className="w-full border border-purple-300 text-purple-600 py-3 rounded-xl font-medium text-sm"
      >
        Saltar esta seña →
      </button>

    </div>
  )
}