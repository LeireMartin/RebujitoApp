import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import logo from '../assets/rebujito--logo.png'

export default function Inicio() {
  const navigate = useNavigate()
  const [codigo, setCodigo] = useState('')

  return (
    <div className="min-h-screen bg-teal-800 flex flex-col items-center justify-center px-4">

      {/* Tarjeta blanca */}
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-sm flex flex-col items-center">

        {/* Logo */}
        <div className="mb-6 text-center">
          <img src={logo} alt="Logo de Rebujito" className="w-56 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-teal-800 mb-1">Rebujito</h1>
          <p className="text-teal-600 text-sm">El juego de las palabras</p>
        </div>

        {/* Botón */}
        <button
          onClick={() => navigate('/equipos')}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition mb-6"
        >
          Nueva partida
        </button>

        {/* Créditos */}
        <div className="text-center">
          <p className="text-teal-600 text-sm">Trabajo de Final de Desarrollo Aplicaciones Web</p>
          <p className="text-teal-800 font-bold text-xl mt-1">Leire Martín</p>
        </div>

      </div>
    </div>
  )
}