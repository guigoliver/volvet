"use client";

import { useState } from "react";
import type { CombinationData, RingData } from "@/lib/types";

export type DraftPart = {
  ringId: string;
  segmentId: string;
  segmentIndex: number;
  label: string;
};

interface CombinationAnnotatorProps {
  rings: RingData[];
  combinations: CombinationData[];
  draftParts: Map<string, DraftPart>;
  onRemoveDraftPart: (ringId: string) => void;
  onClearDraft: () => void;
  onSaveDraft: (meaning: string) => void;
  onHoverCombination: (combinationId: string | null) => void;
  onDeleteCombination: (combinationId: string) => void;
}

export function CombinationAnnotator({
  rings,
  combinations,
  draftParts,
  onRemoveDraftPart,
  onClearDraft,
  onSaveDraft,
  onHoverCombination,
  onDeleteCombination,
}: CombinationAnnotatorProps) {
  const [meaning, setMeaning] = useState("");

  function ringLabel(ringId: string) {
    const ring = rings.find((r) => r.id === ringId);
    return ring ? `Ring ${ring.order + 1}` : "Ring";
  }

  function describeCombination(combo: CombinationData) {
    return combo.parts
      .map((part) => {
        const ring = rings.find((r) => r.id === part.ringId);
        const segment = ring?.segments.find((s) => s.id === part.segmentId);
        return segment?.label ?? "?";
      })
      .join(" + ");
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <h3 className="text-sm font-semibold text-neutral-500">Combination meanings</h3>

      <div className="mt-3">
        <p className="text-xs uppercase text-neutral-400">Building</p>
        {draftParts.size === 0 ? (
          <p className="mt-1 text-sm text-neutral-400">
            Click segments and use &ldquo;Add to combination&rdquo; to build one.
          </p>
        ) : (
          <ul className="mt-1 space-y-1">
            {[...draftParts.values()].map((part) => (
              <li
                key={part.ringId}
                className="flex items-center justify-between rounded bg-neutral-100 px-2 py-1 text-sm"
              >
                <span>
                  {ringLabel(part.ringId)}: {part.label}
                </span>
                <button
                  className="text-neutral-400 hover:text-red-600"
                  onClick={() => onRemoveDraftPart(part.ringId)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        {draftParts.size > 0 && (
          <div className="mt-2">
            <textarea
              className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
              rows={2}
              placeholder="What does this combination mean?"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
            />
            <div className="mt-2 flex gap-2">
              <button
                className="rounded bg-amber-600 px-3 py-1 text-sm text-white disabled:opacity-40"
                disabled={!meaning.trim()}
                onClick={() => {
                  onSaveDraft(meaning.trim());
                  setMeaning("");
                }}
              >
                Save combination
              </button>
              <button
                className="rounded border border-neutral-300 px-3 py-1 text-sm"
                onClick={onClearDraft}
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs uppercase text-neutral-400">Saved combinations</p>
        {combinations.length === 0 ? (
          <p className="mt-1 text-sm text-neutral-400">None yet.</p>
        ) : (
          <ul className="mt-1 space-y-1">
            {combinations.map((combo) => (
              <li
                key={combo.id}
                className="rounded border border-neutral-200 px-2 py-1 text-sm"
                onMouseEnter={() => onHoverCombination(combo.id)}
                onMouseLeave={() => onHoverCombination(null)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{describeCombination(combo)}</span>
                  <button
                    className="text-neutral-400 hover:text-red-600"
                    onClick={() => onDeleteCombination(combo.id)}
                  >
                    ✕
                  </button>
                </div>
                <p className="text-neutral-600">{combo.meaning}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
