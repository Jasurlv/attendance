import { prisma } from "@/lib/db";
import { createWorker } from "../actions";
import { WorkerForm } from "../worker-form";

export default async function NewWorkerPage({ searchParams }: { searchParams: Promise<{ site?: string }> }) {
  const { site } = await searchParams;
  const sites = await prisma.site.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div className="space-y-6">
      <h1 className="text-4xl">Add a worker</h1>
      <WorkerForm
        action={createWorker}
        sites={sites}
        withPassword
        submitLabel="Save worker"
        defaults={{ name: "", username: "", siteId: sites.some((s) => s.id === site) ? site! : "", hourlyWage: "0" }}
      />
    </div>
  );
}
