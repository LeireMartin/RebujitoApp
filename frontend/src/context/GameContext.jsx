import { createContext, useContext, useState } from 'react'

const GameContext = createContext()

export function GameProvider({ children }) {
  const [partida, setPartida]   = useState(null)
  const [equipos, setEquipos]   = useState([])
  const [turno, setTurno]       = useState(null)
  const [marcador, setMarcador] = useState([])

  return (
    <GameContext.Provider value={{
      partida,  setPartida,
      equipos,  setEquipos,
      turno,    setTurno,
      marcador, setMarcador,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => useContext(GameContext)