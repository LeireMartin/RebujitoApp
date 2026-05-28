import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import logo from "../assets/rebujito--logo.png";

import {
  iniciarTurno,
  registrarResultado,
  finalizarTurno,
} from "../services/api";

export default function Juego() {
  const navigate = useNavigate();

  const {
    partida,
    equipos,
    turno,
    setTurno,
    setPartida,
    equipoActualIdx,
    setEquipoActualIdx,
  } = useGame();
  const [palabra, setPalabra] = useState(null);
  const [turnoActivo, setTurnoActivo] = useState(false);
  const [segundos, setSegundos] = useState(60);
  const [adivinadas, setAdivinadas] = useState(0);
  const [resultadoUltima, setResultadoUltima] = useState(null);
  const [cargando, setCargando] = useState(false);
  const timerRef = useRef(null);

  const equipoActual = equipos[equipoActualIdx];
  if (!equipoActual && equipos.length > 0) {
  setEquipoActualIdx(0)
}
  if (!partida) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-4">
            No hay partida activa
          </h2>
          <button
            onClick={() => navigate("/")}
            className="py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const handleIniciarTurno = async () => {
    try {
      setCargando(true);
      const res = await iniciarTurno(partida.id, { equipoId: equipoActual.id });
      const data = res.data.data;
      console.log("TURNO DATA:", data);
      console.log("FASE ACTUAL PARTIDA:", partida.faseActual);
      console.log("FASE TURNO:", data.turno.fase);
      setTurno(data.turno);
      if (data.turno.fase !== partida.faseActual) {
        setPartida({ ...partida, faseActual: data.turno.fase });
        console.log("PARTIDA ACTUALIZADA:", {
          ...partida,
          faseActual: data.turno.fase,
        });
      }
      setPalabra(data.primeraPalabra);
      setSegundos(data.tiempoSegundos);
      setAdivinadas(0);
      setTurnoActivo(true);

      // Arrancar temporizador
      timerRef.current = setInterval(() => {
        setSegundos((s) => {
          if (s <= 1) {
            clearInterval(timerRef.current);
            handleFinTurno(data.turno.id);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  const handleResultado = async (resultado) => {
    try {
      const res = await registrarResultado(turno.id, {
        palabraId: palabra.id,
        resultado,
      });
      const data = res.data.data;
      setResultadoUltima(resultado);
      setTimeout(() => setResultadoUltima(null), 600);

      if (resultado === "ADIVINADA") setAdivinadas((a) => a + 1);

      if (data.faseCompletada) {
        clearInterval(timerRef.current);
        await handleFinTurno(turno.id);
        return;
      }
      setPalabra(data.siguientePalabra);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFinTurno = async (turnoId) => {
    try {
      clearInterval(timerRef.current);
      const id = turnoId ?? turno.id;
      const res = await finalizarTurno(id);
      const data = res.data.data;
      console.log("FIN TURNO DATA:", data);
      setTurnoActivo(false);
      if (data.siguienteFase) {
        setPartida({ ...partida, faseActual: data.siguienteFase });
      }

      if (data.partidaFinalizada) {
        navigate("/resultado");
        return;
      }

      // Siguiente equipo
      setEquipoActualIdx((i) => (i + 1) % equipos.length);
      navigate("/fin-turno", { state: data });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const pct = (segundos / (partida?.tiempoTurno ?? 60)) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 select-none">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className=" text-center">
          <img src={logo} alt="Logo de Rebujito" className="w-56 mx-auto" />
        </div>

        {!turnoActivo ? (
          /* Pantalla de espera */
          <div className="text-center">
            <div className="text-5xl mb-4">😎</div>
            <h2 className="text-2xl font-bold text-white mb-2">Turno de</h2>
            <h3 className="text-3xl font-bold text-teal-400 mb-8">
              {equipoActual?.nombre}
            </h3>
            <button
              onClick={handleIniciarTurno}
              disabled={cargando}
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-lg rounded-xl transition"
            >
              {cargando ? "Cargando..." : "¡Empezar turno!"}
            </button>
          </div>
        ) : (
          /* Pantalla de juego */
          <>
            {/* Cabecera */}
            <div className="flex justify-between items-center mb-8">
              <span className="text-xs px-3 py-1 rounded-full bg-teal-900 text-teal-300 font-medium">
                Fase {partida?.faseActual > 0 ? partida.faseActual : 1} ·{" "}
                {partida?.faseActual === 1
                  ? "Descripción"
                  : partida?.faseActual === 2
                    ? "Una palabra"
                    : "Mímica"}{" "}
              </span>
              <span className="text-gray-400 text-sm">
                Equipo: {equipoActual?.nombre}
              </span>
            </div>
            {/* Temporizador */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-24 h-24 mb-2">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="#374151"
                    strokeWidth="8"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="#009d9a"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - pct / 100)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {segundos}
                  </span>
                  <span className="text-xs text-gray-400">seg</span>
                </div>
              </div>
              <span className="text-sm text-gray-400">
                {adivinadas} adivinadas
              </span>
            </div>

            {/* Palabra */}
            <div
              className={`rounded-2xl p-6 text-center mb-6 border-2 transition-all duration-300 ${
                resultadoUltima === "ADIVINADA"
                  ? "bg-teal-900 border-teal-400"
                  : resultadoUltima === "PASADA"
                    ? "bg-red-900 border-red-400"
                    : "bg-gray-800 border-teal-500"
              }`}
            >
              <p className="text-xs text-gray-400 mb-2">ADIVINA ESTA PALABRA</p>
              <p
                className={`text-3xl font-bold mb-4 transition-colors duration-300 ${
                  resultadoUltima === "ADIVINADA"
                    ? "text-teal-300"
                    : resultadoUltima === "PASADA"
                      ? "text-red-300"
                      : "text-white"
                }`}
              >
                {palabra?.texto}
              </p>
              <div className="border-t border-gray-700 pt-4">
                {partida?.faseActual === 1 && (
                  <p className="text-sm text-teal-300">
                    Describe la palabra con tus propias palabras, sin decir
                    ninguna parte de ella
                  </p>
                )}
                {partida?.faseActual === 2 && (
                  <p className="text-sm text-teal-300">
                    Solo puedes decir <strong>una única palabra</strong> como
                    pista, nada más
                  </p>
                )}
                {partida?.faseActual === 3 && (
                  <p className="text-sm text-teal-300">
                    Representa la palabra con <strong>mímica</strong>, sin
                    hablar ni hacer sonidos
                  </p>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleResultado("ADIVINADA")}
                className="py-4 bg-teal-600 hover:bg-lime-500 text-white font-bold rounded-xl text-lg transition"
              >
                ✓ Adivinada
              </button>
              <button
                onClick={() => handleResultado("PASADA")}
                className="py-4 bg-red-900 hover:bg-red-600 text-white font-bold rounded-xl text-lg transition"
              >
                X Paso
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
  );
}
