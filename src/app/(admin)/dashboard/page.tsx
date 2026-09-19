import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const [sites, workers, noSite, noDevice] = await Promise.all([
    prisma.site.count(),
    prisma.user.count({ where: { role: "WORKER", active: true } }),
    prisma.user.count({ where: { role: "WORKER", active: true, siteId: null } }),
    prisma.user.count({ where: { role: "WORKER", active: true, deviceId: null } }),
  ]);

  const rows = [
    { label: "Sites", value: sites, href: "/sites", action: "Manage sites" },
    { label: "Active workers", value: workers, href: "/workers", action: "Manage workers" },
    { label: "Workers without a site", value: noSite, href: "/workers?site=none", action: "Assign a site" },
    {
      label: "Workers who have not signed in on a phone yet",
      value: noDevice,
      href: "/workers",
      action: "View workers",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-4xl">Dashboard</h1>

      {sites === 0 && (
        <div className="panel flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <h2 className="text-xl">Add your first building site</h2>
            <p className="text-steel">Drop a pin on the map and choose how close workers must be to check in.</p>
          </div>
          <Link href="/sites/new" className="btn-primary">
            Add a site
          </Link>
        </div>
      )}

      <div className="panel divide-y divide-line">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-4">
            <div className="flex items-baseline gap-4">
              <span className="w-12 font-display text-3xl font-semibold tabular-nums">{r.value}</span>
              <span>{r.label}</span>
            </div>
            <Link href={r.href} className="text-sm font-medium underline underline-offset-4">
              {r.action}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
