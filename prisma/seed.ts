import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { ContentType } from "../src/generated/prisma/enums";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.template.create({
    data: {
      name: "Alphabetic Wheel",
      description: "A single ring with the 26 letters of the alphabet.",
      rings: {
        create: [
          {
            order: 0,
            segmentCount: 26,
            contentType: ContentType.ALPHABET,
            defaultLabels: {
              create: Array.from({ length: 26 }, (_, i) => ({
                index: i,
                defaultLabel: String.fromCharCode(65 + i),
              })),
            },
          },
        ],
      },
    },
  });

  const people = ["Caesar", "Athena", "Merlin", "Cleopatra", "Icarus", "Odysseus"];
  const places = ["Forest", "Castle", "Ocean", "Market", "Mountain", "Temple"];
  const actions = ["Fights", "Sings", "Flees", "Builds", "Dreams", "Betrays"];

  await prisma.template.create({
    data: {
      name: "Person / Place / Action",
      description:
        "Three-ring combinatorial mnemonic wheel (after Bruno's Ars Magna wheels): " +
        "combine a person, a place, and an action to generate ideas or mnemonic scenes.",
      rings: {
        create: [
          {
            order: 0,
            segmentCount: people.length,
            contentType: ContentType.CUSTOM,
            defaultLabels: {
              create: people.map((label, i) => ({ index: i, defaultLabel: label })),
            },
          },
          {
            order: 1,
            segmentCount: places.length,
            contentType: ContentType.CUSTOM,
            defaultLabels: {
              create: places.map((label, i) => ({ index: i, defaultLabel: label })),
            },
          },
          {
            order: 2,
            segmentCount: actions.length,
            contentType: ContentType.CUSTOM,
            defaultLabels: {
              create: actions.map((label, i) => ({ index: i, defaultLabel: label })),
            },
          },
        ],
      },
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
