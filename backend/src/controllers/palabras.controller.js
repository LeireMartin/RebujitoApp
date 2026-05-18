// src/controllers/palabras.controller.js
import prisma from '../config/prisma.js'
import { ok, created, notFound, conflict, badRequest } from '../utils/response.js'

// ─── GET /api/tematicas ───────────────────────────────────────────────────────
export async function listarTematicas(req, res, next) {
  try {
    const tematicas = await prisma.tematica.findMany({
      orderBy: { nombre: 'asc' },
    })
    ok(res, tematicas)
  } catch (err) { next(err) }
}

// ─── POST /api/partidas/:id/palabras ──────────────────────────────────────────
// Llena el Rebujito con palabras de temáticas elegidas + palabras personalizadas
export async function agregarPalabras(req, res, next) {
  try {
    const { id: partidaId } = req.params
    const { tematicas = [], palabrasCustom = [] } = req.body

    const partida = await prisma.partida.findUnique({ where: { id: partidaId } })
    if (!partida) return notFound(res, 'Partida no encontrada')
    if (partida.estado !== 'CONFIGURANDO') return conflict(res, 'La partida ya está en curso')

    // Eliminar palabras previas si se vuelve a configurar
    await prisma.palabra.deleteMany({ where: { partidaId } })

    const palabrasACrear = []

    // Palabras de temáticas predefinidas (traer todas las de esa temática)
    if (tematicas.length > 0) {
      // En producción tendrías una tabla palabras_predefinidas por temática.
      // Aquí usamos las palabras que ya hay en la partida con esas temáticas
      // como ejemplo; el seed las poblaría desde un catálogo externo.
      const tematicasDb = await prisma.tematica.findMany({
        where: { id: { in: tematicas } },
      })
      if (tematicasDb.length !== tematicas.length) {
        return badRequest(res, 'Una o más temáticas no existen')
      }
      // Añadir placeholder por temática (en prod vendrían de un catálogo)
      tematicasDb.forEach(t => {
        palabrasACrear.push({
          partidaId,
          tematicaId: t.id,
          texto:      `[${t.nombre}]`,   // sustituir por catálogo real
          origen:     'PREDEFINIDA',
        })
      })
    }

    // Palabras personalizadas
    palabrasCustom.forEach(texto => {
      palabrasACrear.push({ partidaId, texto, origen: 'PERSONALIZADA' })
    })

    // Insertar todas en una sola transacción
    await prisma.palabra.createMany({ data: palabrasACrear })

    ok(res, {
      totalPalabras: palabrasACrear.length,
      mensaje: '☻ Rebujito listo ☻',
    }, 201)
  } catch (err) { next(err) }
}