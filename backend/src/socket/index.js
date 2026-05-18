// src/socket/index.js
import prisma from '../config/prisma.js'

export function initSocket(io) {

  io.on('connection', (socket) => {
    console.log(`[Socket] Conectado: ${socket.id}`)

    // ─── unirse_sala ──────────────────────────────────────────────────────────
    socket.on('unirse_sala', async ({ codigoSala, jugadorId }) => {
      try {
        const partida = await prisma.partida.findUnique({ where: { codigoSala } })
        if (!partida) {
          return socket.emit('error_sala', { mensaje: 'Sala no encontrada' })
        }
        socket.join(codigoSala)
        socket.data.codigoSala = codigoSala
        socket.data.jugadorId  = jugadorId

        socket.to(codigoSala).emit('jugador_unido', { jugadorId, mensaje: 'Un nuevo jugador se unió' })
        socket.emit('sala_confirmada', { codigoSala, partidaId: partida.id, estado: partida.estado })
        console.log(`[Socket] ${socket.id} unido a sala ${codigoSala}`)
      } catch (err) {
        console.error('[Socket] unirse_sala error:', err)
        socket.emit('error_sala', { mensaje: 'Error al unirse a la sala' })
      }
    })

    // ─── iniciar_turno ────────────────────────────────────────────────────────
    socket.on('iniciar_turno', async ({ partidaId, equipoId }) => {
      try {
        const [partida, equipo] = await Promise.all([
          prisma.partida.findUnique({ where: { id: partidaId } }),
          prisma.equipo.findUnique({  where: { id: equipoId  } }),
        ])
        if (!partida || !equipo) return
        const sala = socket.data.codigoSala ?? partida.codigoSala
        io.to(sala).emit('turno_iniciado', {
          equipo: equipo.nombre, equipoId, fase: partida.faseActual, tiempo: partida.tiempoTurno,
        })
      } catch (err) {
        console.error('[Socket] iniciar_turno error:', err)
      }
    })

    // ─── palabra_resultado ────────────────────────────────────────────────────
    socket.on('palabra_resultado', async ({ turnoId, resultado, codigoSala }) => {
      try {
        const sala = codigoSala ?? socket.data.codigoSala
        if (!sala) return
        const turno  = await prisma.turno.findUnique({ where: { id: turnoId } })
        const equipos = await prisma.equipo.findMany({
          where:   { partidaId: turno.partidaId },
          orderBy: { puntuacionTotal: 'desc' },
          select:  { id: true, nombre: true, puntuacionTotal: true },
        })
        io.to(sala).emit('marcador_actualizado', {
          equipoId:   turno.equipoId,
          puntoNuevo: resultado === 'ADIVINADA' ? 1 : 0,
          marcador:   equipos,
        })
      } catch (err) {
        console.error('[Socket] palabra_resultado error:', err)
      }
    })

    // ─── fase_completada ──────────────────────────────────────────────────────
    socket.on('notificar_fase_completada', ({ codigoSala, faseCompletada, siguienteFase, marcador }) => {
      io.to(codigoSala).emit('fase_completada', { faseCompletada, siguienteFase, marcador })
    })

    // ─── partida_finalizada ───────────────────────────────────────────────────
    socket.on('notificar_fin_partida', ({ codigoSala, marcadorFinal }) => {
      io.to(codigoSala).emit('partida_finalizada', { ganador: marcadorFinal[0]?.nombre, marcadorFinal })
    })

    // ─── desconexión ──────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const sala = socket.data.codigoSala
      if (sala) socket.to(sala).emit('jugador_desconectado', { jugadorId: socket.data.jugadorId })
      console.log(`[Socket] Desconectado: ${socket.id}`)
    })
  })
}