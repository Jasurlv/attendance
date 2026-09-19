import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function SitesPage() {
  const sites = await prisma.site.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { workers: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl">Sites</h1>
        <Link href="/sites/new" className="btn-primary">
          Add a site
        </Link>
      </div>

      {sites.length === 0 ? (
        <div className="panel p-8 text-center">
          <h2 className="text-2xl">No sites yet</h2>
          <p className="mx-auto mb-4 mt-1 max-w-md text-steel">
            Add each building you run. Workers can only check in when they are inside the site&apos;s radius.
          </p>
          <Link href="/sites/new" className="btn-primary">
            Add your first site
          </Link>
        </div>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[40rem]">
            <thead className="border-b border-line">
              <tr>
                <th className="th">Site</th>
                <th className="th">Radius</th>
                <th className="th">Hours</th>
                <th className="th">Lunch</th>
                <th className="th">Workers</th>
                <th className="th" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sites.map((s) => (
                <tr key={s.id}>
                  <td className="td font-medium">{s.name}</td>
                  <td className="td tabular-nums">{s.radiusM} m</td>
                  <td className="td tabular-nums">
                    {s.startTime}–{s.endTime}
                  </td>
                  <td className="td tabular-nums">
                    {s.lunchFrom}–{s.lunchTo}
                  </td>
                  <td className="td tabular-nums">
                    <Link href={`/workers?site=${s.id}`} className="underline underline-offset-4">
                      {s._count.workers}
                    </Link>
                  </td>
                  <td className="td text-right">
                    <Link href={`/sites/${s.id}`} className="font-medium underline underline-offset-4">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
