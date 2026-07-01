"use client";

import { useState } from "react";
import { updateTemplateSegmentLabel } from "@/server/templates";

interface TemplateSegmentRowProps {
  segmentDefId: string;
  index: number;
  defaultLabel: string | null;
  defaultMeaning: string | null;
}

export function TemplateSegmentRow({
  segmentDefId,
  index,
  defaultLabel,
  defaultMeaning,
}: TemplateSegmentRowProps) {
  const [label, setLabel] = useState(defaultLabel ?? "");
  const [meaning, setMeaning] = useState(defaultMeaning ?? "");
  const dirty = label !== (defaultLabel ?? "") || meaning !== (defaultMeaning ?? "");

  return (
    <tr className="border-b border-neutral-100">
      <td className="py-1 pr-2 text-sm text-neutral-400">{index + 1}</td>
      <td className="py-1 pr-2">
        <input
          className="w-24 rounded border border-neutral-300 px-1 py-0.5 text-sm"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </td>
      <td className="py-1 pr-2">
        <input
          className="w-full rounded border border-neutral-300 px-1 py-0.5 text-sm"
          placeholder="Default meaning (optional)"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
        />
      </td>
      <td className="py-1">
        <button
          className="rounded bg-neutral-900 px-2 py-0.5 text-xs text-white disabled:opacity-40"
          disabled={!dirty}
          onClick={() => updateTemplateSegmentLabel(segmentDefId, label, meaning || undefined)}
        >
          Save
        </button>
      </td>
    </tr>
  );
}
