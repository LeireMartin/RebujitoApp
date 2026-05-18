// src/index.js
import 'dotenv/config'
import express          from 'express'
import { createServer } from 'http'
import { Server }       from 'socket.io'
import cors             from 'cors'
import helmet           from 'helmet'

import routes                                                from './routes/index.js'
import { initSocket }                                        from './socket/index.js'
import { generalLimiter, errorHandler, notFoundHandler }    from './middlewares/index.js'

const app        = express()
const httpServer = createServer(app)
const PORT       = process.env.PORT ?? 3000

// ─── Socket.io ───────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin:  process.env.FRONTEND_URL ?? 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})
initSocket(io)

// ─── Middlewares globales ─────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '10kb' }))
app.use(generalLimiter)

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ ok: true, env: process.env.NODE_ENV }))

// ─── Rutas API ────────────────────────────────────────────────────────────────
app.use('/api', routes)

// ─── 404 + Error handler ──────────────────────────────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

// ─── Arrancar servidor ────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════╗
  ║   Rebujito ☻ — Backend             ║
  ║   http://localhost:${PORT}         ║
  ║   Entorno: ${process.env.NODE_ENV ?? 'development'}          ║
  ╚════════════════════════════════════╝
  `)
})

export { io }