"use client";

import { useState } from "react";
import { ContentType } from "@/generated/prisma/enums";
import { addTemplateRing } from "@/server/templates";

type ContentTypeValue = (typeof ContentType)[keyof typeof ContentType];

export function AddTemplateRingForm({ templateId }: { templateId: string }) {
  const [segmentCount, setSegmentCount] = useState(6);
  const [contentType, setContentType] = useState<ContentTypeValue>(ContentType.CUSTOM);
  const [labelsText, setLabelsText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addTemplateRing(templateId, {
        segmentCount,
        contentType,
        defaultLabels:
          contentType === ContentType.CUSTOM
            ? labelsText.split(",").map((l) => l.trim()).filter(Boolean)
            : undefined,
      });
      setLabelsText("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
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
        onChange={(e) => setContentType(e.target.value as ContentTypeValue)}
      >
        <option value={ContentType.ALPHABET}>Alphabet</option>
        <option value={ContentType.NUMERIC}>Numeric</option>
        <option value={ContentType.CUSTOM}>Custom</option>
        <option value={ContentType.BLANK}>Blank</option>
      </select>
      {contentType === ContentType.CUSTOM && (
        <input
          className="min-w-[200px] flex-1 rounded border border-neutral-300 px-2 py-1 text-sm"
          placeholder="Comma-separated labels"
          value={labelsText}
          onChange={(e) => setLabelsText(e.target.value)}
        />
      )}
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-neutral-900 px-3 py-1 text-sm text-white disabled:opacity-40"
      >
        Add ring
      </button>
    </form>
  );
}
