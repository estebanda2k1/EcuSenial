import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Modulo from './pages/Modulo'
import Camara from './pages/Camara'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/modulo" element={<Modulo />} />
        <Route path="/camara" element={<Camara />} />
      </Routes>
    </BrowserRouter>
  )
}