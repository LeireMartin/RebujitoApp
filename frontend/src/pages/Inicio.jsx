import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Inicio() {
  const navigate = useNavigate()
  const [codigo, setCodigo] = useState('')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">

      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-6xl mb-4">Rebujito</div>
        <h1 className="text-4xl font-bold text-white mb-2">Rebujito</h1>
        <p className="text-gray-400">El juego de las palabras</p>
      </div>

      {/* Botones */}
      <div className="w-full max-w-sm flex flex-col gap-4">

        <button
          onClick={() => navigate('/equipos')}
          className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition"
        >
          Nueva partida
        </button>

        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Código de sala"
            value={codigo}
            onChange={e => setCodigo(e.target.value.toUpperCase())}
            maxLength={5}
            className="w-full py-3 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-center text-lg tracking-widest placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
          <button
            disabled={codigo.length !== 5}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white font-semibold rounded-xl transition"
          >
            Unirse con código
          </button>
        </div>

      </div>
    </div>
  )
}