import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useMediaPipe from '../hooks/useMediaPipe'
import { predecir, cargarModelo } from '../utils/modeloLetras'
import { detectarLetra } from '../utils/detectarLetra'

const TODAS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','1','2','3','4','5','6','7','8','9','10']

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
  const [fase, setFase] = useState('jugando') // jugando | correcto

  const letraRef = useRef(letraObjetivo)
  const bloqueadoRef = useRef(false)
  const modeloLetrasRef = useRef(false)
  const modeloNumerosRef = useRef(false)
  const deteccionEstableRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    cargarModelo('letras').then(ok  => { modeloLetrasRef.current  = ok })
    cargarModelo('numeros').then(ok => { modeloNumerosRef.current = ok })
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

    const esNumeroTarget = !isNaN(letraRef.current)
    const tipo = esNumeroTarget ? 'numeros' : 'letras'
    const clases = esNumeroTarget
      ? ['1','2','3','4','5','6','7','8','9','10']
      : ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
    const modeloListo = esNumeroTarget ? modeloNumerosRef.current : modeloLetrasRef.current

    let detectada
    if (modeloListo) {
      detectada = await predecir(landmarks, clases, tipo)
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
      <div className="min-h-screen bg-gradient-to-b from-teal-400 to-teal-700 flex flex-col items-center justify-center p-6 text-center">
        <div
          style={{
            position: 'fixed', top: 0, left: 0,
            width: 0, height: 0, overflow: 'hidden', opacity: 0
          }}
        >
          <video ref={videoRef} autoPlay playsInline muted />
        </div>

        <div className="text-8xl mb-2 animate-celebrate">🎉</div>
        <div className="text-5xl mb-6 animate-bounce">🤟</div>

        <div className="bg-white bg-opacity-20 rounded-3xl px-8 py-5 mb-3 border border-white border-opacity-30 backdrop-blur-sm">
          <h2 className="text-3xl font-extrabold text-white mb-1">¡Correcto!</h2>
          <p className="text-teal-100 text-lg font-semibold">
            Seña <span className="text-white font-extrabold text-2xl">{letraObjetivo}</span> perfecta
          </p>
        </div>

        <p className="text-white text-xl font-bold mb-8">
          +{10 + racha} puntos 🔥
        </p>

        <div className="grid grid-cols-3 gap-4 w-full max-w-xs mb-8">
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 border border-white border-opacity-20 text-center">
            <p className="text-3xl font-extrabold text-white">{puntaje}</p>
            <p className="text-xs text-teal-100 mt-1 font-bold">Puntos</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 border border-white border-opacity-20 text-center">
            <p className="text-3xl font-extrabold text-white">{racha}</p>
            <p className="text-xs text-teal-100 mt-1 font-bold">Racha</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 border border-white border-opacity-20 text-center">
            <p className="text-3xl font-extrabold text-white">{rondas}</p>
            <p className="text-xs text-teal-100 mt-1 font-bold">Rondas</p>
          </div>
        </div>

        <div className="w-full max-w-xs flex flex-col gap-3">
          <button
            onClick={siguienteRonda}
            className="w-full bg-white text-teal-700 py-5 rounded-2xl font-extrabold text-xl shadow-xl active:scale-95 transition-transform"
          >
            Siguiente seña →
          </button>
          <button
            onClick={volverAtras}
            className="text-base text-white text-opacity-70 font-medium mt-1"
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

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={volverAtras}
          className="flex items-center gap-1 text-purple-600 font-bold text-base active:scale-95 transition-transform"
        >
          ← Salir
        </button>
        <span className="text-sm font-bold text-purple-600 bg-purple-100 px-4 py-1.5 rounded-full">
          🎯 Desafío
        </span>
        <span className="text-lg font-extrabold text-purple-700">{puntaje} pts</span>
      </div>

      {/* Marcador */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-2xl p-4 text-center border-2 border-gray-100 shadow-sm">
          <p className="text-3xl font-extrabold text-purple-700">{puntaje}</p>
          <p className="text-xs font-bold text-gray-400 mt-0.5">Puntos</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center border-2 border-gray-100 shadow-sm">
          <p className="text-3xl font-extrabold text-orange-500">{racha}</p>
          <p className="text-xs font-bold text-gray-400 mt-0.5">Racha 🔥</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center border-2 border-gray-100 shadow-sm">
          <p className="text-3xl font-extrabold text-teal-600">{mejor}</p>
          <p className="text-xs font-bold text-gray-400 mt-0.5">Mejor</p>
        </div>
      </div>

      {/* Tarjeta de la seña objetivo */}
      <div className={`rounded-3xl px-6 py-7 mb-4 text-center transition-all shadow-lg ${
        feedback === 'correcto' ? 'bg-teal-500' : 'bg-purple-600'
      }`}>
        <p className="text-base text-purple-200 mb-1 font-semibold">¿Puedes hacer esta seña?</p>
        <p
          className="font-extrabold text-white leading-none"
          style={{ fontSize: '7.5rem' }}
        >
          {letraObjetivo}
        </p>
        <p className="text-purple-200 text-sm mt-2 font-medium">
          {isNaN(letraObjetivo) ? `Letra ${letraObjetivo}` : `Número ${letraObjetivo}`}
        </p>
        {contadorSegundos && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="w-full bg-white bg-opacity-30 rounded-full h-3 max-w-xs">
              <div
                className="bg-white h-3 rounded-full transition-all duration-1000"
                style={{ width: contadorSegundos === 2 ? '50%' : '100%' }}
              />
            </div>
            <span className="text-white font-bold text-base">{contadorSegundos}s</span>
          </div>
        )}
      </div>

      {/* Cámara + feedback */}
      <div className="flex gap-3 mb-4">
        <div
          className="flex-1 bg-gray-900 rounded-2xl overflow-hidden shadow-lg"
          style={{ height: '210px', position: 'relative' }}
        >
          <video
            ref={videoRef}
            autoPlay playsInline muted
            style={{ width: '100%', height: '210px', objectFit: 'contain', display: 'block', background: '#1a1a1a' }}
          />
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
          {!cameraActiva && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-gray-900 bg-opacity-90"
              onClick={activarCamara}
            >
              <span className="text-5xl mb-3">📷</span>
              <p className="text-base text-gray-300 font-semibold">Toca para activar</p>
            </div>
          )}
        </div>

        {/* Panel detectado */}
        <div className={`w-36 rounded-2xl flex flex-col items-center justify-center border-2 transition-all shadow-md ${
          feedback === 'correcto' ? 'bg-teal-50 border-teal-400'
          : feedback === 'incorrecto' ? 'bg-amber-50 border-amber-300'
          : 'bg-white border-gray-200'
        }`}>
          <p
            className="font-extrabold leading-none mb-1"
            style={{
              fontSize: letraDetectada && letraDetectada.length > 1 ? '3rem' : '5rem',
              color: feedback === 'correcto' ? '#0F6E56'
                : feedback === 'incorrecto' ? '#B45309' : '#C4B5FD'
            }}
          >
            {letraDetectada || '?'}
          </p>
          <p className={`text-sm font-bold text-center px-1 ${
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

      {/* Botón cámara */}
      {!cameraActiva ? (
        <button
          onClick={activarCamara}
          className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-base mb-3 shadow-md active:scale-95 transition-transform hover:bg-purple-700"
        >
          📷 Activar cámara
        </button>
      ) : (
        <button
          onClick={detenerCamara}
          className="w-full bg-red-50 text-red-600 border-2 border-red-200 py-4 rounded-2xl font-bold text-base mb-3 active:scale-95 transition-transform"
        >
          ⏹ Detener cámara
        </button>
      )}

      {/* Saltar */}
      <button
        onClick={siguienteRonda}
        className="w-full border-2 border-purple-200 text-purple-600 py-3.5 rounded-2xl font-bold text-base active:scale-95 transition-transform hover:bg-purple-50"
      >
        Saltar esta seña →
      </button>

    </div>
  )
}
