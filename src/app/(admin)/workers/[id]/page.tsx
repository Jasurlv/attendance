import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ActionButton } from "@/components/action-button";
import { resetDevice, setWorkerActive, setWorkerPassword, updateWorker } from "../actions";
import { ResetPasswordForm } from "../reset-password-form";
import { WorkerForm } from "../worker-form";

export default async function EditWorkerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [worker, sites] = await Promise.all([
    prisma.user.findFirst({ where: { id, role: "WORKER" } }),
    prisma.site.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!worker) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl">{worker.name}</h1>
        <p className="text-steel">{worker.active ? "Active" : "Inactive: cannot sign in"}</p>
      </div>

      <WorkerForm
        action={updateWorker.bind(null, worker.id)}
        sites={sites}
        withPassword={false}
        submitLabel="Save changes"
        defaults={{
          name: worker.name,
          username: worker.username,
          siteId: worker.siteId ?? "",
          hourlyWage: String(worker.hourlyWage),
        }}
      />

      <div className="grid max-w-4xl gap-6 md:grid-cols-2">
        <section className="panel space-y-3 p-5">
          <h2 className="text-xl">Password</h2>
          <ResetPasswordForm action={setWorkerPassword.bind(null, worker.id)} />
        </section>

        <div className="space-y-6">
          <section className="panel space-y-2 p-5">
            <h2 className="text-xl">Phone</h2>
            <p className="text-steel">
              {worker.deviceId
                ? "This worker is linked to one phone. Unlink it when they get a new phone; the next sign-in links the new one."
                : "No phone linked yet. The first phone they sign in on will be linked."}
            </p>
            {worker.deviceId && (
              <ActionButton
                action={resetDevice.bind(null, worker.id)}
                confirmText="Unlink this worker's phone?"
              >
                Unlink phone
              </ActionButton>
            )}
          </section>

          <section className="panel space-y-2 p-5">
            <h2 className="text-xl">Access</h2>
            <p className="text-steel">
              {worker.active
                ? "Deactivate a worker who has left. Their attendance history is kept."
                : "This worker is deactivated and cannot sign in."}
            </p>
            <ActionButton
              action={setWorkerActive.bind(null, worker.id, !worker.active)}
              confirmText={worker.active ? `Deactivate ${worker.name}?` : undefined}
              className={worker.active ? "btn-danger" : "btn-primary"}
            >
              {worker.active ? "Deactivate worker" : "Reactivate worker"}
            </ActionButton>
          </section>
        </div>
      </div>
    </div>
  );
}
