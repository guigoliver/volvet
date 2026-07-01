import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Volvet</h1>
        <p className="mt-2 max-w-prose text-neutral-600">
          Build and maintain volvelles — the concentric rotating wheels used as
          mnemonic and combinatorial devices by figures like Ramon Llull and
          Giordano Bruno. Define reusable templates, then create specific
          wheels with meanings for each portion and for chosen combinations.
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          href="/templates"
          className="rounded-lg border border-neutral-200 p-4 hover:border-neutral-400"
        >
          <h2 className="font-semibold">Templates</h2>
          <p className="text-sm text-neutral-600">
            Define the structure of a wheel: how many rings, how many portions
            each, and what kind of content they hold.
          </p>
        </Link>
        <Link
          href="/wheels"
          className="rounded-lg border border-neutral-200 p-4 hover:border-neutral-400"
        >
          <h2 className="font-semibold">Wheels</h2>
          <p className="text-sm text-neutral-600">
            Create specific wheels from a template (or from scratch), fill in
            content, and rotate them to explore combinations.
          </p>
        </Link>
      </div>
    </div>
  );
}
