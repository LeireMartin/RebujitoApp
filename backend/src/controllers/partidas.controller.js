// src/controllers/partidas.controller.js
import { v4 as uuidv4 } from 'uuid'
import prisma from '../config/prisma.js'
import { ok, created, notFound, conflict, forbidden, badRequest } from '../utils/response.js'

// ─── Generar código de sala único de 5 letras ─────────────────────────────────
async function generarCodigoUnico() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sin 0, O, 1, I (confusos)
  let codigo
  let existe = true
  while (existe) {
    codigo = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    existe = await prisma.partida.findUnique({ where: { codigoSala: codigo } })
  }
  return codigo
}

// ─── POST /api/partidas ───────────────────────────────────────────────────────
export async function crearPartida(req, res, next) {
  try {
    const { modo, tiempoTurno, palabrasPorFase, equipos } = req.body
    const codigoSala = await generarCodigoUnico()

    const partida = await prisma.partida.create({
      data: {
        codigoSala,
        modo,
        tiempoTurno,
        palabrasPorFase,
        equipos: {
          create: equipos.map((nombre, i) => ({ nombre, orden: i })),
        },
      },
      include: { equipos: { orderBy: { orden: 'asc' } } },
    })

    created(res, partida)
  } catch (err) { next(err) }
}

// ─── GET /api/partidas/:id ────────────────────────────────────────────────────
export async function obtenerPartida(req, res, next) {
  try {
    const partida = await prisma.partida.findUnique({
      where:   { id: req.params.id },
      include: {
        equipos:  { orderBy: { orden: 'asc' }, include: { jugadores: true } },
        turnos:   { where: { estado: 'ACTIVO' }, take: 1 },
        _count:   { select: { palabras: true } },
      },
    })
    if (!partida) return notFound(res, 'Partida no encontrada')
    ok(res, partida)
  } catch (err) { next(err) }
}

// ─── POST /api/partidas/:id/unirse ────────────────────────────────────────────
export async function unirsePartida(req, res, next) {
  try {
    const { codigoSala, nombreJugador, equipoId } = req.body

    const partida = await prisma.partida.findFirst({
      where: { id: req.params.id, codigoSala },
    })
    if (!partida)                              return notFound(res, 'Sala no encontrada')
    if (partida.estado !== 'CONFIGURANDO')     return conflict(res,  'La partida ya ha comenzado')
    if (partida.modo   !== 'RED')              return badRequest(res,'Esta partida es en modo local')

    const equipo = await prisma.equipo.findFirst({
      where: { id: equipoId, partidaId: partida.id },
    })
    if (!equipo) return notFound(res, 'Equipo no encontrado en esta partida')

    const jugador = await prisma.jugador.create({
      data: {
        nombre:    nombreJugador,
        equipoId,
        usuarioId: req.user?.id ?? null,
      },
    })

    ok(res, { jugador, equipo, partida: { id: partida.id, codigoSala: partida.codigoSala } })
  } catch (err) { next(err) }
}

// ─── GET /api/partidas/:id/marcador ──────────────────────────────────────────
export async function obtenerMarcador(req, res, next) {
  try {
    const equipos = await prisma.equipo.findMany({
      where:   { partidaId: req.params.id },
      orderBy: { puntuacionTotal: 'desc' },
      include: {
        turnos: {
          select: { fase: true, resultados: { where: { resultado: 'ADIVINADA' } } },
        },
      },
    })

    if (!equipos.length) return notFound(res, 'Partida no encontrada')

    // Agrupar puntos por fase
    const marcador = equipos.map(eq => {
      const porFase = [0, 0, 0]
      eq.turnos.forEach(t => { porFase[t.fase - 2] = (porFase[t.fase - 2] || 0) + t.resultados.length })
      return { id: eq.id, nombre: eq.nombre, total: eq.puntuacionTotal, porFase }
    })

    const partida = await prisma.partida.findUnique({ where: { id: req.params.id }, select: { estado: true, faseActual: true } })
    ok(res, { equipos: marcador, ganador: partida?.estado === 'FINALIZADA' ? marcador[0].nombre : null })
  } catch (err) { next(err) }
}