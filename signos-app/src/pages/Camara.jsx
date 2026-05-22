import { useRef, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useMediaPipe from '../hooks/useMediaPipe'
import { detectarLetra } from '../utils/detectarLetra'
import { predecir, cargarModelo } from '../utils/modeloLetras'

export default function Camara({ modo = 'letras' }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const esNumeros = modo === 'numeros'
  const LETRAS = esNumeros
    ? ['1','2','3','4','5','6','7','8','9','10']
    : ['A','B','C','D','E','F','G','I','K','L','M','N','O','R','S','T','U','V','W','Y']

  const letraInicial = location.state?.letra || LETRAS[0]
  const modoLibre = location.state?.libre || false
  const indiceInicial = LETRAS.indexOf(letraInicial) >= 0 ? LETRAS.indexOf(letraInicial) : 0

  const [cameraActiva, setCameraActiva] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [racha, setRacha] = useState(0)
  const [estrellas, setEstrellas] = useState(0)
  const [aciertos, setAciertos] = useState(0)
  const [mensaje, setMensaje] = useState(null)
  const [animacion, setAnimacion] = useState(null)
  const [letraDetectada, setLetraDetectada] = useState(null)
  const [modeloCargado, setModeloCargado] = useState(false)
  const [indiceLetra, setIndiceLetra] = useState(indiceInicial)
  const [pantalla, setPantalla] = useState('practica')
  const [bloqueado, setBloqueado] = useState(false)

  const letra = LETRAS[indiceLetra]
  const mensajesAnimo = ['¡Casi! 💪', '¡Tú puedes! 🤗', '¡Sigue! 😊', '¡Un poco más! 🌈']

  useEffect(() => {
    cargarModelo().then(ok => setModeloCargado(ok))
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
    if (!landmarks || bloqueado || pantalla !== 'practica') return
    dibujarPuntos(landmarks)

    let detectada = null
    if (modeloCargado) {
      detectada = await predecir(landmarks, LETRAS)
    } else {
      detectada = detectarLetra(landmarks)
    }
    setLetraDetectada(detectada)

    if (detectada === letra) {
      if (modoLibre) {
        // En modo libre solo muestra check, sin celebración
        setFeedback('correcto')
        setAciertos(prev => prev + 1)
        setRacha(prev => prev + 1)
        setEstrellas(prev => Math.min(prev + 1, 3))
      } else {
        setBloqueado(true)
        setFeedback('correcto')
        setAnimacion('exito')
        setAciertos(prev => prev + 1)
        setRacha(prev => prev + 1)
        setEstrellas(prev => Math.min(prev + 1, 3))
        setTimeout(() => {
          setPantalla('celebracion')
          setAnimacion(null)
          setBloqueado(false)
        }, 1000)
      }
    } else if (detectada) {
      setFeedback('incorrecto')
      if (!modoLibre) {
        setMensaje(mensajesAnimo[Math.floor(Math.random() * mensajesAnimo.length)])
        setTimeout(() => setMensaje(null), 1500)
      }
      setRacha(0)
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
    setLetraDetectada(null)
  }

  function volverAtras() {
    detenerCamara()
    navigate(esNumeros ? '/modulo-numeros' : '/modulo')
  }

  function siguienteLetra() {
    if (indiceLetra + 1 >= LETRAS.length) {
      setPantalla('final')
    } else {
      setIndiceLetra(prev => prev + 1)
      setFeedback(null)
      setLetraDetectada(null)
      setMensaje(null)
      setPantalla('practica')
    }
  }

  function letraAnterior() {
    if (indiceLetra > 0) {
      setIndiceLetra(prev => prev - 1)
      setFeedback(null)
      setLetraDetectada(null)
      setMensaje(null)
    }
  }

  // ── Pantalla celebración ─────────────────────────────────
  if (pantalla === 'celebracion') {
    return (
      <div className="min-h-screen bg-teal-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-7xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-3xl font-extrabold text-teal-700 mb-2">
          ¡Letra {letra} completada!
        </h2>
        <div className="flex gap-1 mb-8">
          {'⭐'.repeat(estrellas).split('').map((s, i) => (
            <span key={i} className="text-3xl">{s}</span>
          ))}
        </div>
        <div className="w-full max-w-xs flex flex-col gap-3">
          {indiceLetra + 1 < LETRAS.length ? (
            <button
              onClick={siguienteLetra}
              className="w-full bg-teal-600 text-white py-4 rounded-2xl font-bold text-lg"
            >
              Siguiente: {LETRAS[indiceLetra + 1]} →
            </button>
          ) : (
            <button
              onClick={() => setPantalla('final')}
              className="w-full bg-teal-600 text-white py-4 rounded-2xl font-bold text-lg"
            >
              ¡Ver mis resultados! 🏆
            </button>
          )}
          <button
            onClick={() => { setFeedback(null); setLetraDetectada(null); setPantalla('practica') }}
            className="w-full border border-teal-400 text-teal-600 py-3 rounded-2xl font-medium"
          >
            Repetir letra {letra}
          </button>
          <button onClick={volverAtras} className="text-sm text-gray-400 mt-1">
            ← Volver al módulo
          </button>
        </div>
      </div>
    )
  }

  // ── Pantalla final ───────────────────────────────────────
  if (pantalla === 'final') {
    return (
      <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-7xl mb-4">🏆</div>
        <h2 className="text-3xl font-extrabold text-purple-700 mb-2">¡Sesión completada!</h2>
        <p className="text-purple-500 mb-6">Practicaste {aciertos} letras correctamente</p>
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs mb-8">
          <div className="bg-white rounded-2xl p-4 border border-purple-100 text-center">
            <p className="text-2xl font-bold text-purple-700">{aciertos}</p>
            <p className="text-xs text-gray-400">Aciertos</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-purple-100 text-center">
            <p className="text-2xl font-bold text-purple-700">{racha}</p>
            <p className="text-xs text-gray-400">Mejor racha</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-purple-100 text-center">
            <p className="text-xl font-bold text-purple-700">{'⭐'.repeat(Math.min(estrellas, 3))}</p>
            <p className="text-xs text-gray-400">Estrellas</p>
          </div>
        </div>
        <div className="w-full max-w-xs flex flex-col gap-3">
          <button onClick={() => navigate('/')} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg">
            🏠 Ir al inicio
          </button>
          <button
            onClick={() => { setIndiceLetra(indiceInicial); setAciertos(0); setRacha(0); setEstrellas(0); setFeedback(null); setPantalla('practica') }}
            className="w-full border border-purple-400 text-purple-600 py-3 rounded-2xl font-medium"
          >
            Volver a intentar
          </button>
        </div>
      </div>
    )
  }

  // ── Pantalla práctica ────────────────────────────────────
  return (
    <div className="min-h-screen bg-purple-50 p-4">

      <div className="flex items-center justify-between mb-3">
        <button onClick={volverAtras} className="text-purple-600 font-medium text-sm">
          ← {esNumeros ? 'Números' : 'Módulo'}
        </button>
        <span className="text-xs font-medium text-purple-500 bg-purple-100 px-3 py-1 rounded-full">
          {modoLibre ? '🆓 Modo libre' : `${indiceLetra + 1} / ${LETRAS.length}`}
        </span>
      </div>

      {!modoLibre && (
        <div className="w-full bg-purple-100 rounded-full h-2 mb-4">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${(indiceLetra / LETRAS.length) * 100}%` }}
          />
        </div>
      )}

      {/* Letra objetivo — grande y clara */}
      <div className="bg-purple-600 rounded-3xl p-6 mb-4 text-center">
        <p className="text-sm text-purple-200 mb-1">
          {modoLibre ? 'Practica esta seña' : 'Haz esta seña'}
        </p>
        <p className="text-8xl font-extrabold text-white leading-none">{letra}</p>
        <p className="text-purple-200 text-sm mt-2">
          {esNumeros ? `Número ${letra}` : `Letra ${letra}`}
        </p>
      </div>

      <div className="flex gap-3 mb-4">
        {/* Cámara */}
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

        {/* Letra detectada — grande */}
        <div className={`w-32 rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${
          feedback === 'correcto'
            ? 'bg-teal-100 border-teal-400'
            : feedback === 'incorrecto'
              ? 'bg-amber-50 border-amber-300'
              : 'bg-white border-gray-200'
        }`}>
          {modoLibre ? (
            <>
              <p className="text-7xl font-extrabold leading-none" style={{
                color: feedback === 'correcto' ? '#0F6E56'
                  : feedback === 'incorrecto' ? '#B45309'
                  : '#C4B5FD'
              }}>
                {letraDetectada || '?'}
              </p>
              <p className="text-xs text-gray-400 mt-2">Detectado</p>
            </>
          ) : (
            <>
              <p className="text-6xl font-extrabold leading-none mb-1" style={{
                color: feedback === 'correcto' ? '#0F6E56'
                  : feedback === 'incorrecto' ? '#B45309'
                  : '#C4B5FD'
              }}>
                {letraDetectada || '?'}
              </p>
              <p className={`text-xs font-medium ${
                feedback === 'correcto' ? 'text-teal-600'
                : feedback === 'incorrecto' ? 'text-amber-600'
                : 'text-gray-400'
              }`}>
                {feedback === 'correcto' ? '✅ ¡Correcto!'
                  : feedback === 'incorrecto' ? '🙂 Intenta'
                  : 'Detectado'}
              </p>
              {mensaje && (
                <p className="text-xs text-amber-600 text-center px-2 mt-1">{mensaje}</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Controles de navegación en modo libre */}
      {modoLibre && (
        <div className="flex gap-3 mb-3">
          <button
            onClick={letraAnterior}
            disabled={indiceLetra === 0}
            className="flex-1 border border-purple-300 text-purple-600 py-3 rounded-xl font-medium text-sm disabled:opacity-30"
          >
            ← Anterior
          </button>
          <button
            onClick={siguienteLetra}
            disabled={indiceLetra >= LETRAS.length - 1}
            className="flex-1 border border-purple-300 text-purple-600 py-3 rounded-xl font-medium text-sm disabled:opacity-30"
          >
            Siguiente →
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
          <p className="text-xl font-bold text-gray-800">{aciertos}</p>
          <p className="text-xs text-gray-400">Aciertos</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
          <p className="text-xl font-bold text-gray-800">{racha}</p>
          <p className="text-xs text-gray-400">Racha</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
          <p className="text-xl font-bold text-gray-800">{'⭐'.repeat(estrellas)}{'☆'.repeat(3 - estrellas)}</p>
          <p className="text-xs text-gray-400">Estrellas</p>
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

      {!modoLibre && (
        <button onClick={siguienteLetra} className="w-full border border-purple-300 text-purple-600 py-3 rounded-xl font-medium text-sm">
          Saltar → {LETRAS[indiceLetra + 1] || 'Finalizar'}
        </button>
      )}

    </div>
  )
}