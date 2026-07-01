"use client";

import { useMemo, useState } from "react";
import { ConcentricWheel } from "@/components/wheel/ConcentricWheel";
import { SegmentMeaningPanel } from "@/components/wheel/SegmentMeaningPanel";
import { CombinationAnnotator, type DraftPart } from "@/components/wheel/CombinationAnnotator";
import { RingEditor } from "@/components/wheel/RingEditor";
import { updateRingRotation } from "@/server/rings";
import { updateSegmentLabel, updateSegmentMeaning } from "@/server/segments";
import {
  createCombinationMeaning,
  deleteCombinationMeaning,
} from "@/server/combinations";
import { addRing, removeRing, renameWheel, deleteWheel } from "@/server/wheels";
import type { WheelData } from "@/lib/types";
import type { ContentType } from "@/generated/prisma/enums";

export function WheelEditor({ wheel }: { wheel: WheelData }) {
  const [selected, setSelected] = useState<{
    ringId: string;
    segmentIndex: number;
    segmentId: string;
  } | null>(null);
  const [draftParts, setDraftParts] = useState<Map<string, DraftPart>>(new Map());
  const [hoveredCombinationId, setHoveredCombinationId] = useState<string | null>(null);
  const [name, setName] = useState(wheel.name);

  const selectedRing = selected
    ? wheel.rings.find((r) => r.id === selected.ringId)
    : undefined;
  const selectedSegment = selectedRing?.segments.find((s) => s.id === selected?.segmentId);

  const selectedSegmentIds = useMemo(() => {
    const ids = new Set<string>();
    if (selected) ids.add(selected.segmentId);
    for (const part of draftParts.values()) ids.add(part.segmentId);
    return ids;
  }, [selected, draftParts]);

  const highlightedSegmentIds = useMemo(() => {
    if (!hoveredCombinationId) return undefined;
    const combo = wheel.combinations.find((c) => c.id === hoveredCombinationId);
    if (!combo) return undefined;
    return new Set(combo.parts.map((p) => p.segmentId));
  }, [hoveredCombinationId, wheel.combinations]);

  function handleSegmentClick(ringId: string, segmentIndex: number, segmentId: string) {
    setSelected({ ringId, segmentIndex, segmentId });
  }

  function handleAddToCombination() {
    if (!selected) return;
    const ring = wheel.rings.find((r) => r.id === selected.ringId);
    const segment = ring?.segments.find((s) => s.id === selected.segmentId);
    if (!ring || !segment) return;
    setDraftParts((prev) => {
      const next = new Map(prev);
      next.set(ring.id, {
        ringId: ring.id,
        segmentId: segment.id,
        segmentIndex: segment.index,
        label: segment.label,
      });
      return next;
    });
  }

  async function handleSaveCombination(meaning: string) {
    await createCombinationMeaning({
      wheelId: wheel.id,
      meaning,
      parts: [...draftParts.values()].map((p) => ({
        ringId: p.ringId,
        segmentId: p.segmentId,
      })),
    });
    setDraftParts(new Map());
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="mb-4 flex items-center gap-2">
          <input
            className="rounded border border-neutral-300 px-2 py-1 text-lg font-semibold"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              if (name.trim() && name !== wheel.name) renameWheel(wheel.id, name.trim());
            }}
          />
          <button
            className="ml-auto rounded border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
            onClick={() => {
              if (confirm(`Delete wheel "${wheel.name}"?`)) deleteWheel(wheel.id);
            }}
          >
            Delete wheel
          </button>
        </div>

        <ConcentricWheel
          rings={wheel.rings}
          combinations={wheel.combinations}
          selectedSegmentIds={selectedSegmentIds}
          highlightedSegmentIds={highlightedSegmentIds}
          onRotateEnd={(ringId, rotation) => updateRingRotation(ringId, rotation)}
          onSegmentClick={handleSegmentClick}
        />
      </div>

      <div className="space-y-4">
        {selectedRing && selectedSegment && (
          <SegmentMeaningPanel
            ring={selectedRing}
            segment={selectedSegment}
            onSaveLabel={(label) => updateSegmentLabel(selectedSegment.id, label)}
            onSaveMeaning={(meaning) =>
              updateSegmentMeaning(selectedSegment.id, meaning || null)
            }
            onAddToCombination={handleAddToCombination}
          />
        )}

        <CombinationAnnotator
          rings={wheel.rings}
          combinations={wheel.combinations}
          draftParts={draftParts}
          onRemoveDraftPart={(ringId) =>
            setDraftParts((prev) => {
              const next = new Map(prev);
              next.delete(ringId);
              return next;
            })
          }
          onClearDraft={() => setDraftParts(new Map())}
          onSaveDraft={handleSaveCombination}
          onHoverCombination={setHoveredCombinationId}
          onDeleteCombination={(id) => deleteCombinationMeaning(id)}
        />

        <RingEditor
          rings={wheel.rings}
          onAddRing={(input: {
            segmentCount: number;
            contentType: ContentType;
            labels?: string[];
          }) => addRing(wheel.id, input)}
          onRemoveRing={(ringId) => removeRing(ringId)}
        />
      </div>
    </div>
  );
}
