import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Camara() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const navigate = useNavigate()
  const [cameraActiva, setCameraActiva] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [precision, setPrecision] = useState(0)
  const [racha, setRacha] = useState(0)
  const [estrellas, setEstrellas] = useState(0)
  const [letra] = useState('M')

  useEffect(() => {
    return () => {
      detenerCamara()
    }
  }, [])

  function detenerCamara() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraActiva(false)
  }

  function volverAtras() {
    detenerCamara()
    navigate('/modulo')
  }

  async function activarCamara() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'user', 
        width: { ideal: 320 }, 
        height: { ideal: 240 } 
      }
    })
    streamRef.current = stream
    setCameraActiva(true)
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(e => console.log(e))
      }
    }, 100)
  } catch (err) {
    console.error('Error cámara:', err.name, err.message)
    alert('Error: ' + err.name + ' - ' + err.message)
  }
}

  function simularDeteccion() {
    const resultados = [
      { correcto: true, prec: 94 },
      { correcto: true, prec: 88 },
      { correcto: false, prec: 42 },
      { correcto: true, prec: 97 },
    ]
    const r = resultados[Math.floor(Math.random() * resultados.length)]
    setPrecision(r.prec)
    if (r.correcto) {
      setFeedback('correcto')
      setRacha(prev => prev + 1)
      setEstrellas(prev => Math.min(prev + 1, 3))
    } else {
      setFeedback('incorrecto')
      setRacha(0)
    }
  }

  return (
    <div className="min-h-screen bg-purple-50 p-4">

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={volverAtras}
          className="text-purple-600 font-medium text-sm"
        >
          ← Módulo
        </button>
        <span className="font-medium text-gray-700">Práctica · Letra {letra}</span>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
          {racha} racha
        </span>
      </div>

      <div className="flex gap-3 mb-4">
        <div
            className="flex-1 bg-gray-100 rounded-2xl overflow-hidden"
            style={{ height: '200px', maxHeight: '200px', minHeight: '200px', position: 'relative' }}
        >
          {cameraActiva ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'contain',transform: 'scaleX(-1)',display: 'block',background:"#1a1a1a" }}
            />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
              onClick={activarCamara}
            >
              <span className="text-4xl mb-2">📷</span>
              <p className="text-sm text-gray-500">Toca para activar</p>
              <p className="text-xs text-gray-400">la cámara</p>
            </div>
          )}
        </div>

        <div className="w-28 flex flex-col gap-3">
          <div className="bg-purple-100 border border-purple-300 rounded-xl p-3 text-center">
            <p className="text-4xl font-bold text-purple-700">{letra}</p>
            <p className="text-xs text-purple-500 mt-1">Imita esta seña</p>
          </div>

          <div className={`rounded-xl p-3 text-center border transition-all ${
            feedback === 'correcto'
              ? 'bg-teal-100 border-teal-300'
              : feedback === 'incorrecto'
                ? 'bg-red-100 border-red-300'
                : 'bg-white border-gray-200'
          }`}>
            <p className="text-2xl">
              {feedback === 'correcto' ? '✅' : feedback === 'incorrecto' ? '❌' : '✋'}
            </p>
            <p className={`text-xs mt-1 ${
              feedback === 'correcto'
                ? 'text-teal-700'
                : feedback === 'incorrecto'
                  ? 'text-red-700'
                  : 'text-gray-400'
            }`}>
              {feedback === 'correcto'
                ? '¡Correcto!'
                : feedback === 'incorrecto'
                  ? 'Intenta de nuevo'
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
        <button
          onClick={activarCamara}
          className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium text-sm mb-3"
        >
          📷 Activar cámara
        </button>
      ) : (
        <button
          onClick={detenerCamara}
          className="w-full bg-red-100 text-red-600 border border-red-200 py-3 rounded-xl font-medium text-sm mb-3"
        >
          ⏹ Detener cámara
        </button>
      )}

      <button
        onClick={simularDeteccion}
        className="w-full border border-purple-400 text-purple-700 py-3 rounded-xl font-medium text-sm"
      >
        💡 Simular detección (demo)
      </button>

    </div>
  )
}