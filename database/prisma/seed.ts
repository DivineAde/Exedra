import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@whiteboard.app" },
    update: {},
    create: {
      email: "demo@whiteboard.app",
      name: "Demo User",
      passwordHash,
    },
  });

  const demoDocument = {
    elements: [
      {
        id: "seed-rect-1",
        type: "rectangle",
        x: 120,
        y: 120,
        width: 220,
        height: 140,
        rotation: 0,
        strokeColor: "#1e1e1e",
        backgroundColor: "#a5d8ff",
        strokeWidth: 2,
        strokeStyle: "solid",
        fillStyle: "solid",
        opacity: 100,
        locked: false,
        seed: 12345,
        cornerRadius: 8,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "seed-ellipse-1",
        type: "ellipse",
        x: 420,
        y: 160,
        width: 160,
        height: 120,
        rotation: 0,
        strokeColor: "#1e1e1e",
        backgroundColor: "#ffc9c9",
        strokeWidth: 2,
        strokeStyle: "solid",
        fillStyle: "solid",
        opacity: 100,
        locked: false,
        seed: 54321,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "seed-text-1",
        type: "text",
        x: 150,
        y: 320,
        width: 300,
        height: 32,
        rotation: 0,
        strokeColor: "#1e1e1e",
        backgroundColor: "transparent",
        strokeWidth: 2,
        strokeStyle: "solid",
        fillStyle: "solid",
        opacity: 100,
        locked: false,
        seed: 11111,
        text: "Welcome to your whiteboard!",
        fontSize: 24,
        fontFamily: "hand",
        textAlign: "left",
        lineHeight: 1.25,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    backgroundColor: "#ffffff",
    version: 1,
  };

  await prisma.board.upsert({
    where: { id: "seed-board-1" },
    update: {},
    create: {
      id: "seed-board-1",
      name: "Demo Board",
      ownerId: demoUser.id,
      document: demoDocument,
      version: 1,
    },
  });

  console.log("Seed complete:", { user: demoUser.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
