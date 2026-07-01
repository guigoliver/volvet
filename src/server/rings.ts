"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function updateRingRotation(ringId: string, rotationDegrees: number) {
  const normalized = ((rotationDegrees % 360) + 360) % 360;
  const ring = await prisma.ring.update({
    where: { id: ringId },
    data: { rotationDegrees: normalized },
  });
  revalidatePath(`/wheels/${ring.wheelId}`);
}
