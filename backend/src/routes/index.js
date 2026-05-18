// src/routes/index.js
import { Router } from 'express'
import { authenticate, authorize, validate, authLimiter } from '../middlewares/index.js'
import * as authCtrl     from '../controllers/auth.controller.js'
import * as partidasCtrl from '../controllers/partidas.controller.js'
import * as palabrasCtrl from '../controllers/palabras.controller.js'
import * as turnosCtrl   from '../controllers/turnos.controller.js'
import {
  registerSchema, loginSchema, refreshSchema,
  crearPartidaSchema, unirsePartidaSchema,
  agregarPalabrasSchema,
  iniciarTurnoSchema, resultadoPalabraSchema,
} from '../validators/schemas.js'

const router = Router()

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post('/auth/register', authLimiter, validate(registerSchema),  authCtrl.register)
router.post('/auth/login',    authLimiter, validate(loginSchema),     authCtrl.login)
router.post('/auth/refresh',  authLimiter, validate(refreshSchema),   authCtrl.refresh)
router.post('/auth/logout',   authCtrl.logout)
router.get('/auth/me',        authenticate, authCtrl.me)

// ─── Temáticas ────────────────────────────────────────────────────────────────
router.get('/tematicas', palabrasCtrl.listarTematicas)

// ─── Partidas ─────────────────────────────────────────────────────────────────
router.post('/partidas',              validate(crearPartidaSchema),   partidasCtrl.crearPartida)
router.get('/partidas/:id',                                            partidasCtrl.obtenerPartida)
router.post('/partidas/:id/unirse',   validate(unirsePartidaSchema),  partidasCtrl.unirsePartida)
router.get('/partidas/:id/marcador',                                   partidasCtrl.obtenerMarcador)

// ─── Palabras ─────────────────────────────────────────────────────────────────
router.post('/partidas/:id/palabras', validate(agregarPalabrasSchema), palabrasCtrl.agregarPalabras)

// ─── Turnos ───────────────────────────────────────────────────────────────────
router.post('/partidas/:id/turnos',  validate(iniciarTurnoSchema),    turnosCtrl.iniciarTurno)
router.post('/turnos/:id/resultado', validate(resultadoPalabraSchema), turnosCtrl.registrarResultado)
router.put('/turnos/:id/fin',                                          turnosCtrl.finalizarTurno)

export default router