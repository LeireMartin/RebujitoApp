import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { listarTematicas, agregarPalabras } from '../services/api'
import logo from '../assets/rebujito--logo.png'

export default function Preparacion() {
  const navigate = useNavigate()
  const { partida } = useGame()

  const [tematicas, setTematicas]           = useState([])
  const [seleccionadas, setSeleccionadas]   = useState([])
  const [palabraInput, setPalabraInput]     = useState('')
  const [palabrasCustom, setPalabrasCustom] = useState([])
  const [cargando, setCargando]             = useState(false)
  const [error, setError]                   = useState(null)

  useEffect(() => {
    listarTematicas().then(res => setTematicas(res.data.data))
  }, [])

  const toggleTematica = (id) => {
    setSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const añadirPalabra = () => {
    const palabra = palabraInput.trim()
    if (palabra && !palabrasCustom.includes(palabra)) {
      setPalabrasCustom([...palabrasCustom, palabra])
      setPalabraInput('')
    }
  }

  const eliminarPalabra = (p) => {
    setPalabrasCustom(palabrasCustom.filter(x => x !== p))
  }

  const handleSubmit = async () => {
    if (seleccionadas.length < 3 && palabrasCustom.length < 10) {
      return setError('Selecciona mínimo 3 temáticas o añade al menos 10 palabras')
    }
    try {
      setCargando(true)
      await agregarPalabras(partida.id, {
        tematicas: seleccionadas,
        palabrasCustom,
      })
      navigate('/juego')
    } catch (e) {
      setError('Error al preparar la partida. Inténtalo de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-teal-800 flex flex-col items-center justify-center px-4">

      {/* Tarjeta blanca */}
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-sm flex flex-col items-center">


        <div className="flex items-center gap-3 mb-2">
          <span className="text-teal-600 text-sm">Preparar el Rebujito</span>
        </div>
        {/* Logo */}
                <div className=" text-center">
                  <img src={logo} alt="Logo de Rebujito" className="w-56 mx-auto" />
                </div>

        <h2 className="text-2xl font-bold text-teal-800 mb-1">Elige las temáticas</h2>
        <p className="text-teal-600 text-sm mb-4">Selecciona mínimo 3</p>

        {/* Temáticas */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {tematicas.map(t => (
            <button
              key={t.id}
              onClick={() => toggleTematica(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                seleccionadas.includes(t.id)
                  ? 'bg-teal-600 border-teal-500 text-white'
                  : 'bg-teal-800 border-teal-700 text-gray-200 hover:bg-teal-700'
              }`}
            >
              {t.icono} {t.nombre}
            </button>
          ))}
        </div>

        {/* Palabras personalizadas */}
        <h3 className="text-teal-800 font-medium mb-2">O añade palabras propias</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Escribe una palabra..."
            value={palabraInput}
            onChange={e => setPalabraInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && añadirPalabra()}
            className="flex-1 py-3 px-4 bg-teal-800 border border-teal-700 rounded-xl text-white placeholder-white-200 focus:outline-none focus:border-teal-500"
          />
          <button
            onClick={añadirPalabra}
            className="px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition"
          >+</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {palabrasCustom.map(p => (
            <span key={p} className="flex items-center gap-1 px-3 py-1 bg-teal-900 text-teal-300 rounded-full text-sm">
              {p}
              <button onClick={() => eliminarPalabra(p)} className="text-teal-500 hover:text-white">✕</button>
            </span>
          ))}
        </div>

        {/* Progreso */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{seleccionadas.length} temáticas · {palabrasCustom.length} palabras propias</span>
            <span>mín. 3 temáticas</span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full">
            <div
              className="h-full bg-teal-500 rounded-full transition-all"
              style={{ width: `${Math.min((seleccionadas.length / 3) * 100, 100)}%` }}
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={cargando}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-xl transition"
        >
          {cargando ? 'Preparando...' : '¡Empezar a jugar!'}
        </button>

      </div>
    </div>
  )
}