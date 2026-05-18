// Todos los middlewares de la aplicación en un único fichero

import { verifyAccessToken } from '../utils/jwt.js'
import { unauthorized, forbidden, badRequest, serverError } from '../utils/response.js'
import rateLimit from 'express-rate-limit'

// ─── 1. Autenticación JWT ─────────────────────────────────────────────────────
// Verifica el Bearer token en cada ruta protegida
export function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return unauthorized(res, 'Token no proporcionado')
  }

  const token = header.split(' ')[1]
  try {
    req.user = verifyAccessToken(token) // { id, email, rol, iat, exp }
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token expirado. Renueva con /auth/refresh')
    }
    return unauthorized(res, 'Token inválido')
  }
}

// ─── 2. Autorización por roles ────────────────────────────────────────────────
// Uso: authorize('ADMIN')  o  authorize('ADMIN', 'JUGADOR')
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return unauthorized(res)
    if (!roles.includes(req.user.rol)) {
      return forbidden(res, `Se requiere rol: ${roles.join(' o ')}`)
    }
    next()
  }
}

// ─── 3. Validación con Zod ────────────────────────────────────────────────────
// Uso: validate(miSchema)  — valida req.body contra el schema
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.errors.map(e => ({
        campo:   e.path.join('.'),
        mensaje: e.message,
      }))
      return badRequest(res, 'Datos inválidos', errors)
    }
    req.body = result.data // datos ya parseados y transformados por Zod
    next()
  }
}

// ─── 4. Rate limiting ─────────────────────────────────────────────────────────
// Límite general: 100 peticiones / 15 min por IP
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { ok: false, error: 'Demasiadas peticiones. Inténtalo más tarde.' },
})

// Límite estricto para auth: 10 intentos / 15 min
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message: { ok: false, error: 'Demasiados intentos de autenticación.' },
})

// ─── 5. Manejador global de errores ──────────────────────────────────────────
// Debe ser el ÚLTIMO middleware registrado en Express
export function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err)

  // Errores conocidos de Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({ ok: false, error: 'Ya existe un registro con ese valor único' })
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ ok: false, error: 'Registro no encontrado' })
  }

  // Error genérico
  const status  = err.status || 500
  const message = process.env.NODE_ENV === 'production'
    ? 'Error interno del servidor'
    : err.message

  res.status(status).json({ ok: false, error: message })
}

// ─── 6. Ruta no encontrada ────────────────────────────────────────────────────
export function notFoundHandler(req, res) {
  res.status(404).json({ ok: false, error: `Ruta ${req.method} ${req.path} no existe` })
}