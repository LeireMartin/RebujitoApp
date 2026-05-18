// Zod — validación declarativa de todos los datos entrantes

import { z } from 'zod'

// ─── Auth ────────────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  email:    z.string().email('Email inválido').max(100),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/,  'Debe contener al menos una mayúscula')
    .regex(/[0-9]/,  'Debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
  nombre:   z.string().min(2).max(50).trim(),
})

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

// ─── Partidas ────────────────────────────────────────────────────────────────
export const crearPartidaSchema = z.object({
  modo:           z.enum(['LOCAL', 'RED']),
  tiempoTurno:    z.number().int().min(30).max(180).default(60),
  palabrasPorFase:z.number().int().min(10).max(60).default(20),
  equipos:        z
    .array(z.string().min(1).max(30).trim())
    .min(2, 'Mínimo 2 equipos')
    .max(6, 'Máximo 6 equipos'),
})

export const unirsePartidaSchema = z.object({
  codigoSala:    z.string().length(5).toUpperCase(),
  nombreJugador: z.string().min(1).max(30).trim(),
  equipoId:      z.string().uuid(),
})

// ─── Palabras ────────────────────────────────────────────────────────────────
export const agregarPalabrasSchema = z.object({
  tematicas:       z.array(z.string().uuid()).min(3, 'Selecciona mínimo 3 temáticas').optional(),
  palabrasCustom:  z
    .array(z.string().min(1).max(60).trim())
    .max(50, 'Máximo 50 palabras personalizadas')
    .optional(),
}).refine(
  data => (data.tematicas?.length ?? 0) + (data.palabrasCustom?.length ?? 0) > 0,
  { message: 'Debes añadir temáticas o palabras personalizadas' }
)

// ─── Turnos ──────────────────────────────────────────────────────────────────
export const iniciarTurnoSchema = z.object({
  equipoId: z.string().uuid(),
})

export const resultadoPalabraSchema = z.object({
  palabraId: z.string().uuid(),
  resultado: z.enum(['ADIVINADA', 'PASADA']),
})

// ─── Usuarios (admin) ─────────────────────────────────────────────────────────
export const updateUsuarioSchema = z.object({
  nombre:    z.string().min(2).max(50).trim().optional(),
  avatarUrl: z.string().url().optional().nullable(),
  rol:       z.enum(['ADMIN', 'JUGADOR']).optional(),
})