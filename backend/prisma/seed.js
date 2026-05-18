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
      "Mantarraya",
    ],
  },
  {
    nombre: "Cine y series",
    icono: "🎬",
    palabras: [
      "El Padrino",
      "Titanic",
      "Breaking Bad",
      "La Casa de Papel",
      "Juego de Tronos",
      "El Señor de los Anillos",
      "Pulp Fiction",
      "Interstellar",
      "Stranger Things",
      "Peaky Blinders",
    ],
  },
  {
    nombre: "Deportes",
    icono: "⚽",
    palabras: [
      "Baloncesto",
      "Ciclismo",
      "Esgrima",
      "Waterpolo",
      "Bádminton",
      "Remo",
      "Salto de altura",
      "Lanzamiento de jabalina",
      "Triatlón",
      "Curling",
    ],
  },
  {
    nombre: "Personajes famosos",
    icono: "🌟",
    palabras: [
      "Albert Einstein",
      "Cleopatra",
      "Freddie Mercury",
      "Cristiano Ronaldo",
      "Leonardo Da Vinci",
      "Marilyn Monroe",
      "Napoleon Bonaparte",
      "Nikola Tesla",
      "Frida Kahlo",
      "Charles Darwin",
    ],
  },
  {
    nombre: "Objetos cotidianos",
    icono: "🏠",
    palabras: [
      "Nevera",
      "Paraguas",
      "Destornillador",
      "Colador",
      "Cargador",
      "Abrelatas",
      "Perchero",
      "Embudo",
      "Tijeras",
      "Calculadora",
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
      "Flamenco",
      "Jazz",
      "Reggaetón",
      "Ópera",
      "Heavy Metal",
      "Bachata",
      "Blues",
      "Bossa Nova",
      "Trap",
      "Cumbia",
    ],
  },
  {
    nombre: "Cocina",
    icono: "🍳",
    palabras: [
      "Paella",
      "Gazpacho",
      "Tortilla española",
      "Croissant",
      "Sushi",
      "Ceviche",
      "Ratatouille",
      "Hummus",
      "Tiramisú",
      "Guacamole",
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
