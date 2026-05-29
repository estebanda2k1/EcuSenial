import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Modulo({ modo = 'letras' }) {
  const navigate = useNavigate()
  const esNumeros = modo === 'numeros'

  const items = esNumeros
    ? ['1','2','3','4','5','6','7','8','9','10'].map(n => ({
        letra: n, descripcion: `Seña del número ${n}`, hecho: false
      }))
    : [
        { letra: 'A', descripcion: 'Puño cerrado, pulgar al lado', hecho: true },
        { letra: 'B', descripcion: 'Cuatro dedos juntos arriba', hecho: true },
        { letra: 'C', descripcion: 'Mano en forma de C', hecho: false },
        { letra: 'D', descripcion: 'Índice arriba, dedos curvados', hecho: false },
        { letra: 'E', descripcion: 'Dedos doblados hacia la palma', hecho: false },
        { letra: 'F', descripcion: 'Índice y pulgar se tocan', hecho: false },
        { letra: 'G', descripcion: 'Índice apunta al lado', hecho: false },
        { letra: 'H', descripcion: 'Índice y medio apuntan al lado', hecho: false },
        { letra: 'I', descripcion: 'Meñique extendido hacia arriba', hecho: false },
        { letra: 'J', descripcion: 'Meñique dibuja una J en el aire', hecho: false },
        { letra: 'K', descripcion: 'Índice y medio en V arriba', hecho: false },
        { letra: 'L', descripcion: 'Índice y pulgar forman una L', hecho: false },
        { letra: 'M', descripcion: 'Tres dedos sobre el pulgar', hecho: false },
        { letra: 'N', descripcion: 'Dos dedos sobre el pulgar', hecho: false },
        { letra: 'O', descripcion: 'Dedos forman un círculo', hecho: false },
        { letra: 'P', descripcion: 'Índice apunta abajo, pulgar al medio', hecho: false },
        { letra: 'Q', descripcion: 'Índice y pulgar apuntan abajo', hecho: false },
        { letra: 'R', descripcion: 'Dedos cruzados', hecho: false },
        { letra: 'S', descripcion: 'Puño cerrado', hecho: false },
        { letra: 'T', descripcion: 'Pulgar entre índice y medio', hecho: false },
        { letra: 'U', descripcion: 'Índice y medio juntos arriba', hecho: false },
        { letra: 'V', descripcion: 'Índice y medio separados arriba', hecho: false },
        { letra: 'W', descripcion: 'Tres dedos arriba separados', hecho: false },
        { letra: 'X', descripcion: 'Índice en forma de gancho', hecho: false },
        { letra: 'Y', descripcion: 'Pulgar y meñique extendidos', hecho: false },
        { letra: 'Z', descripcion: 'Índice dibuja una Z', hecho: false }
      ]

  const [seleccionada, setSeleccionada] = useState(items[0])
  const rutaCamara = esNumeros ? '/camara-numeros' : '/camara'

  const hechas = items.filter(i => i.hecho).length

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
          {hechas}/{items.length} ✅
        </span>
      </div>

      {/* Barra de progreso */}
      {hechas > 0 && (
        <div className="w-full bg-purple-100 rounded-full h-3 mb-5">
          <div
            className="bg-purple-500 h-3 rounded-full transition-all"
            style={{ width: `${(hechas / items.length) * 100}%` }}
          />
        </div>
      )}

      {/* Grilla de letras — 5 columnas para botones más grandes */}
      <div className="grid grid-cols-5 gap-2.5 mb-5">
        {items.map((item) => (
          <button
            key={item.letra}
            onClick={() => setSeleccionada(item)}
            className={`rounded-2xl py-3 text-lg font-extrabold border-2 transition-all active:scale-95 ${
              item.hecho
                ? 'bg-teal-100 border-teal-400 text-teal-700 shadow-sm'
                : seleccionada.letra === item.letra
                  ? 'bg-purple-600 border-purple-700 text-white shadow-lg scale-105'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50'
            }`}
          >
            {item.hecho ? '✓' : item.letra}
          </button>
        ))}
      </div>

      {/* Panel de letra seleccionada */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-3xl p-5 mb-5 shadow-xl animate-slide-up">
        <div className="flex gap-4 items-center">
          <div className="w-24 h-24 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-white border-opacity-30">
            <span className="text-5xl font-extrabold text-white">{seleccionada.letra}</span>
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-white text-xl mb-1">
              {esNumeros ? 'Número' : 'Letra'} {seleccionada.letra}
            </p>
            <p className="text-purple-200 text-sm mb-4 leading-relaxed">
              {seleccionada.descripcion}
            </p>
            <button
              onClick={() => navigate(rutaCamara, { state: { letra: seleccionada.letra } })}
              className="bg-white text-purple-700 text-base px-5 py-2.5 rounded-xl font-bold shadow-md active:scale-95 transition-transform"
            >
              📷 Practicar
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
