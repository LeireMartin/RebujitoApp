// src/controllers/palabras.controller.js
import prisma from "../config/prisma.js";
import { ok, notFound, conflict, badRequest } from "../utils/response.js";

// ─── GET /api/tematicas ───────────────────────────────────────────────────────
export async function listarTematicas(req, res, next) {
  try {
    const tematicas = await prisma.tematica.findMany({
      orderBy: { nombre: "asc" },
    });
    ok(res, tematicas);
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/partidas/:id/palabras ──────────────────────────────────────────
export async function agregarPalabras(req, res, next) {
  try {
    const { id: partidaId } = req.params;
    const { tematicas = [], palabrasCustom = [] } = req.body;

    const partida = await prisma.partida.findUnique({
      where: { id: partidaId },
    });
    if (!partida) return notFound(res, "Partida no encontrada");
    if (partida.estado !== "CONFIGURANDO")
      return conflict(res, "La partida ya está en curso");

    // Eliminar palabras previas
    await prisma.palabra.deleteMany({ where: { partidaId } });

    const palabrasACrear = [];

    // Coger palabras del catálogo global para las temáticas elegidas
    const palabrasCatalogo = await prisma.palabra.findMany({
      where: {
        tematicaId: { in: tematicas },
        partidaId: null,
      },
      select: { texto: true, tematicaId: true },
    });

    // Mezclar y limitar al número de palabras por fase configurado
    palabrasCatalogo.sort(() => Math.random() - 0.5);
    const limite = partida.palabrasPorFase ?? 20;
    const palabrasLimitadas = palabrasCatalogo.slice(0, limite);

    palabrasLimitadas.forEach((p) => {
      palabrasACrear.push({
        partidaId,
        tematicaId: p.tematicaId,
        texto: p.texto,
        origen: "PREDEFINIDA",
      });
    });

    // Palabras personalizadas
    palabrasCustom.forEach((texto) => {
      palabrasACrear.push({ partidaId, texto, origen: "PERSONALIZADA" });
    });

    if (palabrasACrear.length === 0) {
      return badRequest(
        res,
        "No se encontraron palabras para las temáticas seleccionadas",
      );
    }

    // Mezclar aleatoriamente
    palabrasACrear.sort(() => Math.random() - 0.5);

    await prisma.palabra.createMany({ data: palabrasACrear });

    ok(
      res,
      {
        totalPalabras: palabrasACrear.length,
        mensaje: "Rebujito listo",
      },
      201,
    );
  } catch (err) {
    next(err);
  }
}
