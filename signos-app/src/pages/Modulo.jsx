import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const letras = [
  { letra: 'A', descripcion: 'Puño cerrado, pulgar hacia arriba', hecho: true },
  { letra: 'B', descripcion: 'Cuatro dedos juntos apuntando arriba', hecho: true },
  { letra: 'C', descripcion: 'Mano en forma de C', hecho: true },
  { letra: 'D', descripcion: 'Índice arriba, dedos curvados', hecho: true },
  { letra: 'E', descripcion: 'Dedos doblados hacia la palma', hecho: true },
  { letra: 'F', descripcion: 'Índice y pulgar se tocan', hecho: false },
  { letra: 'G', descripcion: 'Índice apunta al lado', hecho: false },
  { letra: 'H', descripcion: 'Índice y medio apuntan al lado', hecho: false },
  { letra: 'I', descripcion: 'Meñique extendido hacia arriba', hecho: false },
  { letra: 'J', descripcion: 'Meñique hace una J en el aire', hecho: false },
  { letra: 'K', descripcion: 'Índice y medio en V apuntando arriba', hecho: false },
  { letra: 'L', descripcion: 'Índice y pulgar forman una L', hecho: false },
  { letra: 'M', descripcion: 'Índice, medio y anular sobre el pulgar', hecho: false },
  { letra: 'N', descripcion: 'Índice y medio sobre el pulgar', hecho: false },
  { letra: 'O', descripcion: 'Dedos forman un círculo', hecho: false },
  { letra: 'P', descripcion: 'Índice apunta hacia abajo', hecho: false },
]

export default function Modulo() {
  const [seleccionada, setSeleccionada] = useState(letras[12])
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-purple-50 p-4">

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/')}
          className="text-purple-600 font-medium text-sm"
        >
          ← Inicio
        </button>
        <span className="font-medium text-gray-700">Alfabeto</span>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
          5/16
        </span>
      </div>

      <div className="grid grid-cols-6 gap-2 mb-5">
        {letras.map((item) => (
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

      <div className="bg-purple-100 border border-purple-300 rounded-2xl p-5 flex gap-4 items-center">
        <div className="w-20 h-20 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-4xl font-bold text-white">{seleccionada.letra}</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-purple-800 mb-1">Letra {seleccionada.letra}</p>
          <p className="text-sm text-purple-600 mb-3">{seleccionada.descripcion}</p>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/camara')}
              className="bg-purple-600 text-white text-sm px-4 py-2 rounded-lg"
            >
              📷 Practicar
            </button>
            <button className="border border-purple-400 text-purple-700 text-sm px-4 py-2 rounded-lg">
              ▶ Ver seña
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}