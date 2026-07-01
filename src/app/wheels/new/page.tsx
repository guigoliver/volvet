import { getTemplates } from "@/server/templates";
import { NewWheelForm } from "@/components/wheel/NewWheelForm";

export default async function NewWheelPage() {
  const templates = await getTemplates();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New wheel</h1>
      <NewWheelForm templates={templates.map((t) => ({ id: t.id, name: t.name }))} />
    </div>
  );
}
