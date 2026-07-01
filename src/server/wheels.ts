"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generateLabels } from "@/lib/wheel-content";
import { ContentType } from "@/generated/prisma/enums";

export async function createWheelFromTemplate(templateId: string, name: string) {
  const template = await prisma.template.findUnique({
    where: { id: templateId },
    include: {
      rings: {
        orderBy: { order: "asc" },
        include: { defaultLabels: { orderBy: { index: "asc" } } },
      },
    },
  });
  if (!template) {
    throw new Error("Template not found");
  }

  const wheel = await prisma.wheel.create({
    data: {
      name,
      templateId,
      rings: {
        create: template.rings.map((ringDef) => ({
          order: ringDef.order,
          segmentCount: ringDef.segmentCount,
          contentType: ringDef.contentType,
          segments: {
            create: ringDef.defaultLabels.map((segDef) => ({
              index: segDef.index,
              label: segDef.defaultLabel ?? "",
              meaning: segDef.defaultMeaning,
            })),
          },
        })),
      },
    },
  });

  revalidatePath("/wheels");
  return { id: wheel.id };
}

const createBlankWheelInput = z.object({
  name: z.string().trim().min(1),
});

export async function createBlankWheel(input: z.infer<typeof createBlankWheelInput>) {
  const data = createBlankWheelInput.parse(input);
  const wheel = await prisma.wheel.create({ data: { name: data.name } });
  revalidatePath("/wheels");
  return { id: wheel.id };
}

export async function deleteWheel(wheelId: string) {
  await prisma.wheel.delete({ where: { id: wheelId } });
  revalidatePath("/wheels");
  redirect("/wheels");
}

export async function renameWheel(wheelId: string, name: string) {
  await prisma.wheel.update({ where: { id: wheelId }, data: { name } });
  revalidatePath(`/wheels/${wheelId}`);
  revalidatePath("/wheels");
}

export async function getWheels() {
  return prisma.wheel.findMany({
    orderBy: { createdAt: "desc" },
    include: { template: true, rings: true },
  });
}

export async function getWheel(wheelId: string) {
  return prisma.wheel.findUnique({
    where: { id: wheelId },
    include: {
      template: true,
      rings: {
        orderBy: { order: "asc" },
        include: { segments: { orderBy: { index: "asc" } } },
      },
      combinations: {
        orderBy: { createdAt: "desc" },
        include: {
          parts: { include: { segment: true, ring: true } },
        },
      },
    },
  });
}

const addRingInput = z.object({
  segmentCount: z.number().int().min(1).max(60),
  contentType: z.enum(ContentType),
  labels: z.array(z.string()).optional(),
});

export async function addRing(wheelId: string, input: z.infer<typeof addRingInput>) {
  const data = addRingInput.parse(input);
  const existingCount = await prisma.ring.count({ where: { wheelId } });
  const labels = generateLabels(data.contentType, data.segmentCount, data.labels);
  await prisma.ring.create({
    data: {
      wheelId,
      order: existingCount,
      segmentCount: data.segmentCount,
      contentType: data.contentType,
      segments: {
        create: labels.map((label, index) => ({ index, label })),
      },
    },
  });
  revalidatePath(`/wheels/${wheelId}`);
}

export async function removeRing(ringId: string) {
  const ring = await prisma.ring.delete({ where: { id: ringId } });
  revalidatePath(`/wheels/${ring.wheelId}`);
}
