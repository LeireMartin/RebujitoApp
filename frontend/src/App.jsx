import { Routes, Route } from 'react-router-dom'
import Inicio       from './pages/Inicio'
import Equipos      from './pages/Equipos'
import Preparacion  from './pages/Preparacion'
import Juego        from './pages/Juego'
import FinTurno     from './pages/FinTurno'
import Resultado    from './pages/Resultado'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Routes>
        <Route path="/"           element={<Inicio />} />
        <Route path="/equipos"    element={<Equipos />} />
        <Route path="/preparacion" element={<Preparacion />} />
        <Route path="/juego"      element={<Juego />} />
        <Route path="/fin-turno"  element={<FinTurno />} />
        <Route path="/resultado"  element={<Resultado />} />
      </Routes>
    </div>
  )
}