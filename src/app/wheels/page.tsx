import Link from "next/link";
import { getWheels } from "@/server/wheels";

export default async function WheelsPage() {
  const wheels = await getWheels();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Wheels</h1>
        <Link href="/wheels/new" className="rounded bg-neutral-900 px-4 py-2 text-sm text-white">
          New wheel
        </Link>
      </div>

      {wheels.length === 0 ? (
        <p className="text-neutral-500">No wheels yet.</p>
      ) : (
        <ul className="space-y-3">
          {wheels.map((wheel) => (
            <li key={wheel.id} className="rounded-lg border border-neutral-200 p-4">
              <Link href={`/wheels/${wheel.id}`} className="font-semibold hover:underline">
                {wheel.name}
              </Link>
              <p className="text-sm text-neutral-500">
                {wheel.rings.length} ring{wheel.rings.length === 1 ? "" : "s"}
                {wheel.template ? ` — from template "${wheel.template.name}"` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
