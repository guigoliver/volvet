"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generateLabels } from "@/lib/wheel-content";
import { ContentType } from "@/generated/prisma/enums";

const ringDefInput = z.object({
  segmentCount: z.number().int().min(1).max(60),
  contentType: z.enum(ContentType),
  defaultLabels: z.array(z.string()).optional(),
});

const createTemplateInput = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  rings: z.array(ringDefInput).min(1),
});

export async function createTemplate(input: z.infer<typeof createTemplateInput>) {
  const data = createTemplateInput.parse(input);

  const template = await prisma.template.create({
    data: {
      name: data.name,
      description: data.description || null,
      rings: {
        create: data.rings.map((ring, order) => {
          const labels = generateLabels(
            ring.contentType,
            ring.segmentCount,
            ring.defaultLabels
          );
          return {
            order,
            segmentCount: ring.segmentCount,
            contentType: ring.contentType,
            defaultLabels: {
              create: labels.map((label, index) => ({
                index,
                defaultLabel: label,
              })),
            },
          };
        }),
      },
    },
  });

  revalidatePath("/templates");
  return { id: template.id };
}

const updateTemplateInput = z.object({
  templateId: z.string().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
});

export async function updateTemplate(templateId: string, formData: FormData) {
  const data = updateTemplateInput.parse({
    templateId,
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });
  await prisma.template.update({
    where: { id: data.templateId },
    data: { name: data.name, description: data.description || null },
  });
  revalidatePath("/templates");
  revalidatePath(`/templates/${data.templateId}`);
}

export async function deleteTemplate(templateId: string) {
  await prisma.template.delete({ where: { id: templateId } });
  revalidatePath("/templates");
}

export async function addTemplateRing(
  templateId: string,
  ring: z.infer<typeof ringDefInput>
) {
  const parsed = ringDefInput.parse(ring);
  const existingCount = await prisma.templateRingDef.count({
    where: { templateId },
  });
  const labels = generateLabels(
    parsed.contentType,
    parsed.segmentCount,
    parsed.defaultLabels
  );
  await prisma.templateRingDef.create({
    data: {
      templateId,
      order: existingCount,
      segmentCount: parsed.segmentCount,
      contentType: parsed.contentType,
      defaultLabels: {
        create: labels.map((label, index) => ({
          index,
          defaultLabel: label,
        })),
      },
    },
  });
  revalidatePath(`/templates/${templateId}`);
}

export async function removeTemplateRing(ringDefId: string) {
  const ringDef = await prisma.templateRingDef.delete({
    where: { id: ringDefId },
  });
  revalidatePath(`/templates/${ringDef.templateId}`);
}

export async function updateTemplateSegmentLabel(
  segmentDefId: string,
  defaultLabel: string,
  defaultMeaning?: string
) {
  const segmentDef = await prisma.templateSegmentDef.update({
    where: { id: segmentDefId },
    data: { defaultLabel, defaultMeaning: defaultMeaning || null },
    include: { ringDef: true },
  });
  revalidatePath(`/templates/${segmentDef.ringDef.templateId}`);
}

export async function getTemplates() {
  return prisma.template.findMany({
    orderBy: { createdAt: "desc" },
    include: { rings: { orderBy: { order: "asc" } } },
  });
}

export async function getTemplate(templateId: string) {
  return prisma.template.findUnique({
    where: { id: templateId },
    include: {
      rings: {
        orderBy: { order: "asc" },
        include: { defaultLabels: { orderBy: { index: "asc" } } },
      },
    },
  });
}
