import { useNavigate, useLocation } from "react-router-dom";

export default function FinTurno() {
  const navigate = useNavigate();
  const { state } = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Cabecera */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⏱</div>
          <h2 className="text-2xl font-bold text-white">¡Tiempo!</h2>
          <p className="text-gray-400 text-sm mt-1">Resumen del turno</p>
        </div>

        {/* Estadísticas */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-teal-400">
                {state?.adivinadas ?? 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">adivinadas</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-400">
                {state?.pasadas ?? 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">pasadas</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-violet-400">
                +{state?.puntosGanados ?? 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">puntos</p>
            </div>
          </div>
        </div>

        {/* Siguiente equipo */}
        {state?.siguienteEquipo && (
          <div className="bg-gray-800 rounded-2xl p-4 mb-6 text-center">
            <p className="text-gray-400 text-sm mb-1">Siguiente turno</p>
            <p className="text-xl font-bold text-violet-400">
              {state.siguienteEquipo}
            </p>
          </div>
        )}

        {/* Fase completada */}
        {state?.faseCompletada && (
          <div className="bg-violet-900 border border-violet-500 rounded-2xl p-4 mb-6 text-center">
            <p className="text-violet-300 text-sm font-medium">
              ✨ ¡Fase {state.siguienteFase - 1} completada!
            </p>
            <p className="text-white font-bold mt-1">
              Empieza la fase {state.siguienteFase} —{" "}
              {state.siguienteFase === 3 ? "Solo una palabra" : "Mímica"}
            </p>
          </div>
        )}

        <button
          onClick={() => navigate("/juego")}
          className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition"
        >
          Siguiente turno →
        </button>
      </div>
    </div>
  );
}
