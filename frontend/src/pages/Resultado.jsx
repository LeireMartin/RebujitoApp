import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useGame } from '../context/GameContext'
import { obtenerMarcador } from '../services/api'

export default function Resultado() {
  const navigate = useNavigate()
  const { partida, setPartida, setEquipos, setTurno } = useGame()
  const [marcador, setMarcador] = useState([])

  useEffect(() => {
    if (partida?.id) {
      obtenerMarcador(partida.id)
        .then(res => setMarcador(res.data.data.equipos))
        .catch(console.error)
    }
  }, [])

  const handleRevancha = () => {
    setPartida(null)
    setEquipos([])
    setTurno(null)
    navigate('/equipos')
  }

  const medallas = ['🥇', '🥈', '🥉']

  return (
   <div className="min-h-screen bg-teal-800 flex flex-col items-center justify-center px-4">

      {/* Tarjeta blanca */}
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-sm flex flex-col items-center">

        {/* Cabecera */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🏆</div>
          <h2 className="text-3xl font-bold text-teal-800">
            {marcador[0]?.nombre ?? '...'} gana
          </h2>
          <p className="text-gray-400 text-sm mt-1">Partida completada · 3 fases</p>
        </div>

        {/* Clasificación */}
        <div className="bg-teal-800 rounded-2xl overflow-hidden mb-6">
          {marcador.map((eq, i) => (
            <div
              key={eq.id}
              className={`flex items-center justify-between px-5 py-4 ${i < marcador.length - 1 ? 'border-b border-gray-700' : ''}`}
            >
              <div className="w-46 flex items-center gap-3">
                <span className="text-2xl">{medallas[i] ?? '🎖️'}</span>
                <div>
                  <p className="text-teal-200 font-semibold mr-1.5">{eq.nombre}</p>
                
                </div>
              </div>
              <span className="text-2xl font-bold text-white">{eq.total}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => { setPartida(null); setEquipos([]); setTurno(null); navigate('/') }}
          className="w-full py-3 bg-teal-800 hover:bg-teal-500 text-white rounded-xl transition"
        >
          Volver al inicio
        </button>

      </div>
    </div>
  )
}