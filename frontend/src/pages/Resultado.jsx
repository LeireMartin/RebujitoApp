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
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Cabecera */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🏆</div>
          <h2 className="text-3xl font-bold text-white">
            {marcador[0]?.nombre ?? '...'} gana
          </h2>
          <p className="text-gray-400 text-sm mt-1">Partida completada · 3 fases</p>
        </div>

        {/* Clasificación */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden mb-6">
          {marcador.map((eq, i) => (
            <div
              key={eq.id}
              className={`flex items-center justify-between px-5 py-4 ${i < marcador.length - 1 ? 'border-b border-gray-700' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{medallas[i] ?? '🎖️'}</span>
                <div>
                  <p className="text-white font-semibold">{eq.nombre}</p>
                  <p className="text-gray-400 text-xs">
                    {eq.porFase?.join(' · ') ?? ''} pts/fase
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-violet-400">{eq.total}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleRevancha}
          className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition mb-3"
        >
          Revancha
        </button>

        <button
          onClick={() => { setPartida(null); setEquipos([]); setTurno(null); navigate('/') }}
          className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition"
        >
          Volver al inicio
        </button>

      </div>
    </div>
  )
}