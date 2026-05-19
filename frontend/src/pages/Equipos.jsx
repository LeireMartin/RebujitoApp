import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { crearPartida } from '../services/api'

export default function Equipos() {
  const navigate = useNavigate()
  const { setPartida, setEquipos } = useGame()

  const [equipos, setEquiposLocal] = useState(['', ''])
  const [tiempoTurno, setTiempoTurno]       = useState(60)
  const [palabrasPorFase, setPalabrasPorFase] = useState(20)
  const [cargando, setCargando]             = useState(false)
  const [error, setError]                   = useState(null)

  const añadirEquipo = () => {
    if (equipos.length < 6) setEquiposLocal([...equipos, ''])
  }

  const actualizarEquipo = (i, valor) => {
    const copia = [...equipos]
    copia[i] = valor
    setEquiposLocal(copia)
  }

  const eliminarEquipo = (i) => {
    if (equipos.length > 2) setEquiposLocal(equipos.filter((_, j) => j !== i))
  }

  const handleSubmit = async () => {
    const nombresValidos = equipos.map(e => e.trim()).filter(Boolean)
    if (nombresValidos.length < 2) return setError('Mínimo 2 equipos con nombre')

    try {
      setCargando(true)
      const res = await crearPartida({
        modo: 'LOCAL',
        tiempoTurno,
        palabrasPorFase,
        equipos: nombresValidos,
      })
      setPartida(res.data.data)
      setEquipos(res.data.data.equipos)
      navigate('/preparacion')
    } catch (e) {
      setError('Error al crear la partida. Inténtalo de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">

        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2">
          ← Volver
        </button>

        <h2 className="text-2xl font-bold text-white mb-1">Configurar equipos</h2>
        <p className="text-gray-400 text-sm mb-6">Mínimo 2 equipos</p>

        {/* Equipos */}
        <div className="flex flex-col gap-3 mb-4">
          {equipos.map((eq, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder={`Equipo ${i + 1}`}
                value={eq}
                onChange={e => actualizarEquipo(i, e.target.value)}
                className="flex-1 py-3 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
              />
              {equipos.length > 2 && (
                <button onClick={() => eliminarEquipo(i)} className="text-gray-500 hover:text-red-400 text-xl">✕</button>
              )}
            </div>
          ))}
        </div>

        {equipos.length < 6 && (
          <button onClick={añadirEquipo} className="w-full py-3 border border-dashed border-violet-500 text-violet-400 rounded-xl mb-6 hover:bg-violet-950 transition">
            + Añadir equipo
          </button>
        )}

        {/* Ajustes */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Tiempo por turno</span>
            <div className="flex gap-2">
              {[30, 60, 90].map(t => (
                <button key={t}
                  onClick={() => setTiempoTurno(t)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${tiempoTurno === t ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >{t}s</button>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Palabras por fase</span>
            <div className="flex gap-2">
              {[10, 20, 30].map(p => (
                <button key={p}
                  onClick={() => setPalabrasPorFase(p)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${palabrasPorFase === p ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >{p}</button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={cargando}
          className="w-full py-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold rounded-xl transition"
        >
          {cargando ? 'Creando partida...' : 'Continuar →'}
        </button>

      </div>
    </div>
  )
}