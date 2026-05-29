import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMediaPipe from '../hooks/useMediaPipe'
import {
  landmarksAVector,
  normalizar,
  entrenarModelo,
  guardarModelo,
  exportarModelo
} from '../utils/modeloLetras'

const CONJUNTOS = {
  letras:  ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
  numeros: ['1','2','3','4','5','6','7','8','9','10']
}
const MUESTRAS_POR_LETRA = 40

export default function Entrenar() {
  const videoRef = useRef(null)
  const navigate = useNavigate()

  const [tipoActual, setTipoActual]   = useState('letras')
  const [fase, setFase]               = useState('inicio')
  const [letraActual, setLetraActual] = useState(0)
  const [muestras, setMuestras]       = useState([])
  const [conteo, setConteo]           = useState(0)
  const [grabando, setGrabando]       = useState(false)
  const landmarksRef = useRef(null)

  const LETRAS = CONJUNTOS[tipoActual]

  function onResultado(landmarks) {
    landmarksRef.current = landmarks
  }

  const { iniciar } = useMediaPipe(videoRef, onResultado)

  // Cambiar conjunto solo desde la pantalla de inicio
  function seleccionarTipo(tipo) {
    setTipoActual(tipo)
    setLetraActual(0)
    setMuestras([])
    setConteo(0)
  }

  async function activarCamara() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } }
    })
    videoRef.current.srcObject = stream
    await videoRef.current.play()
    await iniciar()
    setFase('grabando')
  }

  function capturarMuestra() {
    if (!landmarksRef.current) {
      alert('No se detecta la mano, ajusta la posición')
      return
    }
    const vector = normalizar(landmarksAVector(landmarksRef.current))
    const etiqueta = new Array(LETRAS.length).fill(0)
    etiqueta[letraActual] = 1
    setMuestras(prev => [...prev, { vector, etiqueta }])
    setConteo(prev => prev + 1)
  }

  async function grabarAutomatico() {
    setGrabando(true)
    let capturadas = 0
    const intervalo = setInterval(() => {
      if (!landmarksRef.current) return
      if (capturadas >= MUESTRAS_POR_LETRA) {
        clearInterval(intervalo)
        setGrabando(false)
        if (letraActual + 1 < LETRAS.length) {
          setLetraActual(prev => prev + 1)
          setConteo(0)
        } else {
          setFase('listo_entrenar')
        }
        return
      }
      const vector = normalizar(landmarksAVector(landmarksRef.current))
      const etiqueta = new Array(LETRAS.length).fill(0)
      etiqueta[letraActual] = 1
      setMuestras(prev => [...prev, { vector, etiqueta }])
      capturadas++
      setConteo(capturadas)
    }, 200)
  }

  async function iniciarEntrenamiento() {
    setFase('entrenando')
    const datos    = muestras.map(m => m.vector)
    const etiquetas = muestras.map(m => m.etiqueta)
    await entrenarModelo(datos, etiquetas, LETRAS, tipoActual)
    await guardarModelo(tipoActual)
    setFase('listo')
  }

  // Reiniciar flujo para entrenar el otro conjunto
  function entrenarOtro() {
    const otro = tipoActual === 'letras' ? 'numeros' : 'letras'
    setTipoActual(otro)
    setLetraActual(0)
    setMuestras([])
    setConteo(0)
    setGrabando(false)
    setFase('inicio')
  }

  const esNumeros = tipoActual === 'numeros'

  return (
    <div className="min-h-screen bg-purple-50 p-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-purple-600 font-bold text-base active:scale-95 transition-transform"
        >
          ← Inicio
        </button>
        <span className="font-extrabold text-gray-700 text-lg">🤖 Entrenar modelo</span>
        <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full font-bold">
          {letraActual}/{LETRAS.length}
        </span>
      </div>

      {/* Selector de conjunto — solo en la pantalla de inicio */}
      {fase === 'inicio' && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => seleccionarTipo('letras')}
            className={`rounded-2xl p-4 border-2 text-center transition-all active:scale-95 ${
              tipoActual === 'letras'
                ? 'bg-purple-600 border-purple-700 text-white shadow-lg'
                : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300'
            }`}
          >
            <p className="text-2xl mb-1">🔤</p>
            <p className="font-extrabold text-base">Letras</p>
            <p className={`text-xs mt-0.5 ${tipoActual === 'letras' ? 'text-purple-200' : 'text-gray-400'}`}>
              A – Z · 26 señas
            </p>
          </button>
          <button
            onClick={() => seleccionarTipo('numeros')}
            className={`rounded-2xl p-4 border-2 text-center transition-all active:scale-95 ${
              tipoActual === 'numeros'
                ? 'bg-amber-500 border-amber-600 text-white shadow-lg'
                : 'bg-white border-gray-200 text-gray-700 hover:border-amber-300'
            }`}
          >
            <p className="text-2xl mb-1">🔢</p>
            <p className="font-extrabold text-base">Números</p>
            <p className={`text-xs mt-0.5 ${tipoActual === 'numeros' ? 'text-amber-100' : 'text-gray-400'}`}>
              1 – 10 · 10 señas
            </p>
          </button>
        </div>
      )}

      {/* Badge del conjunto activo (fases distintas al inicio) */}
      {fase !== 'inicio' && (
        <div className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-xl w-fit ${
          esNumeros ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
        }`}>
          <span className="font-bold">{esNumeros ? '🔢 Números 1–10' : '🔤 Letras A–Z'}</span>
        </div>
      )}

      {/* Video — visible solo en fase grabando */}
      <div
        className="bg-gray-900 rounded-2xl overflow-hidden mb-4 shadow-lg"
        style={{ height: fase === 'grabando' ? '220px' : '0px', overflow: 'hidden', transition: 'height 0.3s' }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '220px', objectFit: 'contain', display: 'block' }}
        />
      </div>

      {/* ── Fase: inicio ── */}
      {fase === 'inicio' && (
        <div className="bg-white rounded-3xl border-2 border-purple-100 p-7 text-center shadow-md">
          <p className="text-5xl mb-4">🤖</p>
          <h2 className="font-extrabold text-gray-800 text-xl mb-3">
            Entrenar modelo de {esNumeros ? 'números' : 'letras'}
          </h2>
          <p className="text-base text-gray-500 mb-6 leading-relaxed">
            Vas a grabar <strong>{MUESTRAS_POR_LETRA}</strong> muestras de cada {esNumeros ? 'número' : 'letra'}{' '}
            (<strong>{LETRAS.length}</strong> {esNumeros ? 'números' : 'letras'} en total).
            El modelo aprende de tus propias manos.
          </p>
          <button
            onClick={activarCamara}
            className={`w-full text-white py-4 rounded-2xl font-bold text-lg shadow-md active:scale-95 transition-transform ${
              esNumeros ? 'bg-amber-500 hover:bg-amber-600' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            📷 Comenzar
          </button>
        </div>
      )}

      {/* ── Fase: grabando ── */}
      {fase === 'grabando' && (
        <div>
          {/* Tarjeta de la seña actual */}
          <div className={`rounded-3xl p-5 mb-4 text-center shadow-lg ${
            esNumeros ? 'bg-gradient-to-br from-amber-500 to-amber-600' : 'bg-gradient-to-br from-purple-600 to-purple-700'
          }`}>
            <p className="text-base text-white text-opacity-80 font-semibold mb-1">Muestra esta seña</p>
            <p className="text-7xl font-extrabold text-white mb-3">{LETRAS[letraActual]}</p>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-3 mb-2">
              <div
                className="bg-white h-3 rounded-full transition-all"
                style={{ width: `${(conteo / MUESTRAS_POR_LETRA) * 100}%` }}
              />
            </div>
            <p className="text-sm text-white text-opacity-80 font-bold">
              {conteo} / {MUESTRAS_POR_LETRA} muestras
            </p>
          </div>

          {/* Botones de captura */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={capturarMuestra}
              disabled={conteo >= MUESTRAS_POR_LETRA}
              className="bg-purple-600 text-white py-4 rounded-2xl font-bold text-base disabled:opacity-40 shadow-md active:scale-95 transition-transform hover:bg-purple-700"
            >
              📸 Capturar una
            </button>
            <button
              onClick={grabarAutomatico}
              disabled={grabando || conteo >= MUESTRAS_POR_LETRA}
              className="bg-teal-600 text-white py-4 rounded-2xl font-bold text-base disabled:opacity-40 shadow-md active:scale-95 transition-transform hover:bg-teal-700"
            >
              {grabando ? '⏳ Grabando...' : '⚡ Auto grabar'}
            </button>
          </div>

          {conteo >= MUESTRAS_POR_LETRA && letraActual + 1 < LETRAS.length && (
            <button
              onClick={() => { setLetraActual(prev => prev + 1); setConteo(0) }}
              className={`w-full text-white py-4 rounded-2xl font-bold text-base mb-4 shadow-md active:scale-95 transition-transform ${
                esNumeros ? 'bg-amber-500 hover:bg-amber-600' : 'bg-amber-500 hover:bg-amber-600'
              }`}
            >
              Siguiente → {LETRAS[letraActual + 1]}
            </button>
          )}

          {conteo >= MUESTRAS_POR_LETRA && letraActual + 1 >= LETRAS.length && (
            <button
              onClick={() => setFase('listo_entrenar')}
              className="w-full bg-teal-600 text-white py-4 rounded-2xl font-bold text-base mb-4 shadow-md active:scale-95 transition-transform hover:bg-teal-700"
            >
              ✅ Todas listas → Entrenar
            </button>
          )}

          {/* Mapa de progreso */}
          <div className="bg-white rounded-2xl p-4 border-2 border-gray-100 shadow-sm">
            <p className="text-sm font-bold text-gray-500 mb-3">
              Progreso — {esNumeros ? 'números' : 'letras'}
            </p>
            <div className="flex flex-wrap gap-2">
              {LETRAS.map((l, i) => (
                <span
                  key={l}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold transition-all ${
                    i < letraActual
                      ? 'bg-teal-100 text-teal-700 border-2 border-teal-300'
                      : i === letraActual
                        ? esNumeros
                          ? 'bg-amber-500 text-white shadow-md scale-110'
                          : 'bg-purple-600 text-white shadow-md scale-110'
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                  }`}
                >
                  {i < letraActual ? '✓' : l}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Fase: listo_entrenar ── */}
      {fase === 'listo_entrenar' && (
        <div className="bg-white rounded-3xl border-2 border-teal-100 p-7 text-center shadow-md">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="font-extrabold text-gray-800 text-xl mb-2">Datos grabados</h2>
          <p className="text-base text-gray-500 mb-1">
            <strong>{muestras.length}</strong> muestras de{' '}
            <strong>{LETRAS.length}</strong> {esNumeros ? 'números' : 'letras'} listas
          </p>
          <p className="text-sm text-gray-400 mb-7 leading-relaxed">
            El modelo va a aprender. Esto tarda 1–2 minutos.
          </p>
          <button
            onClick={iniciarEntrenamiento}
            className={`w-full text-white py-4 rounded-2xl font-bold text-lg shadow-md active:scale-95 transition-transform ${
              esNumeros ? 'bg-amber-500 hover:bg-amber-600' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            🧠 Entrenar modelo
          </button>
        </div>
      )}

      {/* ── Fase: entrenando ── */}
      {fase === 'entrenando' && (
        <div className="bg-white rounded-3xl border-2 border-purple-100 p-7 text-center shadow-md">
          <p className="text-5xl mb-4">⏳</p>
          <h2 className="font-extrabold text-gray-800 text-xl mb-2">Entrenando...</h2>
          <p className="text-sm text-gray-400 mb-6">
            Modelo de <strong>{esNumeros ? 'números' : 'letras'}</strong> — revisa la consola (F12)
          </p>
          <div className="w-full bg-purple-100 rounded-full h-4 animate-pulse">
            <div className="bg-purple-600 h-4 rounded-full" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {/* ── Fase: listo ── */}
      {fase === 'listo' && (
        <div className="bg-white rounded-3xl border-2 border-teal-100 p-7 text-center shadow-md">
          <p className="text-5xl mb-3 animate-celebrate">🎉</p>
          <h2 className="font-extrabold text-gray-800 text-xl mb-1">
            ¡Modelo de {esNumeros ? 'números' : 'letras'} listo!
          </h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Guardado en el navegador. Descárgalo para usar en el proyecto.
          </p>

          {/* Descargar el modelo entrenado */}
          <button
            onClick={() => exportarModelo(tipoActual)}
            className={`w-full text-white py-4 rounded-2xl font-bold text-base mb-3 shadow-md active:scale-95 transition-transform ${
              esNumeros ? 'bg-amber-500 hover:bg-amber-600' : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            ⬇️ Descargar modelo de {esNumeros ? 'números' : 'letras'}
          </button>

          {/* Probar en la cámara */}
          <button
            onClick={() => navigate(esNumeros ? '/camara-numeros' : '/camara')}
            className={`w-full text-white py-4 rounded-2xl font-bold text-base mb-4 shadow-md active:scale-95 transition-transform ${
              esNumeros ? 'bg-amber-400 hover:bg-amber-500' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            📷 Probar ahora
          </button>

          <div className="border-t-2 border-gray-100 pt-4">
            <p className="text-sm text-gray-400 mb-3 font-semibold">¿Quieres entrenar el otro conjunto?</p>
            <button
              onClick={entrenarOtro}
              className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-2xl font-bold text-base border-2 border-gray-200 active:scale-95 transition-transform hover:bg-gray-200"
            >
              {esNumeros ? '🔤 Entrenar letras A–Z' : '🔢 Entrenar números 1–10'}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
