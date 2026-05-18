-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'JUGADOR');

-- CreateEnum
CREATE TYPE "ModoPartida" AS ENUM ('LOCAL', 'RED');

-- CreateEnum
CREATE TYPE "EstadoPartida" AS ENUM ('CONFIGURANDO', 'JUGANDO', 'PAUSADA', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "OrigenPalabra" AS ENUM ('PREDEFINIDA', 'PERSONALIZADA');

-- CreateEnum
CREATE TYPE "EstadoTurno" AS ENUM ('PENDIENTE', 'ACTIVO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "ResultadoTipo" AS ENUM ('ADIVINADA', 'PASADA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'JUGADOR',
    "avatarUrl" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partidas" (
    "id" TEXT NOT NULL,
    "codigoSala" TEXT NOT NULL,
    "modo" "ModoPartida" NOT NULL DEFAULT 'LOCAL',
    "estado" "EstadoPartida" NOT NULL DEFAULT 'CONFIGURANDO',
    "tiempoTurno" INTEGER NOT NULL DEFAULT 60,
    "palabrasPorFase" INTEGER NOT NULL DEFAULT 20,
    "faseActual" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipos" (
    "id" TEXT NOT NULL,
    "partidaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "puntuacionTotal" INTEGER NOT NULL DEFAULT 0,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jugadores" (
    "id" TEXT NOT NULL,
    "equipoId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "nombre" TEXT NOT NULL,
    "avatar" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jugadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tematicas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "predefinida" BOOLEAN NOT NULL DEFAULT true,
    "icono" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tematicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "palabras" (
    "id" TEXT NOT NULL,
    "partidaId" TEXT NOT NULL,
    "tematicaId" TEXT,
    "texto" TEXT NOT NULL,
    "origen" "OrigenPalabra" NOT NULL DEFAULT 'PREDEFINIDA',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "palabras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnos" (
    "id" TEXT NOT NULL,
    "partidaId" TEXT NOT NULL,
    "equipoId" TEXT NOT NULL,
    "fase" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "inicio" TIMESTAMP(3),
    "fin" TIMESTAMP(3),
    "estado" "EstadoTurno" NOT NULL DEFAULT 'PENDIENTE',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resultados_palabras" (
    "id" TEXT NOT NULL,
    "turnoId" TEXT NOT NULL,
    "palabraId" TEXT NOT NULL,
    "resultado" "ResultadoTipo" NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resultados_palabras_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "partidas_codigoSala_key" ON "partidas"("codigoSala");

-- CreateIndex
CREATE UNIQUE INDEX "jugadores_usuarioId_key" ON "jugadores"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "tematicas_nombre_key" ON "tematicas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "resultados_palabras_turnoId_palabraId_key" ON "resultados_palabras"("turnoId", "palabraId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_partidaId_fkey" FOREIGN KEY ("partidaId") REFERENCES "partidas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jugadores" ADD CONSTRAINT "jugadores_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jugadores" ADD CONSTRAINT "jugadores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palabras" ADD CONSTRAINT "palabras_partidaId_fkey" FOREIGN KEY ("partidaId") REFERENCES "partidas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palabras" ADD CONSTRAINT "palabras_tematicaId_fkey" FOREIGN KEY ("tematicaId") REFERENCES "tematicas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_partidaId_fkey" FOREIGN KEY ("partidaId") REFERENCES "partidas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados_palabras" ADD CONSTRAINT "resultados_palabras_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "turnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados_palabras" ADD CONSTRAINT "resultados_palabras_palabraId_fkey" FOREIGN KEY ("palabraId") REFERENCES "palabras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
