"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ContentType } from "@/generated/prisma/enums";
import { createTemplate } from "@/server/templates";

type ContentTypeValue = (typeof ContentType)[keyof typeof ContentType];

type RingRow = {
  segmentCount: number;
  contentType: ContentTypeValue;
  labelsText: string;
};

function emptyRow(): RingRow {
  return { segmentCount: 6, contentType: ContentType.CUSTOM, labelsText: "" };
}

export function CreateTemplateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rings, setRings] = useState<RingRow[]>([emptyRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRing(index: number, patch: Partial<RingRow>) {
    setRings((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { id } = await createTemplate({
        name,
        description: description || undefined,
        rings: rings.map((r) => ({
          segmentCount: r.segmentCount,
          contentType: r.contentType,
          defaultLabels:
            r.contentType === ContentType.CUSTOM
              ? r.labelsText.split(",").map((l) => l.trim()).filter(Boolean)
              : undefined,
        })),
      });
      router.push(`/templates/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create template");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          required
          className="mt-1 w-full max-w-md rounded border border-neutral-300 px-2 py-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          className="mt-1 w-full max-w-md rounded border border-neutral-300 px-2 py-1"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-neutral-500">Rings</h2>
        <p className="text-xs text-neutral-400">
          Ring 1 will be the innermost. Add one ring per concentric circle.
        </p>
        <div className="mt-2 space-y-3">
          {rings.map((ring, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded border border-neutral-200 p-3">
              <span className="text-sm font-medium">Ring {i + 1}</span>
              <input
                type="number"
                min={1}
                max={60}
                className="w-20 rounded border border-neutral-300 px-2 py-1 text-sm"
                value={ring.segmentCount}
                onChange={(e) => updateRing(i, { segmentCount: Number(e.target.value) })}
              />
              <select
                className="rounded border border-neutral-300 px-2 py-1 text-sm"
                value={ring.contentType}
                onChange={(e) =>
                  updateRing(i, { contentType: e.target.value as ContentTypeValue })
                }
              >
                <option value={ContentType.ALPHABET}>Alphabet</option>
                <option value={ContentType.NUMERIC}>Numeric</option>
                <option value={ContentType.CUSTOM}>Custom</option>
                <option value={ContentType.BLANK}>Blank</option>
              </select>
              {ring.contentType === ContentType.CUSTOM && (
                <input
                  className="min-w-[200px] flex-1 rounded border border-neutral-300 px-2 py-1 text-sm"
                  placeholder="Comma-separated labels"
                  value={ring.labelsText}
                  onChange={(e) => updateRing(i, { labelsText: e.target.value })}
                />
              )}
              {rings.length > 1 && (
                <button
                  type="button"
                  className="text-neutral-400 hover:text-red-600"
                  onClick={() => setRings((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-2 rounded border border-neutral-300 px-3 py-1 text-sm"
          onClick={() => setRings((prev) => [...prev, emptyRow()])}
        >
          + Add ring
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-40"
      >
        {submitting ? "Creating…" : "Create template"}
      </button>
    </form>
  );
}
