import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { crearPartida } from '../services/api'
import logo from '../assets/rebujito--logo.png'

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
    <div className="min-h-screen bg-teal-800 flex flex-col items-center justify-center px-4">

      {/* Tarjeta blanca */}
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-sm flex flex-col items-center">

        <button onClick={() => navigate('/')} className="text-teal-600 hover:text-teal-400 mb-6 flex items-center gap-2">
          ← Volver
        </button>
        {/* Logo */}
        <div className="mb-6 text-center">
          <img src={logo} alt="Logo de Rebujito" className="w-56 mx-auto mb-4" />
        </div>

        <h2 className="text-2xl font-bold text-teal-800 mb-1">Configurar equipos</h2>
        <p className="text-teal-600 text-sm mb-6">Mínimo 3 personas en cada uno</p>

        {/* Equipos */}
        <div className="flex flex-col gap-3 mb-4">
          {equipos.map((eq, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder={`Equipo ${i + 1}`}
                value={eq}
                onChange={e => actualizarEquipo(i, e.target.value)}
                className="flex-1 py-3 px-4 bg-teal-600 border border-teal-800 rounded-xl text-white placeholder-white-500 focus:outline-none focus:border-teal-500"
              />
              {equipos.length > 2 && (
                <button onClick={() => eliminarEquipo(i)} className="text-teal-500 hover:text-red-600 text-xl">✕</button>
              )}
            </div>
          ))}
        </div>

        {equipos.length < 6 && (
          <button onClick={añadirEquipo} className="w-full py-3 border border-dashed border-teal-500 text-teal-400 rounded-xl mb-6 hover:bg-teal-950 transition">
            + Añadir equipo
          </button>
        )}

        {/* Ajustes */}
        <div className="bg-teal-800 rounded-xl p-4 mb-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Tiempo por turno</span>
            <div className="flex gap-2">
              {[30, 60, 90].map(t => (
                <button key={t}
                  onClick={() => setTiempoTurno(t)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${tiempoTurno === t ? 'bg-teal-600 text-white' : 'bg-teal-900 text-gray-300'}`}
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
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${palabrasPorFase === p ? 'bg-teal-600 text-white' : 'bg-teal-900 text-gray-300'}`}
                >{p}</button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={cargando}
          className="w-full py-4 bg-lime-200 hover:bg-lime-700 disabled:opacity-50 text-teal-900 hover:text-amber-50 font-bold rounded-xl transition"
        >
          {cargando ? 'Creando partida...' : 'Elige tu rebujito'}
        </button>

      </div>
    </div>
  )
}