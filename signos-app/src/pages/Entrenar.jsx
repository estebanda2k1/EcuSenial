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

// Estado inicial limpio por tipo
function estadoInicial() {
  return {
    fase: 'inicio',        // 'inicio' | 'grabando' | 'listo_entrenar' | 'entrenando' | 'listo'
    letraActual: 0,
    muestras: [],
    conteo: 0,
    grabando: false,
  }
}

export default function Entrenar() {
  const videoRef = useRef(null)
  const navigate = useNavigate()
  const landmarksRef = useRef(null)

  // Qué tipo está activo en pantalla: null = pantalla de selección
  const [tipoActivo, setTipoActivo] = useState(null)

  // Estado independiente por tipo
  const [estadoLetras,   setEstadoLetras]   = useState(estadoInicial())
  const [estadoNumeros,  setEstadoNumeros]  = useState(estadoInicial())

  function getEstado()    { return tipoActivo === 'letras' ? estadoLetras   : estadoNumeros  }
  function setEstado(fn)  {
    if (tipoActivo === 'letras') setEstadoLetras(fn)
    else                         setEstadoNumeros(fn)
  }

  const estado    = tipoActivo ? getEstado() : estadoInicial()
  const LETRAS    = tipoActivo ? CONJUNTOS[tipoActivo] : []
  const esNumeros = tipoActivo === 'numeros'

  function onResultado(landmarks) {
    landmarksRef.current = landmarks
  }

  const { iniciar } = useMediaPipe(videoRef, onResultado)

  // ── Selección de tipo ──────────────────────────────────────────
  function seleccionar(tipo) {
    setTipoActivo(tipo)
  }

  function volverSeleccion() {
    // Detener cámara si estaba activa
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    setTipoActivo(null)
  }

  // ── Cámara ────────────────────────────────────────────────────
  async function activarCamara() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } }
    })
    videoRef.current.srcObject = stream
    await videoRef.current.play()
    await iniciar()
    setEstado(e => ({ ...e, fase: 'grabando' }))
  }

  // ── Captura ───────────────────────────────────────────────────
  function capturarMuestra() {
    if (!landmarksRef.current) { alert('No se detecta la mano, ajusta la posición'); return }
    const vector  = normalizar(landmarksAVector(landmarksRef.current))
    const etiqueta = new Array(LETRAS.length).fill(0)
    etiqueta[estado.letraActual] = 1
    setEstado(e => ({ ...e, muestras: [...e.muestras, { vector, etiqueta }], conteo: e.conteo + 1 }))
  }

  async function grabarAutomatico() {
    setEstado(e => ({ ...e, grabando: true }))
    let capturadas = 0
    const letrasSnap = LETRAS          // snapshot para el closure
    const letraSnap  = estado.letraActual

    const intervalo = setInterval(() => {
      if (!landmarksRef.current) return
      if (capturadas >= MUESTRAS_POR_LETRA) {
        clearInterval(intervalo)
        setEstado(e => {
          const siguiente = e.letraActual + 1
          if (siguiente < letrasSnap.length) {
            return { ...e, grabando: false, letraActual: siguiente, conteo: 0 }
          }
          return { ...e, grabando: false, fase: 'listo_entrenar' }
        })
        return
      }
      const vector   = normalizar(landmarksAVector(landmarksRef.current))
      const etiqueta = new Array(letrasSnap.length).fill(0)
      etiqueta[letraSnap] = 1
      capturadas++
      setEstado(e => ({ ...e, muestras: [...e.muestras, { vector, etiqueta }], conteo: capturadas }))
    }, 200)
  }

  // ── Entrenamiento ─────────────────────────────────────────────
  async function iniciarEntrenamiento() {
    setEstado(e => ({ ...e, fase: 'entrenando' }))
    const datos     = estado.muestras.map(m => m.vector)
    const etiquetas = estado.muestras.map(m => m.etiqueta)
    await entrenarModelo(datos, etiquetas, LETRAS, tipoActivo)
    await guardarModelo(tipoActivo)
    setEstado(e => ({ ...e, fase: 'listo' }))
  }

  // ── Reiniciar ese tipo ────────────────────────────────────────
  function reiniciarTipo() {
    setEstado(() => estadoInicial())
  }

  // ── Badge de estado por tipo (para pantalla de selección) ─────
  function badgeTipo(tipo) {
    const est = tipo === 'letras' ? estadoLetras : estadoNumeros
    if (est.fase === 'listo')           return { texto: '✅ Entrenado', color: 'teal' }
    if (est.fase === 'entrenando')      return { texto: '⏳ Entrenando', color: 'amber' }
    if (est.fase === 'listo_entrenar')  return { texto: '📊 Listo para entrenar', color: 'amber' }
    if (est.fase === 'grabando')        return { texto: `🎥 ${est.letraActual}/${CONJUNTOS[tipo].length}`, color: 'purple' }
    return null
  }

  // ══════════════════════════════════════════════════════════════
  // PANTALLA DE SELECCIÓN
  // ══════════════════════════════════════════════════════════════
  if (!tipoActivo) {
    return (
      <div className="min-h-screen bg-purple-50 p-4">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-1 text-purple-600 font-bold text-base active:scale-95 transition-transform">
            ← Inicio
          </button>
          <span className="font-extrabold text-gray-700 text-lg">🤖 Entrenar modelo</span>
          <span className="w-16" />
        </div>

        <p className="text-center text-gray-500 text-sm mb-5 font-medium">
          Cada conjunto se entrena y guarda de forma independiente
        </p>

        <div className="flex flex-col gap-4">
          {/* Letras */}
          {(() => {
            const badge = badgeTipo('letras')
            return (
              <button
                onClick={() => seleccionar('letras')}
                className="bg-white rounded-3xl border-2 border-purple-100 p-6 text-left shadow-md active:scale-95 transition-transform hover:border-purple-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl">🔤</span>
                  {badge && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      badge.color === 'teal'   ? 'bg-teal-100 text-teal-700' :
                      badge.color === 'amber'  ? 'bg-amber-100 text-amber-700' :
                                                  'bg-purple-100 text-purple-700'
                    }`}>{badge.texto}</span>
                  )}
                </div>
                <p className="font-extrabold text-gray-800 text-xl mb-1">Letras A – Z</p>
                <p className="text-sm text-gray-400">26 señas · {MUESTRAS_POR_LETRA} muestras c/u</p>
                {estadoLetras.fase === 'grabando' && (
                  <div className="mt-3 w-full bg-purple-100 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${(estadoLetras.letraActual / 26) * 100}%` }} />
                  </div>
                )}
              </button>
            )
          })()}

          {/* Números */}
          {(() => {
            const badge = badgeTipo('numeros')
            return (
              <button
                onClick={() => seleccionar('numeros')}
                className="bg-white rounded-3xl border-2 border-amber-100 p-6 text-left shadow-md active:scale-95 transition-transform hover:border-amber-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl">🔢</span>
                  {badge && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      badge.color === 'teal'   ? 'bg-teal-100 text-teal-700' :
                      badge.color === 'amber'  ? 'bg-amber-100 text-amber-700' :
                                                  'bg-purple-100 text-purple-700'
                    }`}>{badge.texto}</span>
                  )}
                </div>
                <p className="font-extrabold text-gray-800 text-xl mb-1">Números 1 – 10</p>
                <p className="text-sm text-gray-400">10 señas · {MUESTRAS_POR_LETRA} muestras c/u</p>
                {estadoNumeros.fase === 'grabando' && (
                  <div className="mt-3 w-full bg-amber-100 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full transition-all"
                      style={{ width: `${(estadoNumeros.letraActual / 10) * 100}%` }} />
                  </div>
                )}
              </button>
            )
          })()}
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════
  // PANTALLA DE ENTRENAMIENTO (letras O números)
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-purple-50 p-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={volverSeleccion}
          className="flex items-center gap-1 text-purple-600 font-bold text-base active:scale-95 transition-transform"
        >
          ← Volver
        </button>
        <span className="font-extrabold text-gray-700 text-lg">
          {esNumeros ? '🔢 Números' : '🔤 Letras'}
        </span>
        <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full font-bold">
          {estado.letraActual}/{LETRAS.length}
        </span>
      </div>

      {/* Video */}
      <div
        className="bg-gray-900 rounded-2xl overflow-hidden mb-4 shadow-lg"
        style={{ height: estado.fase === 'grabando' ? '220px' : '0px', transition: 'height 0.3s' }}
      >
        <video
          ref={videoRef}
          autoPlay playsInline muted
          style={{ width: '100%', height: '220px', objectFit: 'contain', display: 'block' }}
        />
      </div>

      {/* ── Fase: inicio ── */}
      {estado.fase === 'inicio' && (
        <div className="bg-white rounded-3xl border-2 border-purple-100 p-7 text-center shadow-md">
          <p className="text-5xl mb-4">🤖</p>
          <h2 className="font-extrabold text-gray-800 text-xl mb-3">
            Entrenar {esNumeros ? 'números 1–10' : 'letras A–Z'}
          </h2>
          <p className="text-base text-gray-500 mb-6 leading-relaxed">
            Vas a grabar <strong>{MUESTRAS_POR_LETRA}</strong> muestras de cada {esNumeros ? 'número' : 'letra'}{' '}
            (<strong>{LETRAS.length}</strong> en total). El modelo se guarda de forma separada.
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
      {estado.fase === 'grabando' && (
        <div>
          <div className={`rounded-3xl p-5 mb-4 text-center shadow-lg ${
            esNumeros ? 'bg-gradient-to-br from-amber-500 to-amber-600' : 'bg-gradient-to-br from-purple-600 to-purple-700'
          }`}>
            <p className="text-base text-white font-semibold mb-1">Muestra esta seña</p>
            <p className="text-7xl font-extrabold text-white mb-3">{LETRAS[estado.letraActual]}</p>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-3 mb-2">
              <div
                className="bg-white h-3 rounded-full transition-all"
                style={{ width: `${(estado.conteo / MUESTRAS_POR_LETRA) * 100}%` }}
              />
            </div>
            <p className="text-sm text-white font-bold">{estado.conteo} / {MUESTRAS_POR_LETRA} muestras</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={capturarMuestra}
              disabled={estado.conteo >= MUESTRAS_POR_LETRA}
              className="bg-purple-600 text-white py-4 rounded-2xl font-bold text-base disabled:opacity-40 shadow-md active:scale-95 transition-transform hover:bg-purple-700"
            >
              📸 Capturar una
            </button>
            <button
              onClick={grabarAutomatico}
              disabled={estado.grabando || estado.conteo >= MUESTRAS_POR_LETRA}
              className="bg-teal-600 text-white py-4 rounded-2xl font-bold text-base disabled:opacity-40 shadow-md active:scale-95 transition-transform hover:bg-teal-700"
            >
              {estado.grabando ? '⏳ Grabando...' : '⚡ Auto grabar'}
            </button>
          </div>

          {estado.conteo >= MUESTRAS_POR_LETRA && estado.letraActual + 1 < LETRAS.length && (
            <button
              onClick={() => setEstado(e => ({ ...e, letraActual: e.letraActual + 1, conteo: 0 }))}
              className="w-full bg-amber-500 text-white py-4 rounded-2xl font-bold text-base mb-4 shadow-md active:scale-95 transition-transform hover:bg-amber-600"
            >
              Siguiente → {LETRAS[estado.letraActual + 1]}
            </button>
          )}

          {estado.conteo >= MUESTRAS_POR_LETRA && estado.letraActual + 1 >= LETRAS.length && (
            <button
              onClick={() => setEstado(e => ({ ...e, fase: 'listo_entrenar' }))}
              className="w-full bg-teal-600 text-white py-4 rounded-2xl font-bold text-base mb-4 shadow-md active:scale-95 transition-transform hover:bg-teal-700"
            >
              ✅ Todas listas → Entrenar
            </button>
          )}

          {/* Mapa de progreso */}
          <div className="bg-white rounded-2xl p-4 border-2 border-gray-100 shadow-sm">
            <p className="text-sm font-bold text-gray-500 mb-3">Progreso</p>
            <div className="flex flex-wrap gap-2">
              {LETRAS.map((l, i) => (
                <span
                  key={l}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold transition-all ${
                    i < estado.letraActual
                      ? 'bg-teal-100 text-teal-700 border-2 border-teal-300'
                      : i === estado.letraActual
                        ? esNumeros
                          ? 'bg-amber-500 text-white shadow-md scale-110'
                          : 'bg-purple-600 text-white shadow-md scale-110'
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                  }`}
                >
                  {i < estado.letraActual ? '✓' : l}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Fase: listo_entrenar ── */}
      {estado.fase === 'listo_entrenar' && (
        <div className="bg-white rounded-3xl border-2 border-teal-100 p-7 text-center shadow-md">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="font-extrabold text-gray-800 text-xl mb-2">Datos grabados</h2>
          <p className="text-base text-gray-500 mb-1">
            <strong>{estado.muestras.length}</strong> muestras de{' '}
            <strong>{LETRAS.length}</strong> {esNumeros ? 'números' : 'letras'} listas
          </p>
          <p className="text-sm text-gray-400 mb-7 leading-relaxed">El modelo va a aprender. Esto tarda 1–2 minutos.</p>
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
      {estado.fase === 'entrenando' && (
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
      {estado.fase === 'listo' && (
        <div className="bg-white rounded-3xl border-2 border-teal-100 p-7 text-center shadow-md">
          <p className="text-5xl mb-3">🎉</p>
          <h2 className="font-extrabold text-gray-800 text-xl mb-1">
            ¡Modelo de {esNumeros ? 'números' : 'letras'} listo!
          </h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Guardado en el navegador. Descárgalo para usar en el proyecto.
          </p>

          <button
            onClick={() => exportarModelo(tipoActivo)}
            className={`w-full text-white py-4 rounded-2xl font-bold text-base mb-3 shadow-md active:scale-95 transition-transform ${
              esNumeros ? 'bg-amber-500 hover:bg-amber-600' : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            ⬇️ Descargar modelo de {esNumeros ? 'números' : 'letras'}
          </button>

          <button
            onClick={() => navigate(esNumeros ? '/camara-numeros' : '/camara')}
            className={`w-full text-white py-4 rounded-2xl font-bold text-base mb-4 shadow-md active:scale-95 transition-transform ${
              esNumeros ? 'bg-amber-400 hover:bg-amber-500' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            📷 Probar ahora
          </button>

          <div className="border-t-2 border-gray-100 pt-4 flex flex-col gap-3">
            <button
              onClick={reiniciarTipo}
              className="w-full bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold text-sm border-2 border-gray-200 active:scale-95 transition-transform hover:bg-gray-200"
            >
              🔄 Volver a entrenar {esNumeros ? 'números' : 'letras'}
            </button>
            <button
              onClick={volverSeleccion}
              className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-2xl font-bold text-base border-2 border-gray-200 active:scale-95 transition-transform hover:bg-gray-200"
            >
              {esNumeros ? '🔤 Ir a letras A–Z' : '🔢 Ir a números 1–10'}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}