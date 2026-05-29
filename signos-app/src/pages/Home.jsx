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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#FFF7ED,#F3E8FF_55%,#EDE9FE)] px-5 py-8">
      <div className="max-w-sm mx-auto flex flex-col gap-5">

        {/* Hero */}
        <div className="flex flex-col items-center text-center animate-fade-up">
          <div className="relative mb-3">
            <div className="w-28 h-28 bg-gradient-to-br from-purple-500 to-purple-700 rounded-[32px] flex items-center justify-center shadow-2xl animate-float">
              <span className="text-5xl">🤟</span>
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-300 rounded-full animate-bounce flex items-center justify-center text-xl shadow-md">
              ✨
            </div>
          </div>
          <h1 className="text-5xl font-extrabold text-purple-700 mt-3 tracking-tight">EcuSenial</h1>
          <p className="text-purple-500 mt-2 text-lg font-semibold">
            Aprende señas ecuatorianas
          </p>
          <span className="mt-3 text-sm bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-bold shadow-sm">
            Para niños de 5 a 15 años 🌟
          </span>
        </div>

        {/* Aprender letras */}
        <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 shadow-lg animate-fade-up">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">🔤</span>
            </div>
            <div>
              <p className="text-xl font-extrabold text-gray-800">Aprender letras</p>
              <p className="text-sm text-gray-500 mt-0.5">Señas del alfabeto A – Z</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/modulo')}
            className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg shadow-md transition-transform active:scale-95 hover:-translate-y-0.5 hover:bg-purple-700"
          >
            Empezar
          </button>
        </div>

        {/* Aprender números */}
        <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 shadow-lg animate-fade-up-delay">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">🔢</span>
            </div>
            <div>
              <p className="text-xl font-extrabold text-gray-800">Aprender números</p>
              <p className="text-sm text-gray-500 mt-0.5">Señas del 1 al 10</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/modulo-numeros')}
            className="w-full bg-amber-500 text-white py-4 rounded-2xl font-bold text-lg shadow-md transition-transform active:scale-95 hover:-translate-y-0.5 hover:bg-amber-600"
          >
            Empezar
          </button>
        </div>

        {/* Modo desafío */}
        <div className="bg-white border-2 border-red-200 rounded-3xl p-6 shadow-lg animate-fade-up-delay">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">🎯</span>
            </div>
            <div>
              <p className="text-xl font-extrabold text-gray-800">Modo desafío</p>
              <p className="text-sm text-gray-500 mt-0.5">Señas al azar — pon a prueba lo que aprendiste</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/desafio')}
            className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold text-lg shadow-md transition-transform active:scale-95 hover:-translate-y-0.5 hover:bg-red-600"
          >
            🎯 Jugar
          </button>
        </div>

        {/* Exportar modelo */}
        <button
          onClick={descargarModelo}
          className="w-full bg-teal-50 border-2 border-teal-200 text-teal-700 py-3.5 rounded-2xl font-semibold text-sm hover:bg-teal-100 transition-colors"
        >
          ⬇️ Exportar modelo entrenado
        </button>

      </div>
    </div>
  )
}
