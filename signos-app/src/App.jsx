import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Modulo from './pages/Modulo'
import Camara from './pages/Camara'
import Entrenar from './pages/Entrenar'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/modulo" element={<Modulo />} />
        <Route path="/modulo-numeros" element={<Modulo modo="numeros" />} />
        <Route path="/camara" element={<Camara />} />
        <Route path="/camara-numeros" element={<Camara modo="numeros" />} />
        <Route path="/entrenar" element={<Entrenar />} />
      </Routes>
    </BrowserRouter>
  )
}