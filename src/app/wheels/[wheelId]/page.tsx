import { notFound } from "next/navigation";
import { getWheel } from "@/server/wheels";
import { WheelEditor } from "@/components/wheel/WheelEditor";

export default async function WheelDetailPage({
  params,
}: {
  params: Promise<{ wheelId: string }>;
}) {
  const { wheelId } = await params;
  const wheel = await getWheel(wheelId);
  if (!wheel) notFound();

  return <WheelEditor wheel={wheel} />;
}
