import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ActionButton } from "@/components/action-button";
import { deleteSite, updateSite } from "../actions";
import { SiteForm } from "../site-form";

export default async function EditSitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const site = await prisma.site.findUnique({
    where: { id },
    include: { _count: { select: { workers: true } } },
  });
  if (!site) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl">{site.name}</h1>
        <p className="text-steel">
          <Link href={`/workers?site=${site.id}`} className="underline underline-offset-4">
            {site._count.workers} worker{site._count.workers === 1 ? "" : "s"}
          </Link>{" "}
          assigned to this site
        </p>
      </div>

      <SiteForm
        action={updateSite.bind(null, site.id)}
        submitLabel="Save changes"
        defaults={{
          name: site.name,
          latitude: String(site.latitude),
          longitude: String(site.longitude),
          radiusM: String(site.radiusM),
          timezone: site.timezone,
          startTime: site.startTime,
          lunchFrom: site.lunchFrom,
          lunchTo: site.lunchTo,
          endTime: site.endTime,
          graceMinutes: String(site.graceMinutes),
        }}
      />

      <section className="panel max-w-xl space-y-2 p-5">
        <h2 className="text-xl">Delete this site</h2>
        <p className="text-steel">You can only delete a site that has no workers assigned.</p>
        <ActionButton
          action={deleteSite.bind(null, site.id)}
          confirmText={`Delete "${site.name}"? This cannot be undone.`}
          className="btn-danger"
        >
          Delete site
        </ActionButton>
      </section>
    </div>
  );
}
