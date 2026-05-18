// src/utils/response.js
// Respuestas estandarizadas en toda la API

export const ok      = (res, data, status = 200)  => res.status(status).json({ ok: true,  data })
export const created = (res, data)                 => res.status(201).json({ ok: true,  data })
export const noContent = (res)                     => res.status(204).send()

export const badRequest    = (res, message, errors = null) =>
  res.status(400).json({ ok: false, error: message, ...(errors && { errors }) })

export const unauthorized  = (res, message = 'No autenticado') =>
  res.status(401).json({ ok: false, error: message })

export const forbidden     = (res, message = 'Acceso denegado') =>
  res.status(403).json({ ok: false, error: message })

export const notFound      = (res, message = 'Recurso no encontrado') =>
  res.status(404).json({ ok: false, error: message })

export const conflict      = (res, message) =>
  res.status(409).json({ ok: false, error: message })

export const serverError   = (res, message = 'Error interno del servidor') =>
  res.status(500).json({ ok: false, error: message })