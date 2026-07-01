"use client";

import { useEffect, useState } from "react";
import type { RingData, SegmentData } from "@/lib/types";

interface SegmentMeaningPanelProps {
  ring: RingData;
  segment: SegmentData;
  onSaveLabel: (label: string) => void;
  onSaveMeaning: (meaning: string) => void;
  onAddToCombination: () => void;
}

export function SegmentMeaningPanel({
  ring,
  segment,
  onSaveLabel,
  onSaveMeaning,
  onAddToCombination,
}: SegmentMeaningPanelProps) {
  const [label, setLabel] = useState(segment.label);
  const [meaning, setMeaning] = useState(segment.meaning ?? "");

  useEffect(() => {
    setLabel(segment.label);
    setMeaning(segment.meaning ?? "");
  }, [segment.id, segment.label, segment.meaning]);

  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <h3 className="text-sm font-semibold text-neutral-500">
        Ring {ring.order + 1}, portion {segment.index + 1}
      </h3>

      <label className="mt-3 block text-sm font-medium">Label</label>
      <div className="mt-1 flex gap-2">
        <input
          className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <button
          className="rounded bg-neutral-900 px-3 py-1 text-sm text-white disabled:opacity-40"
          disabled={label === segment.label}
          onClick={() => onSaveLabel(label)}
        >
          Save
        </button>
      </div>

      <label className="mt-3 block text-sm font-medium">Meaning</label>
      <div className="mt-1 flex gap-2">
        <textarea
          className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
          rows={3}
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
        />
      </div>
      <button
        className="mt-2 rounded bg-neutral-900 px-3 py-1 text-sm text-white disabled:opacity-40"
        disabled={meaning === (segment.meaning ?? "")}
        onClick={() => onSaveMeaning(meaning)}
      >
        Save meaning
      </button>

      <button
        className="mt-4 w-full rounded border border-amber-500 px-3 py-1 text-sm text-amber-700 hover:bg-amber-50"
        onClick={onAddToCombination}
      >
        + Add to combination
      </button>
    </div>
  );
}
