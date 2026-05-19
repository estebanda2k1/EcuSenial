import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMediaPipe from '../hooks/useMediaPipe'
import { detectarLetra } from '../utils/detectarLetra'

export default function Camara() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const navigate = useNavigate()
  const [cameraActiva, setCameraActiva] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [precision, setPrecision] = useState(0)
  const [racha, setRacha] = useState(0)
  const [estrellas, setEstrellas] = useState(0)
  const [letraDetectada, setLetraDetectada] = useState(null)
  const [letra] = useState('A')

  function onResultado(landmarks) {
    if (!landmarks) {
      setLetraDetectada(null)
      return
    }

    dibujarPuntos(landmarks)
    const detectada = detectarLetra(landmarks)
    setLetraDetectada(detectada)

    if (detectada === letra) {
      setFeedback('correcto')
      setPrecision(95)
      setRacha(prev => prev + 1)
      setEstrellas(prev => Math.min(prev + 1, 3))
    } else if (detectada) {
      setFeedback('incorrecto')
      setPrecision(30)
    }
  }

  function dibujarPuntos(landmarks) {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return
    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    landmarks.forEach(punto => {
      const x = punto.x * canvas.width
      const y = punto.y * canvas.height
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, 2 * Math.PI)
      ctx.fillStyle = '#7F77DD'
      ctx.fill()
    })
  }

  const { iniciar, detener, cargando, activo } = useMediaPipe(videoRef, onResultado)

  async function activarCamara() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } }
      })
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
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop())
    }
    setCameraActiva(false)
    setLetraDetectada(null)
  }

  function volverAtras() {
    detenerCamara()
    navigate('/modulo')
  }

  return (
    <div className="min-h-screen bg-purple-50 p-4">

      <div className="flex items-center justify-between mb-4">
        <button onClick={volverAtras} className="text-purple-600 font-medium text-sm">
          ← Módulo
        </button>
        <span className="font-medium text-gray-700">Práctica · Letra {letra}</span>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
          {racha} racha
        </span>
      </div>

      <div className="flex gap-3 mb-4">
        <div
          className="flex-1 bg-gray-900 rounded-2xl overflow-hidden"
          style={{ height: '200px', position: 'relative' }}
        >
          <video
            ref={videoRef}
            autoPlay playsInline muted
            style={{ width: '100%', height: '200px', objectFit: 'contain', display: 'block' }}
          />
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
          {cargando && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <p className="text-white text-sm">Cargando IA...</p>
            </div>
          )}
          {!cameraActiva && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
              onClick={activarCamara}
            >
              <span className="text-4xl mb-2">📷</span>
              <p className="text-sm text-gray-300">Toca para activar</p>
            </div>
          )}
          {letraDetectada && (
            <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded-lg text-sm font-bold">
              {letraDetectada}
            </div>
          )}
        </div>

        <div className="w-28 flex flex-col gap-3">
          <div className="bg-purple-100 border border-purple-300 rounded-xl p-3 text-center">
            <p className="text-4xl font-bold text-purple-700">{letra}</p>
            <p className="text-xs text-purple-500 mt-1">Imita esta seña</p>
          </div>
          <div className={`rounded-xl p-3 text-center border transition-all ${
            feedback === 'correcto' ? 'bg-teal-100 border-teal-300'
            : feedback === 'incorrecto' ? 'bg-red-100 border-red-300'
            : 'bg-white border-gray-200'
          }`}>
            <p className="text-2xl">
              {feedback === 'correcto' ? '✅' : feedback === 'incorrecto' ? '❌' : '✋'}
            </p>
            <p className={`text-xs mt-1 ${
              feedback === 'correcto' ? 'text-teal-700'
              : feedback === 'incorrecto' ? 'text-red-700'
              : 'text-gray-400'
            }`}>
              {feedback === 'correcto' ? '¡Correcto!'
              : feedback === 'incorrecto' ? 'Intenta de nuevo'
              : 'Esperando...'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
          <p className="text-xl font-bold text-gray-800">{precision}%</p>
          <p className="text-xs text-gray-400">Precisión</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
          <p className="text-xl font-bold text-gray-800">{racha}</p>
          <p className="text-xs text-gray-400">Racha</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
          <p className="text-xl font-bold text-gray-800">
            {'⭐'.repeat(estrellas)}{'☆'.repeat(3 - estrellas)}
          </p>
          <p className="text-xs text-gray-400">Estrellas</p>
        </div>
      </div>

      {!cameraActiva ? (
        <button onClick={activarCamara} className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium text-sm mb-3">
          📷 Activar cámara y detección
        </button>
      ) : (
        <button onClick={detenerCamara} className="w-full bg-red-100 text-red-600 border border-red-200 py-3 rounded-xl font-medium text-sm mb-3">
          ⏹ Detener
        </button>
      )}

    </div>
  )
}