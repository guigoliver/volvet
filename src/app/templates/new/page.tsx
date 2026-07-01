import { CreateTemplateForm } from "@/components/template/CreateTemplateForm";

export default function NewTemplatePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">New template</h1>
      <CreateTemplateForm />
    </div>
  );
}
