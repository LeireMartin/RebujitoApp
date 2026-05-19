import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
})

export const crearPartida  = (data)       => api.post('/partidas', data)
export const obtenerPartida = (id)        => api.get(`/partidas/${id}`)
export const obtenerMarcador = (id)       => api.get(`/partidas/${id}/marcador`)
export const listarTematicas = ()         => api.get('/tematicas')
export const agregarPalabras = (id, data) => api.post(`/partidas/${id}/palabras`, data)
export const iniciarTurno   = (id, data)  => api.post(`/partidas/${id}/turnos`, data)
export const registrarResultado = (id, data) => api.post(`/turnos/${id}/resultado`, data)
export const finalizarTurno = (id)        => api.put(`/turnos/${id}/fin`)

export default api