import { notFound } from "next/navigation";
import { getTemplate, removeTemplateRing, updateTemplate } from "@/server/templates";
import { AddTemplateRingForm } from "@/components/template/AddTemplateRingForm";
import { TemplateSegmentRow } from "@/components/template/TemplateSegmentRow";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const template = await getTemplate(templateId);
  if (!template) notFound();

  return (
    <div className="max-w-3xl space-y-8">
      <form action={updateTemplate.bind(null, template.id)} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            name="name"
            defaultValue={template.name}
            className="mt-1 w-full max-w-md rounded border border-neutral-300 px-2 py-1 text-2xl font-bold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            defaultValue={template.description ?? ""}
            rows={2}
            className="mt-1 w-full max-w-md rounded border border-neutral-300 px-2 py-1"
          />
        </div>
        <button className="rounded bg-neutral-900 px-3 py-1 text-sm text-white">
          Save
        </button>
      </form>

      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Rings</h2>
        {template.rings.map((ring) => (
          <div key={ring.id} className="rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                Ring {ring.order + 1} — {ring.segmentCount} portions ({ring.contentType})
              </h3>
              <form action={removeTemplateRing.bind(null, ring.id)}>
                <button className="text-sm text-neutral-400 hover:text-red-600">
                  Remove ring
                </button>
              </form>
            </div>
            <table className="mt-3 w-full">
              <thead>
                <tr className="text-left text-xs uppercase text-neutral-400">
                  <th className="pb-1">#</th>
                  <th className="pb-1">Label</th>
                  <th className="pb-1">Default meaning</th>
                  <th className="pb-1"></th>
                </tr>
              </thead>
              <tbody>
                {ring.defaultLabels.map((segDef) => (
                  <TemplateSegmentRow
                    key={segDef.id}
                    segmentDefId={segDef.id}
                    index={segDef.index}
                    defaultLabel={segDef.defaultLabel}
                    defaultMeaning={segDef.defaultMeaning}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <div className="rounded-lg border border-neutral-200 p-4">
          <h3 className="mb-2 text-sm font-semibold text-neutral-500">Add ring</h3>
          <AddTemplateRingForm templateId={template.id} />
        </div>
      </div>
    </div>
  );
}
