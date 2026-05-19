// src/controllers/turnos.controller.js
import prisma from "../config/prisma.js";
import { ok, created, notFound, conflict } from "../utils/response.js";

// ─── POST /api/partidas/:id/turnos ────────────────────────────────────────────
export async function iniciarTurno(req, res, next) {
  try {
    const { id: partidaId } = req.params;
    const { equipoId } = req.body;

    const partida = await prisma.partida.findUnique({
      where: { id: partidaId },
    });
    if (!partida) return notFound(res, "Partida no encontrada");
    if (!["CONFIGURANDO", "JUGANDO"].includes(partida.estado)) {
      return conflict(res, "La partida no está activa");
    }

    // No puede haber un turno activo simultáneo
   // Si hay turno activo lo cerramos automáticamente
const turnoActivo = await prisma.turno.findFirst({
  where: { partidaId, estado: 'ACTIVO' },
})
if (turnoActivo) {
  await prisma.turno.update({
    where: { id: turnoActivo.id },
    data:  { estado: 'FINALIZADO', fin: new Date() },
  })
}

    // Calcular número de turno
    const ultimoTurno = await prisma.turno.findFirst({
      where: { partidaId },
      orderBy: { creadoEn: "desc" },
    });
    const numero = (ultimoTurno?.numero ?? 0) + 1;
    const fase = partida.faseActual === 0 ? 1 : partida.faseActual;

    // Actualizar estado de la partida a JUGANDO
    await prisma.partida.update({
      where: { id: partidaId },
      data: { estado: "JUGANDO", faseActual: fase },
    });

    const turno = await prisma.turno.create({
      data: {
        partidaId,
        equipoId,
        fase,
        numero,
        estado: "ACTIVO",
        inicio: new Date(),
      },
    });

    // Sacar la primera palabra no usada en esta fase
    const palabrasUsadasIds = await prisma.resultadoPalabra.findMany({
      where: { turno: { partidaId, fase } },
      select: { palabraId: true },
    });
    const usadasIds = palabrasUsadasIds.map((r) => r.palabraId);

    const primeraPalabra = await prisma.palabra.findFirst({
      where: { partidaId, id: { notIn: usadasIds } },
    });

    const palabrasRestantes = await prisma.palabra.count({
      where: { partidaId, id: { notIn: usadasIds } },
    });

    created(res, {
      turno,
      primeraPalabra,
      palabrasRestantes,
      tiempoSegundos: partida.tiempoTurno,
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/turnos/:id/resultado ──────────────────────────────────────────
export async function registrarResultado(req, res, next) {
  try {
    const { id: turnoId } = req.params;
    const { palabraId, resultado } = req.body;

    const turno = await prisma.turno.findUnique({
      where: { id: turnoId },
      include: { partida: true },
    });
    if (!turno) return notFound(res, "Turno no encontrado");
    if (turno.estado !== "ACTIVO")
      return conflict(res, "El turno no está activo");

    const palabra = await prisma.palabra.findFirst({
      where: { id: palabraId, partidaId: turno.partidaId },
    });
    if (!palabra) return notFound(res, "Palabra no encontrada en esta partida");

    await prisma.$transaction([
      prisma.resultadoPalabra.create({
        data: { turnoId, palabraId, resultado },
      }),
      ...(resultado === "ADIVINADA"
        ? [
            prisma.equipo.update({
              where: { id: turno.equipoId },
              data: { puntuacionTotal: { increment: 1 } },
            }),
          ]
        : []),
    ]);

    const usadas = await prisma.resultadoPalabra.findMany({
      where: { turno: { partidaId: turno.partidaId, fase: turno.fase } },
      select: { palabraId: true },
    });
    const usadasIds = usadas.map((u) => u.palabraId);

    const siguientePalabra = await prisma.palabra.findFirst({
      where: { partidaId: turno.partidaId, id: { notIn: usadasIds } },
    });
    const palabrasRestantes = await prisma.palabra.count({
      where: { partidaId: turno.partidaId, id: { notIn: usadasIds } },
    });
    const adivinadasTurno = await prisma.resultadoPalabra.count({
      where: { turnoId, resultado: "ADIVINADA" },
    });

    ok(res, {
      siguientePalabra,
      palabrasRestantes,
      adivinadasTurno,
      faseCompletada: !siguientePalabra,
    });
  } catch (err) {
    next(err);
  }
}

// ─── PUT /api/turnos/:id/fin ──────────────────────────────────────────────────
export async function finalizarTurno(req, res, next) {
  try {
    const { id: turnoId } = req.params;

    const turno = await prisma.turno.findUnique({
      where: { id: turnoId },
      include: {
        partida: { include: { equipos: { orderBy: { orden: "asc" } } } },
        resultados: true,
      },
    });
    if (!turno) return notFound(res, "Turno no encontrado");
    if (turno.estado !== "ACTIVO")
      return conflict(res, "El turno ya ha finalizado");

    const adivinadas = turno.resultados.filter(
      (r) => r.resultado === "ADIVINADA",
    ).length;
    const pasadas = turno.resultados.filter(
      (r) => r.resultado === "PASADA",
    ).length;

    await prisma.turno.update({
      where: { id: turnoId },
      data: { estado: "FINALIZADO", fin: new Date() },
    });

    const usadas = await prisma.resultadoPalabra.findMany({
      where: { turno: { partidaId: turno.partidaId, fase: turno.fase } },
      select: { palabraId: true },
    });
    const totalPalabras = await prisma.palabra.count({
      where: { partidaId: turno.partidaId },
    });
    const usadasEnFase = await prisma.resultadoPalabra.count({
      where: { turno: { partidaId: turno.partidaId, fase: turno.fase } },
    });
    const faseCompletada = usadasEnFase >= totalPalabras;

    let siguienteFase = null;
    let partidaFinalizada = false;

    if (faseCompletada) {
      const nuevaFase = turno.fase + 1;
      if (nuevaFase > 3) {
        await prisma.partida.update({
          where: { id: turno.partidaId },
          data: { estado: "FINALIZADA" },
        });
        partidaFinalizada = true;
      } else {
        await prisma.partida.update({
          where: { id: turno.partidaId },
          data: { faseActual: nuevaFase },
        });
        siguienteFase = nuevaFase;
        // Limpiar resultados de la fase anterior para reusar las palabras
        await prisma.resultadoPalabra.deleteMany({
          where: { turno: { partidaId: turno.partidaId, fase: turno.fase } },
        });
      }
    }

    const equipos = turno.partida.equipos;
    const idxActual = equipos.findIndex((e) => e.id === turno.equipoId);
    const siguienteEquipo = equipos[(idxActual + 1) % equipos.length];

    ok(res, {
      adivinadas,
      pasadas,
      puntosGanados: adivinadas,
      siguienteEquipo: siguienteEquipo.nombre,
      faseCompletada,
      siguienteFase,
      partidaFinalizada,
    });
  } catch (err) {
    next(err);
  }
}
