"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function updateSegmentLabel(segmentId: string, label: string) {
  const segment = await prisma.segment.update({
    where: { id: segmentId },
    data: { label },
    include: { ring: true },
  });
  revalidatePath(`/wheels/${segment.ring.wheelId}`);
}

export async function updateSegmentMeaning(
  segmentId: string,
  meaning: string | null
) {
  const segment = await prisma.segment.update({
    where: { id: segmentId },
    data: { meaning: meaning || null },
    include: { ring: true },
  });
  revalidatePath(`/wheels/${segment.ring.wheelId}`);
}
