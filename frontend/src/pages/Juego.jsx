import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { iniciarTurno, registrarResultado, finalizarTurno } from '../services/api'

export default function Juego() {
  const navigate = useNavigate()
  const { partida, equipos, turno, setTurno } = useGame()

  const [equipoActualIdx, setEquipoActualIdx] = useState(0)
  const [palabra, setPalabra]                 = useState(null)
  const [turnoActivo, setTurnoActivo]         = useState(false)
  const [segundos, setSegundos]               = useState(60)
  const [adivinadas, setAdivinadas]           = useState(0)
  const [cargando, setCargando]               = useState(false)
  const timerRef                              = useRef(null)

  const equipoActual = equipos[equipoActualIdx]

  const handleIniciarTurno = async () => {
    try {
      setCargando(true)
      const res = await iniciarTurno(partida.id, { equipoId: equipoActual.id })
      const data = res.data.data
      setTurno(data.turno)
      setPalabra(data.primeraPalabra)
      setSegundos(data.tiempoSegundos)
      setAdivinadas(0)
      setTurnoActivo(true)

      // Arrancar temporizador
      timerRef.current = setInterval(() => {
        setSegundos(s => {
          if (s <= 1) {
            clearInterval(timerRef.current)
            handleFinTurno(data.turno.id)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } catch (e) {
      console.error(e)
    } finally {
      setCargando(false)
    }
  }

  const handleResultado = async (resultado) => {
    try {
      const res = await registrarResultado(turno.id, { palabraId: palabra.id, resultado })
      const data = res.data.data
      if (resultado === 'ADIVINADA') setAdivinadas(a => a + 1)

      if (data.faseCompletada) {
        clearInterval(timerRef.current)
        await handleFinTurno(turno.id)
        return
      }
      setPalabra(data.siguientePalabra)
    } catch (e) {
      console.error(e)
    }
  }

  const handleFinTurno = async (turnoId) => {
    try {
      clearInterval(timerRef.current)
      const id = turnoId ?? turno.id
      const res = await finalizarTurno(id)
      const data = res.data.data
      setTurnoActivo(false)

      if (data.partidaFinalizada) {
        navigate('/resultado')
        return
      }

      // Siguiente equipo
      setEquipoActualIdx(i => (i + 1) % equipos.length)
      navigate('/fin-turno', { state: data })
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  const pct = (segundos / (partida?.tiempoTurno ?? 60)) * 100

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Cabecera */}
        <div className="flex justify-between items-center mb-8">
          <span className="text-xs px-3 py-1 rounded-full bg-teal-900 text-teal-300 font-medium">
            Fase {partida?.faseActual ?? 2} · {['', '', 'Descripción', 'Una palabra', 'Mímica'][partida?.faseActual ?? 2]}
          </span>
          <span className="text-gray-400 text-sm">{equipoActual?.nombre}</span>
        </div>

        {!turnoActivo ? (
          /* Pantalla de espera */
          <div className="text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-white mb-2">Turno de</h2>
            <h3 className="text-3xl font-bold text-violet-400 mb-8">{equipoActual?.nombre}</h3>
            <button
              onClick={handleIniciarTurno}
              disabled={cargando}
              className="w-full py-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold text-lg rounded-xl transition"
            >
              {cargando ? 'Cargando...' : '¡Empezar turno!'}
            </button>
          </div>
        ) : (
          /* Pantalla de juego */
          <>
            {/* Temporizador */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-24 h-24 mb-2">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#374151" strokeWidth="8"/>
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#7c3aed" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - pct / 100)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{segundos}</span>
                  <span className="text-xs text-gray-400">seg</span>
                </div>
              </div>
              <span className="text-sm text-gray-400">{adivinadas} adivinadas</span>
            </div>

            {/* Palabra */}
            <div className="bg-gray-800 border-2 border-violet-500 rounded-2xl p-8 text-center mb-6">
              <p className="text-xs text-gray-400 mb-2">ADIVINA ESTA PALABRA</p>
              <p className="text-3xl font-bold text-white">{palabra?.texto}</p>
            </div>

            {/* Botones */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleResultado('ADIVINADA')}
                className="py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-lg transition"
              >
                ✓ Adivinada
              </button>
              <button
                onClick={() => handleResultado('PASADA')}
                className="py-4 bg-red-900 hover:bg-red-800 text-white font-bold rounded-xl text-lg transition"
              >
                → Paso
              </button>
            </div>

            <button
              onClick={() => handleFinTurno()}
              className="w-full mt-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-sm transition"
            >
              Terminar turno antes de tiempo
            </button>
          </>
        )}

      </div>
    </div>
  )
}