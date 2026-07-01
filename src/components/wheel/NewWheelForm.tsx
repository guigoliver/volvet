"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBlankWheel, createWheelFromTemplate } from "@/server/wheels";

type TemplateOption = { id: string; name: string };

export function NewWheelForm({ templates }: { templates: TemplateOption[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { id } = templateId
        ? await createWheelFromTemplate(templateId, name)
        : await createBlankWheel({ name });
      router.push(`/wheels/${id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          required
          className="mt-1 w-full rounded border border-neutral-300 px-2 py-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Template</label>
        <select
          className="mt-1 w-full rounded border border-neutral-300 px-2 py-1"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
        >
          <option value="">Blank wheel (no rings)</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-40"
      >
        {submitting ? "Creating…" : "Create wheel"}
      </button>
    </form>
  );
}
