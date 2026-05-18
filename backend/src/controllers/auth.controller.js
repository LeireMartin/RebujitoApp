// src/controllers/auth.controller.js
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import prisma from '../config/prisma.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js'
import { created, ok, unauthorized, conflict, badRequest } from '../utils/response.js'

// ─── Registro ────────────────────────────────────────────────────────────────
export async function register(req, res, next) {
  try {
    const { email, password, nombre } = req.body

    const existe = await prisma.usuario.findUnique({ where: { email } })
    if (existe) return conflict(res, 'El email ya está registrado')

    const passwordHash = await bcrypt.hash(password, 12)
    const usuario = await prisma.usuario.create({
      data:   { email, passwordHash, nombre },
      select: { id: true, email: true, nombre: true, rol: true, creadoEn: true },
    })

    const { accessToken, refreshToken } = await _generarTokens(usuario)
    created(res, { usuario, accessToken, refreshToken })
  } catch (err) { next(err) }
}

// ─── Login ───────────────────────────────────────────────────────────────────
export async function login(req, res, next) {
  try {
    const { email, password } = req.body

    const usuario = await prisma.usuario.findUnique({ where: { email } })
    if (!usuario) return unauthorized(res, 'Credenciales incorrectas')

    const passwordOk = await bcrypt.compare(password, usuario.passwordHash)
    if (!passwordOk) return unauthorized(res, 'Credenciales incorrectas')

    const { accessToken, refreshToken } = await _generarTokens(usuario)
    const { passwordHash: _, ...usuarioPublico } = usuario
    ok(res, { usuario: usuarioPublico, accessToken, refreshToken })
  } catch (err) { next(err) }
}

// ─── Refresh token ────────────────────────────────────────────────────────────
export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body

    // 1. Verificar firma JWT
    let payload
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch {
      return unauthorized(res, 'Refresh token inválido o expirado')
    }

    // 2. Comprobar que existe en BD (no ha sido revocado)
    const tokenDb = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
    if (!tokenDb || tokenDb.expiresAt < new Date()) {
      return unauthorized(res, 'Refresh token revocado o expirado')
    }

    // 3. Rotar: eliminar el viejo y crear uno nuevo
    await prisma.refreshToken.delete({ where: { id: tokenDb.id } })
    const usuario = await prisma.usuario.findUnique({ where: { id: payload.id } })
    const tokens = await _generarTokens(usuario)

    ok(res, tokens)
  } catch (err) { next(err) }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
    }
    ok(res, { mensaje: 'Sesión cerrada correctamente' })
  } catch (err) { next(err) }
}

// ─── Me (perfil del usuario autenticado) ─────────────────────────────────────
export async function me(req, res, next) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where:  { id: req.user.id },
      select: { id: true, email: true, nombre: true, rol: true, avatarUrl: true, creadoEn: true },
    })
    ok(res, usuario)
  } catch (err) { next(err) }
}

// ─── Helper privado ───────────────────────────────────────────────────────────
async function _generarTokens(usuario) {
  const payload      = { id: usuario.id, email: usuario.email, rol: usuario.rol }
  const accessToken  = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)

  // Guardar refresh token en BD para poder revocarlo
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
  await prisma.refreshToken.create({
    data: { token: refreshToken, usuarioId: usuario.id, expiresAt },
  })

  return { accessToken, refreshToken }
}