import Link from "next/link";
import { getTemplates, deleteTemplate } from "@/server/templates";

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Templates</h1>
        <Link
          href="/templates/new"
          className="rounded bg-neutral-900 px-4 py-2 text-sm text-white"
        >
          New template
        </Link>
      </div>

      {templates.length === 0 ? (
        <p className="text-neutral-500">No templates yet.</p>
      ) : (
        <ul className="space-y-3">
          {templates.map((template) => (
            <li
              key={template.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 p-4"
            >
              <div>
                <Link href={`/templates/${template.id}`} className="font-semibold hover:underline">
                  {template.name}
                </Link>
                <p className="text-sm text-neutral-500">
                  {template.rings.length} ring{template.rings.length === 1 ? "" : "s"} —{" "}
                  {template.rings.map((r) => r.segmentCount).join(" / ")} portions
                </p>
                {template.description && (
                  <p className="mt-1 text-sm text-neutral-600">{template.description}</p>
                )}
              </div>
              <form action={deleteTemplate.bind(null, template.id)}>
                <button className="text-sm text-neutral-400 hover:text-red-600">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
