import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

type SearchParams = Promise<{ site?: string; q?: string }>;

export default async function WorkersPage({ searchParams }: { searchParams: SearchParams }) {
  const { site, q } = await searchParams;

  const where: Prisma.UserWhereInput = { role: "WORKER" };
  if (site === "none") where.siteId = null;
  else if (site) where.siteId = site;
  if (q?.trim()) {
    where.OR = [
      { name: { contains: q.trim(), mode: "insensitive" } },
      { username: { contains: q.trim(), mode: "insensitive" } },
    ];
  }

  const [sites, workers, total] = await Promise.all([
    prisma.site.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.user.findMany({
      where,
      orderBy: { name: "asc" },
      include: { site: { select: { name: true } } },
      take: 500,
    }),
    prisma.user.count({ where: { role: "WORKER" } }),
  ]);

  const filtered = Boolean(site || q?.trim());

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl">Workers</h1>
        <Link href="/workers/new" className="btn-primary">
          Add a worker
        </Link>
      </div>

      {total > 0 && (
        <form className="flex flex-wrap items-end gap-3" role="search">
          <div>
            <label htmlFor="q" className="label">
              Search
            </label>
            <input id="q" name="q" defaultValue={q ?? ""} className="input w-56" placeholder="Name or username" />
          </div>
          <div>
            <label htmlFor="site" className="label">
              Site
            </label>
            <select id="site" name="site" defaultValue={site ?? ""} className="input w-56">
              <option value="">All sites</option>
              <option value="none">No site</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn-secondary">Filter</button>
          {filtered && (
            <Link href="/workers" className="py-2 text-sm font-medium underline underline-offset-4">
              Clear filter
            </Link>
          )}
        </form>
      )}

      {total === 0 ? (
        <div className="panel p-8 text-center">
          <h2 className="text-2xl">No workers yet</h2>
          <p className="mx-auto mb-4 mt-1 max-w-md text-steel">
            {sites.length === 0
              ? "Add a site first, then add the workers who check in there."
              : "Add each worker with a username and password. They use these to sign in to the phone app."}
          </p>
          <Link href={sites.length === 0 ? "/sites/new" : "/workers/new"} className="btn-primary">
            {sites.length === 0 ? "Add a site" : "Add your first worker"}
          </Link>
        </div>
      ) : workers.length === 0 ? (
        <p className="panel p-6 text-steel">No workers match this filter.</p>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[46rem]">
            <thead className="border-b border-line">
              <tr>
                <th className="th">Name</th>
                <th className="th">Username</th>
                <th className="th">Site</th>
                <th className="th">Hourly wage</th>
                <th className="th">Phone</th>
                <th className="th">Status</th>
                <th className="th" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {workers.map((w) => (
                <tr key={w.id} className={w.active ? "" : "text-steel"}>
                  <td className="td font-medium">{w.name}</td>
                  <td className="td font-mono text-sm">{w.username}</td>
                  <td className="td">{w.site?.name ?? <span className="text-steel">None</span>}</td>
                  <td className="td tabular-nums">{w.hourlyWage.toFixed(2)}</td>
                  <td className="td">{w.deviceId ? "Linked" : "Not linked"}</td>
                  <td className="td">{w.active ? "Active" : "Inactive"}</td>
                  <td className="td text-right">
                    <Link href={`/workers/${w.id}`} className="font-medium underline underline-offset-4">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {workers.length === 500 && (
        <p className="text-sm text-steel">Showing the first 500 workers. Use search to narrow the list.</p>
      )}
    </div>
  );
}
