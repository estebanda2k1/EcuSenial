import { useNavigate } from 'react-router-dom'
import { exportarModelo, cargarModelo } from '../utils/modeloLetras'


export default function Home() {
  const navigate = useNavigate()
  async function descargarModelo() {
  const ok = await cargarModelo()
  if (ok) {
    await exportarModelo()
  } else {
    alert('No hay modelo guardado, debes entrenar primero')
  }
}
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#FFF7ED,#F3E8FF_55%,#EDE9FE)] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center text-center mb-10 animate-fade-up">
          <div className="relative">
            <div className="w-24 h-24 bg-purple-600 rounded-[28px] flex items-center justify-center shadow-lg">
              <span className="text-4xl">🤟</span>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-300 rounded-full animate-bounce"></div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-purple-700 mt-5">SignosApp</h1>
          <p className="text-purple-600 mt-2 text-base sm:text-lg">
            Un lugar divertido para aprender lenguaje de señas
          </p>
          <span className="mt-3 text-xs sm:text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
            Para ninos de 5 a 15 anos
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="bg-white border border-purple-200 rounded-3xl p-6 shadow-sm animate-fade-up">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🔤</span>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">Aprender letras</p>
                <p className="text-sm text-gray-500">Reconoce el abecedario A-Z</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/modulo')}
              className="mt-5 w-full bg-purple-600 text-white py-3 rounded-2xl font-semibold text-sm transition-transform hover:-translate-y-0.5"
            >
              Empezar
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl p-6 opacity-70 animate-fade-up-delay">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🔢</span>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">Aprender numeros</p>
                <p className="text-sm text-gray-500">Aprende los numeros del 1 al 10</p>
              </div>
            </div>
            <div className="mt-5 text-xs text-amber-700 bg-amber-100 px-3 py-2 rounded-xl text-center">
              <button onClick={() => navigate('/modulo-numeros')}>
                Empieza Aqui
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white/70 border border-white rounded-3xl p-5 text-center animate-fade-up-delay">
          <p className="text-sm text-gray-600">Aprende jugando, paso a paso, con retos cortos y faciles.</p>
        </div>
      </div>
      <button
        onClick={descargarModelo}
        className="w-full max-w-sm mt-4 bg-teal-600 text-white py-3 rounded-xl font-medium text-sm"
      >
        ⬇️ Exportar modelo entrenado
      </button>
      <div className="bg-white border border-purple-200 rounded-3xl p-6 shadow-sm col-span-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-800">Modo desafío</p>
            <p className="text-sm text-gray-500">Señas al azar — pon a prueba lo que aprendiste</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/desafio')}
          className="mt-5 w-full bg-red-500 text-white py-3 rounded-2xl font-semibold text-sm"
        >
          🎯 Jugar
        </button>
      </div>
    </div>

    
  )
}