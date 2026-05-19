// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DATOS = [
  {
    nombre: "Animales",
    icono: "🦁",
    palabras: [
      "Capibara",
      "Tigre",
      "Escarabajo pelotero",
      "Ornitorrinco",
      "Flamenco",
      "Delfín",
      "Pingüino",
      "Camaleón",
      "Koala",
    ],
  },
  {
    nombre: "Cine y series",
    icono: "🎬",
    palabras: [
      "Mamma Mía",
      "Titanic",
      "Breaking Bad",
      "Paquita Salas",
      "Juego de Tronos",
      "El Señor de los Anillos",
      "Matrix",
      "Bob Esponja",
      "Doraemon",
      "Pókemon",
    ],
  },
  {
    nombre: "Deportes",
    icono: "⚽",
    palabras: [
      "Mbappé",
      "Messi",
      "Cristiano Ronaldo",
      "Ronaldinho",
      "Falta",
      "Árbitro",
      "Gol",
      "Patinaje",
      "Petanca",
      "Fernando alonso",
    ],
  },
  {
    nombre: "Personajes famosos",
    icono: "🌟",
    palabras: [
      "Belén Esteban",
      "Falete",
      "Vegeta777 (Youtuber)",
      "Chicote (Cocinero)",
      "Chiquito de la Calzada",
      "Lola Lolita",
      "Pedro Sánchez",
      "Samantha Ballentines (Drag Queen)",
      "Mario Vaquerizo",
      "Ruth Empoderada",
    ],
  },
  {
    nombre: "Objetos cotidianos",
    icono: "🏠",
    palabras: [
      "Airfriyer",
      "Ratón (Ordenador)",
      "Olla",
      "Mail",
      "Cargador",
      "Abrelatas",
      "Máscara de pestañas",
      "Embudo",
      "Tijeras",
      "Desatascador",
    ],
  },
  {
    nombre: "Historia",
    icono: "📜",
    palabras: [
      "La Revolución Francesa",
      "Imperio Romano",
      "La Reconquista",
      "Segunda Guerra Mundial",
      "La Inquisición",
      "El Renacimiento",
      "La Guerra Fría",
      "La Edad Media",
      "El Imperio Azteca",
      "La Revolución Industrial",
    ],
  },
  {
    nombre: "Música",
    icono: "🎵",
    palabras: [
      "La Húngara",
      "Bad Gyal",
      "Bad Bunny",
      "Metállica",
      "Quevedo",
      "Métrica",
      "AC/DC",
      "Katseye",
      "Sabrina Carpenter",
      "Camela",
    ],
  },
  {
    nombre: "Cocina",
    icono: "🍳",
    palabras: [
      "Paella",
      "Gazpacho",
      "Tortilla de patatas sin cebolla",
      "Nocilla",
      "Sushi",
      "Nabo",
      "Ratatouille",
      "Croquetas",
      "Tiramisú",
      "Puchero",
    ],
  },
];

async function main() {
  console.log("🌱 Iniciando seed...");

  const adminHash = await bcrypt.hash("Admin1234!", 12);
  await prisma.usuario.upsert({
    where: { email: "admin@rebujito.app" },
    update: {},
    create: {
      email: "admin@rebujito.app",
      passwordHash: adminHash,
      nombre: "Administrador",
      rol: "ADMIN",
    },
  });
  console.log("✅ Admin creado");

  for (const categoria of DATOS) {
    const tematica = await prisma.tematica.upsert({
      where: { nombre: categoria.nombre },
      update: { icono: categoria.icono },
      create: {
        nombre: categoria.nombre,
        icono: categoria.icono,
        predefinida: true,
      },
    });
    console.log(`📂 Temática: ${categoria.nombre}`);

    for (const texto of categoria.palabras) {
      const existe = await prisma.palabra.findFirst({
        where: { texto, tematica: { id: tematica.id } },
      });
      if (!existe) {
        await prisma.palabra.create({
          data: {
            texto,
            origen: "PREDEFINIDA",
            tematica: { connect: { id: tematica.id } },
          },
        });
        console.log(`   ➕ "${texto}"`);
      } else {
        console.log(`   ⏭  "${texto}" ya existe`);
      }
    }
  }

  console.log("\n✅ Seed completado — temáticas, palabras y admin creados");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
