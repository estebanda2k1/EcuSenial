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
        { letra: 'K', descripcion: 'Índice y medio en V arriba', hecho: false },
        { letra: 'L', descripcion: 'Índice y pulgar forman una L', hecho: false },
        { letra: 'M', descripcion: 'Tres dedos sobre el pulgar', hecho: false },
        { letra: 'N', descripcion: 'Dos dedos sobre el pulgar', hecho: false },
        { letra: 'O', descripcion: 'Dedos forman un círculo', hecho: false },
        { letra: 'R', descripcion: 'Dedos cruzados', hecho: false },
        { letra: 'S', descripcion: 'Puño cerrado', hecho: false },
        { letra: 'T', descripcion: 'Pulgar entre índice y medio', hecho: false },
        { letra: 'U', descripcion: 'Índice y medio juntos arriba', hecho: false },
        { letra: 'V', descripcion: 'Índice y medio separados arriba', hecho: false },
        { letra: 'W', descripcion: 'Tres dedos arriba separados', hecho: false },
        { letra: 'Y', descripcion: 'Pulgar y meñique extendidos', hecho: false },
      ]

  const [seleccionada, setSeleccionada] = useState(items[0])
  const rutaCamara = esNumeros ? '/camara-numeros' : '/camara'

  return (
    <div className="min-h-screen bg-purple-50 p-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/')} className="text-purple-600 font-medium text-sm">
          ← Inicio
        </button>
        <span className="font-medium text-gray-700">{esNumeros ? 'Números' : 'Alfabeto'}</span>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
          {items.filter(i => i.hecho).length}/{items.length}
        </span>
      </div>

      {/* Grilla de letras */}
      <div className="grid grid-cols-6 gap-2 mb-5">
        {items.map((item) => (
          <button
            key={item.letra}
            onClick={() => setSeleccionada(item)}
            className={`rounded-xl py-2 text-base font-bold border transition-all
              ${item.hecho
                ? 'bg-teal-100 border-teal-300 text-teal-700'
                : seleccionada.letra === item.letra
                  ? 'bg-purple-200 border-purple-500 text-purple-800'
                  : 'bg-white border-gray-200 text-gray-700'
              }`}
          >
            {item.letra}
          </button>
        ))}
      </div>

      {/* Panel de letra seleccionada */}
      <div className="bg-purple-100 border border-purple-300 rounded-2xl p-5 flex gap-4 items-center mb-5">
        <div className="w-20 h-20 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-4xl font-bold text-white">{seleccionada.letra}</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-purple-800 mb-1">
            {esNumeros ? 'Número' : 'Letra'} {seleccionada.letra}
          </p>
          <p className="text-sm text-purple-600 mb-3">{seleccionada.descripcion}</p>
          <button
            onClick={() => navigate(rutaCamara, { state: { letra: seleccionada.letra } })}
            className="bg-purple-600 text-white text-sm px-4 py-2 rounded-lg"
          >
            📷 Practicar
          </button>
        </div>
      </div>

      {/* Sección práctica libre */}
      <div className="bg-white border border-purple-200 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <span className="text-xl">🆓</span>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Práctica libre</p>
            <p className="text-xs text-gray-400">Practica todas las {esNumeros ? 'números' : 'letras'} sin límite</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Navega entre {esNumeros ? 'los números' : 'las letras'} libremente con la cámara activa.
          Sin presión, sin celebraciones — solo practica a tu ritmo.
        </p>
        <button
          onClick={() => navigate(rutaCamara, { state: { letra: items[0].letra, libre: true } })}
          className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold text-sm"
        >
          🆓 Entrar a práctica libre
        </button>
      </div>

    </div>
  )
}