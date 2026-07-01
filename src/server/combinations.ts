"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";

const combinationInput = z.object({
  wheelId: z.string().min(1),
  meaning: z.string().trim().min(1),
  parts: z
    .array(
      z.object({
        ringId: z.string().min(1),
        segmentId: z.string().min(1),
      })
    )
    .min(1),
});

export async function createCombinationMeaning(
  input: z.infer<typeof combinationInput>
) {
  const data = combinationInput.parse(input);
  const combination = await prisma.combinationMeaning.create({
    data: {
      wheelId: data.wheelId,
      meaning: data.meaning,
      parts: {
        create: data.parts.map((part) => ({
          ringId: part.ringId,
          segmentId: part.segmentId,
        })),
      },
    },
  });
  revalidatePath(`/wheels/${data.wheelId}`);
  return { id: combination.id };
}

export async function updateCombinationMeaning(
  combinationMeaningId: string,
  meaning: string
) {
  const combination = await prisma.combinationMeaning.update({
    where: { id: combinationMeaningId },
    data: { meaning },
  });
  revalidatePath(`/wheels/${combination.wheelId}`);
}

export async function deleteCombinationMeaning(combinationMeaningId: string) {
  const combination = await prisma.combinationMeaning.delete({
    where: { id: combinationMeaningId },
  });
  revalidatePath(`/wheels/${combination.wheelId}`);
}
