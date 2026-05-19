import { createContext, useContext, useState, useEffect } from 'react'

const GameContext = createContext()

export function GameProvider({ children }) {
  const [partida, setPartidaState]   = useState(() => {
    const saved = localStorage.getItem('rebujito_partida')
    return saved ? JSON.parse(saved) : null
  })
  const [equipos, setEquiposState]   = useState(() => {
    const saved = localStorage.getItem('rebujito_equipos')
    return saved ? JSON.parse(saved) : []
  })
  const [turno, setTurno]             = useState(null)
  const [marcador, setMarcador]       = useState([])
  const [equipoActualIdx, setEquipoActualIdxState] = useState(() => {
    const saved = localStorage.getItem('rebujito_equipoIdx')
    return saved ? parseInt(saved) : 0
  })

  const setPartida = (val) => {
    setPartidaState(val)
    if (val) localStorage.setItem('rebujito_partida', JSON.stringify(val))
    else localStorage.removeItem('rebujito_partida')
  }

  const setEquipos = (val) => {
    setEquiposState(val)
    if (val?.length) localStorage.setItem('rebujito_equipos', JSON.stringify(val))
    else localStorage.removeItem('rebujito_equipos')
  }

  const setEquipoActualIdx = (val) => {
    const nuevoIdx = typeof val === 'function' ? val(equipoActualIdx) : val
    setEquipoActualIdxState(nuevoIdx)
    localStorage.setItem('rebujito_equipoIdx', nuevoIdx)
  }

  return (
    <GameContext.Provider value={{
      partida,  setPartida,
      equipos,  setEquipos,
      turno,    setTurno,
      marcador, setMarcador,
      equipoActualIdx, setEquipoActualIdx,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => useContext(GameContext)