import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMediaPipe from '../hooks/useMediaPipe'
import {
  landmarksAVector,
  normalizar,
  entrenarModelo,
  guardarModelo,
  cargarModelo,
  exportarModelo
} from '../utils/modeloLetras'

const LETRAS = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  '1','2','3','4','5','6','7','8','9','10'
]
const MUESTRAS_POR_LETRA = 40

export default function Entrenar() {
  const videoRef = useRef(null)
  const navigate = useNavigate()
  const [cameraActiva, setCameraActiva] = useState(false)  // ← ahora adentro
  const [fase, setFase] = useState('inicio')
  const [letraActual, setLetraActual] = useState(0)
  const [muestras, setMuestras] = useState([])
  const [conteo, setConteo] = useState(0)
  const [grabando, setGrabando] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const landmarksRef = useRef(null)

  function onResultado(landmarks) {
    landmarksRef.current = landmarks
  }

  const { iniciar } = useMediaPipe(videoRef, onResultado)

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
    const datos = muestras.map(m => m.vector)
    const etiquetas = muestras.map(m => m.etiqueta)
    await entrenarModelo(datos, etiquetas, LETRAS)
    await guardarModelo()
    setFase('listo')
  }

    return (
    <div className="min-h-screen bg-purple-50 p-4">

        <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/')} className="text-purple-600 font-medium text-sm">
            ← Inicio
        </button>
        <span className="font-medium text-gray-700">Entrenar modelo</span>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            {letraActual}/{LETRAS.length} letras
        </span>
        </div>

        {/* Video siempre montado en el DOM, solo se oculta visualmente */}
        <div
        className="bg-gray-900 rounded-2xl overflow-hidden mb-4"
        style={{ height: fase === 'grabando' ? '200px' : '0px', overflow: 'hidden', transition: 'height 0.3s' }}
        >
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '200px', objectFit: 'contain', display: 'block' }}
        />
        </div>

        {fase === 'inicio' && (
        <div className="bg-white rounded-2xl border border-purple-100 p-6 text-center">
            <p className="text-4xl mb-3">🤖</p>
            <h2 className="font-bold text-gray-800 text-lg mb-2">Entrenar reconocimiento</h2>
            <p className="text-sm text-gray-500 mb-6">
            Vas a grabar {MUESTRAS_POR_LETRA} muestras de cada letra ({LETRAS.length} letras en total).
            El modelo aprenderá de tus propias manos.
            </p>
            <button
            onClick={activarCamara}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium"
            >
            📷 Comenzar
            </button>
        </div>
        )}

        {fase === 'grabando' && (
        <div>
            <div className="bg-purple-100 border border-purple-300 rounded-2xl p-4 mb-4 text-center">
            <p className="text-6xl font-bold text-purple-700 mb-1">{LETRAS[letraActual]}</p>
            <p className="text-sm text-purple-500">Muestra esta seña al frente de la cámara</p>
            <div className="w-full bg-purple-200 rounded-full h-2 mt-3">
                <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${(conteo / MUESTRAS_POR_LETRA) * 100}%` }}
                />
            </div>
            <p className="text-xs text-purple-500 mt-1">{conteo} / {MUESTRAS_POR_LETRA} muestras</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
            <button
                onClick={capturarMuestra}
                disabled={conteo >= MUESTRAS_POR_LETRA}
                className="bg-purple-600 text-white py-3 rounded-xl font-medium text-sm disabled:opacity-40"
            >
                📸 Capturar una
            </button>
            <button
                onClick={grabarAutomatico}
                disabled={grabando || conteo >= MUESTRAS_POR_LETRA}
                className="bg-teal-600 text-white py-3 rounded-xl font-medium text-sm disabled:opacity-40"
            >
                {grabando ? '⏳ Grabando...' : '⚡ Auto grabar'}
            </button>
            </div>

            {conteo >= MUESTRAS_POR_LETRA && letraActual + 1 < LETRAS.length && (
            <button
                onClick={() => { setLetraActual(prev => prev + 1); setConteo(0) }}
                className="w-full bg-amber-500 text-white py-3 rounded-xl font-medium text-sm mb-3"
            >
                Siguiente letra →
            </button>
            )}

            {conteo >= MUESTRAS_POR_LETRA && letraActual + 1 >= LETRAS.length && (
            <button
                onClick={() => setFase('listo_entrenar')}
                className="w-full bg-teal-600 text-white py-3 rounded-xl font-medium text-sm mb-3"
            >
                ✅ Todas las letras grabadas → Entrenar
            </button>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
            {LETRAS.map((l, i) => (
                <span
                key={l}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                    ${i < letraActual ? 'bg-teal-200 text-teal-700'
                    : i === letraActual ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-500'}`}
                >
                {l}
                </span>
            ))}
            </div>
        </div>
        )}

        {fase === 'listo_entrenar' && (
        <div className="bg-white rounded-2xl border border-purple-100 p-6 text-center">
            <p className="text-4xl mb-3">✅</p>
            <h2 className="font-bold text-gray-800 text-lg mb-2">Datos grabados</h2>
            <p className="text-sm text-gray-500 mb-2">
            {muestras.length} muestras de {LETRAS.length} letras listas
            </p>
            <p className="text-sm text-gray-500 mb-6">
            Ahora el modelo va a aprender. Esto tarda 1-2 minutos.
            </p>
            <button
            onClick={iniciarEntrenamiento}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium"
            >
            🧠 Entrenar modelo
            </button>
        </div>
        )}

        {fase === 'entrenando' && (
        <div className="bg-white rounded-2xl border border-purple-100 p-6 text-center">
            <p className="text-4xl mb-3">⏳</p>
            <h2 className="font-bold text-gray-800 text-lg mb-2">Entrenando...</h2>
            <p className="text-sm text-gray-500 mb-4">Revisa la consola (F12) para ver el progreso</p>
            <div className="w-full bg-purple-100 rounded-full h-3 animate-pulse">
            <div className="bg-purple-600 h-3 rounded-full" style={{ width: '60%' }} />
            </div>
        </div>
        )}

        {fase === 'listo' && (
            <div className="bg-white rounded-2xl border border-purple-100 p-6 text-center">
                <p className="text-4xl mb-3">🎉</p>
                <h2 className="font-bold text-gray-800 text-lg mb-2">Modelo listo</h2>
                <p className="text-sm text-gray-500 mb-4">
                Descarga el modelo para guardarlo en tu proyecto.
                </p>
                <button
                onClick={exportarModelo}
                className="w-full bg-teal-600 text-white py-3 rounded-xl font-medium mb-3"
                >
                ⬇️ Descargar modelo
                </button>
                <button
                onClick={() => navigate('/camara')}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium"
                >
                📷 Probar ahora
                </button>
            </div>
            )}
    </div>
    )
}