"use client";

import { useState } from "react";
import { ContentType } from "@/generated/prisma/enums";
import type { RingData } from "@/lib/types";

interface RingEditorProps {
  rings: RingData[];
  onAddRing: (input: {
    segmentCount: number;
    contentType: (typeof ContentType)[keyof typeof ContentType];
    labels?: string[];
  }) => void;
  onRemoveRing: (ringId: string) => void;
}

export function RingEditor({ rings, onAddRing, onRemoveRing }: RingEditorProps) {
  const [segmentCount, setSegmentCount] = useState(6);
  const [contentType, setContentType] = useState<
    (typeof ContentType)[keyof typeof ContentType]
  >(ContentType.CUSTOM);
  const [labelsText, setLabelsText] = useState("");

  function handleAdd() {
    const labels =
      contentType === ContentType.CUSTOM
        ? labelsText
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean)
        : undefined;
    onAddRing({ segmentCount, contentType, labels });
    setLabelsText("");
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <h3 className="text-sm font-semibold text-neutral-500">Rings</h3>
      <ul className="mt-2 space-y-1">
        {[...rings]
          .sort((a, b) => a.order - b.order)
          .map((ring) => (
            <li key={ring.id} className="flex items-center justify-between text-sm">
              <span>
                Ring {ring.order + 1} — {ring.segmentCount} portions ({ring.contentType})
              </span>
              <button
                className="text-neutral-400 hover:text-red-600"
                onClick={() => onRemoveRing(ring.id)}
              >
                Remove
              </button>
            </li>
          ))}
      </ul>

      <div className="mt-4 space-y-2 border-t border-neutral-200 pt-3">
        <p className="text-xs uppercase text-neutral-400">Add ring</p>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            max={60}
            className="w-20 rounded border border-neutral-300 px-2 py-1 text-sm"
            value={segmentCount}
            onChange={(e) => setSegmentCount(Number(e.target.value))}
          />
          <select
            className="rounded border border-neutral-300 px-2 py-1 text-sm"
            value={contentType}
            onChange={(e) =>
              setContentType(e.target.value as (typeof ContentType)[keyof typeof ContentType])
            }
          >
            <option value={ContentType.ALPHABET}>Alphabet</option>
            <option value={ContentType.NUMERIC}>Numeric</option>
            <option value={ContentType.CUSTOM}>Custom</option>
            <option value={ContentType.BLANK}>Blank</option>
          </select>
        </div>
        {contentType === ContentType.CUSTOM && (
          <input
            className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
            placeholder="Comma-separated labels"
            value={labelsText}
            onChange={(e) => setLabelsText(e.target.value)}
          />
        )}
        <button
          className="rounded bg-neutral-900 px-3 py-1 text-sm text-white"
          onClick={handleAdd}
        >
          Add ring
        </button>
      </div>
    </div>
  );
}
