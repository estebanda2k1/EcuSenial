import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BASE_LETRAS = [
  { letra: 'A', descripcion: 'Puño cerrado, pulgar al lado' },
  { letra: 'B', descripcion: 'Cuatro dedos juntos arriba' },
  { letra: 'C', descripcion: 'Mano en forma de C' },
  { letra: 'D', descripcion: 'Índice arriba, dedos curvados' },
  { letra: 'E', descripcion: 'Dedos doblados hacia la palma' },
  { letra: 'F', descripcion: 'Índice y pulgar se tocan' },
  { letra: 'G', descripcion: 'Índice apunta al lado' },
  { letra: 'H', descripcion: 'Índice y medio apuntan al lado' },
  { letra: 'I', descripcion: 'Meñique extendido hacia arriba' },
  { letra: 'J', descripcion: 'Meñique dibuja una J en el aire' },
  { letra: 'K', descripcion: 'Índice y medio en V arriba' },
  { letra: 'L', descripcion: 'Índice y pulgar forman una L' },
  { letra: 'M', descripcion: 'Tres dedos sobre el pulgar' },
  { letra: 'N', descripcion: 'Dos dedos sobre el pulgar' },
  { letra: 'O', descripcion: 'Dedos forman un círculo' },
  { letra: 'P', descripcion: 'Índice apunta abajo, pulgar al medio' },
  { letra: 'Q', descripcion: 'Índice y pulgar apuntan abajo' },
  { letra: 'R', descripcion: 'Dedos cruzados' },
  { letra: 'S', descripcion: 'Puño cerrado' },
  { letra: 'T', descripcion: 'Pulgar entre índice y medio' },
  { letra: 'U', descripcion: 'Índice y medio juntos arriba' },
  { letra: 'V', descripcion: 'Índice y medio separados arriba' },
  { letra: 'W', descripcion: 'Tres dedos arriba separados' },
  { letra: 'X', descripcion: 'Índice en forma de gancho' },
  { letra: 'Y', descripcion: 'Pulgar y meñique extendidos' },
  { letra: 'Z', descripcion: 'Índice dibuja una Z' },
]

const BASE_NUMEROS = ['1','2','3','4','5','6','7','8','9','10'].map(n => ({
  letra: n, descripcion: `Seña del número ${n}`
}))

export default function Modulo({ modo = 'letras' }) {
  const navigate = useNavigate()
  const esNumeros = modo === 'numeros'
  const clave = `ecusenial-aprendidas-${esNumeros ? 'numeros' : 'letras'}`
  const base = esNumeros ? BASE_NUMEROS : BASE_LETRAS

  // Letras aprendidas persistidas en localStorage
  const [aprendidas, setAprendidas] = useState(() =>
    JSON.parse(localStorage.getItem(clave) || '[]')
  )

  // items derivados: hecho se calcula desde aprendidas
  const items = base.map(item => ({
    ...item,
    hecho: aprendidas.includes(item.letra)
  }))

  const [seleccionada, setSeleccionada] = useState(items[0])
  const rutaCamara = esNumeros ? '/camara-numeros' : '/camara'

  const hechas = aprendidas.length
  const todasAprendidas = hechas >= items.length

  function reiniciar() {
    localStorage.removeItem(clave)
    setAprendidas([])
  }

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
        <span className="font-extrabold text-gray-700 text-lg">
          {esNumeros ? '🔢 Números' : '🔤 Alfabeto'}
        </span>
        <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full font-bold">
          {hechas}/{items.length}
        </span>
      </div>

      {/* Barra de progreso */}
      {hechas > 0 && !todasAprendidas && (
        <div className="w-full bg-purple-100 rounded-full h-3 mb-5">
          <div
            className="bg-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(hechas / items.length) * 100}%` }}
          />
        </div>
      )}

      {/* ── Banner: todas completadas ── */}
      {todasAprendidas && (
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-6 mb-5 text-center shadow-xl animate-celebrate">
          <p className="text-5xl mb-2">🎉</p>
          <p className="font-extrabold text-white text-2xl mb-1">
            ¡Aprendiste {esNumeros ? 'todos los números' : 'todo el alfabeto'}!
          </p>
          <p className="text-teal-100 text-sm mb-5">
            ¡Increíble! ¿Quieres repasar de nuevo?
          </p>
          <button
            onClick={reiniciar}
            className="w-full bg-white text-teal-700 py-4 rounded-2xl font-extrabold text-lg shadow-md active:scale-95 transition-transform"
          >
            🔄 Empezar de nuevo
          </button>
        </div>
      )}

      {/* Grilla de letras — fondo verde muestra la letra, no un visto */}
      <div className="grid grid-cols-5 gap-2.5 mb-5">
        {items.map((item) => (
          <button
            key={item.letra}
            onClick={() => setSeleccionada(item)}
            className={`rounded-2xl py-3 text-lg font-extrabold border-2 transition-all active:scale-95 ${
              item.hecho
                ? 'bg-teal-400 border-teal-500 text-white shadow-md'
                : seleccionada.letra === item.letra
                  ? 'bg-purple-600 border-purple-700 text-white shadow-lg scale-105'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50'
            }`}
          >
            {item.letra}
          </button>
        ))}
      </div>

      {/* Panel de letra seleccionada */}
      <div className={`rounded-3xl p-5 mb-5 shadow-xl animate-slide-up ${
        seleccionada.hecho
          ? 'bg-gradient-to-br from-teal-500 to-teal-600'
          : 'bg-gradient-to-br from-purple-600 to-purple-700'
      }`}>
        <div className="flex gap-4 items-center">
          <div className="w-24 h-24 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-white border-opacity-30">
            <span className="text-5xl font-extrabold text-white">{seleccionada.letra}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-extrabold text-white text-xl">
                {esNumeros ? 'Número' : 'Letra'} {seleccionada.letra}
              </p>
              {seleccionada.hecho && (
                <span className="text-sm bg-white bg-opacity-20 text-white px-2 py-0.5 rounded-full font-bold">
                  ¡Aprendida! ⭐
                </span>
              )}
            </div>
            <p className="text-purple-200 text-sm mb-4 leading-relaxed">
              {seleccionada.descripcion}
            </p>
            <button
              onClick={() => navigate(rutaCamara, { state: { letra: seleccionada.letra } })}
              className="bg-white text-purple-700 text-base px-5 py-2.5 rounded-xl font-bold shadow-md active:scale-95 transition-transform"
            >
              📷 {seleccionada.hecho ? 'Repasar' : 'Practicar'}
            </button>
          </div>
        </div>
      </div>

      {/* Sección práctica libre */}
      <div className="bg-white border-2 border-purple-200 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">🆓</span>
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">Práctica libre</p>
            <p className="text-sm text-gray-400">Sin presión, a tu ritmo</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
          Navega entre {esNumeros ? 'los números' : 'las letras'} libremente con la cámara activa.
          Sin presión, sin celebraciones — solo practica a tu ritmo.
        </p>
        <button
          onClick={() => navigate(rutaCamara, { state: { letra: items[0].letra, libre: true } })}
          className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-base shadow-md active:scale-95 transition-transform hover:bg-purple-700"
        >
          🆓 Entrar a práctica libre
        </button>
      </div>

    </div>
  )
}
