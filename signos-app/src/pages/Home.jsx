import { useNavigate } from 'react-router-dom'

export default function Home() {
    const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-center p-6">
      
      <div className="mb-8 text-center">
        <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🤟</span>
        </div>
        <h1 className="text-3xl font-bold text-purple-700">SignosApp</h1>
        <p className="text-purple-400 mt-1">Aprende a leer y escribir</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl border border-purple-100 p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-700">S</div>
          <div>
            <p className="font-medium text-gray-800">Hola, Sofía</p>
            <p className="text-xs text-gray-400">Nivel 2 · 340 puntos</p>
          </div>
          <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">🔥 5 días</span>
        </div>
        <p className="text-sm text-gray-500 mb-2">Alfabeto · Letra M</p>
        <div className="w-full bg-purple-100 rounded-full h-2 mb-1">
          <div className="bg-purple-500 h-2 rounded-full" style={{width: '58%'}}></div>
        </div>
        <p className="text-xs text-gray-400 mb-4">14 de 24 letras completadas</p>
        <button
             onClick={() => navigate('/modulo')}
             className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium text-sm"
        >
            ▶ Continuar
        </button>
      </div>

      <div className="w-full max-w-sm grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-purple-100 p-4 text-center">
          <p className="text-2xl mb-1">🔤</p>
          <p className="font-medium text-gray-800 text-sm">Alfabeto</p>
          <p className="text-xs text-gray-400">A – Z con señas</p>
          <div className="w-full bg-purple-100 rounded-full h-1.5 mt-2">
            <div className="bg-purple-500 h-1.5 rounded-full" style={{width: '58%'}}></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center opacity-50">
          <p className="text-2xl mb-1">📝</p>
          <p className="font-medium text-gray-800 text-sm">Sílabas</p>
          <p className="text-xs text-gray-400">Combina letras</p>
          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full mt-2 inline-block">Próximo</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center opacity-50">
          <p className="text-2xl mb-1">💬</p>
          <p className="font-medium text-gray-800 text-sm">Palabras</p>
          <p className="text-xs text-gray-400">Vocabulario básico</p>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mt-2 inline-block">Bloqueado</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center opacity-50">
          <p className="text-2xl mb-1">🗣️</p>
          <p className="font-medium text-gray-800 text-sm">Frases</p>
          <p className="text-xs text-gray-400">Comunicación</p>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full mt-2 inline-block">Bloqueado</span>
        </div>
      </div>

    </div>
  )
}