"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { ActionState } from "@/lib/action-state";
import { hhmm, invalid, num, timezone } from "@/lib/validation";

const siteSchema = z
  .object({
    name: z.string().trim().min(2, "Enter a site name").max(80, "Keep the name under 80 characters"),
    latitude: num("Pick a point on the map or enter a latitude (-90 to 90)", -90, 90),
    longitude: num("Pick a point on the map or enter a longitude (-180 to 180)", -180, 180),
    radiusM: num("Enter a distance between 10 and 1000 metres", 10, 1000, true),
    timezone,
    startTime: hhmm,
    lunchFrom: hhmm,
    lunchTo: hhmm,
    endTime: hhmm,
    graceMinutes: num("Enter 0 to 60 minutes", 0, 60, true),
  })
  .superRefine((v, ctx) => {
    // "HH:MM" strings compare correctly as text.
    if (v.lunchFrom <= v.startTime)
      ctx.addIssue({ code: "custom", path: ["lunchFrom"], message: "Lunch must start after work starts" });
    if (v.lunchTo <= v.lunchFrom)
      ctx.addIssue({ code: "custom", path: ["lunchTo"], message: "Lunch must end after it starts" });
    if (v.endTime <= v.lunchTo)
      ctx.addIssue({ code: "custom", path: ["endTime"], message: "Work must end after lunch" });
  });

export async function createSite(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = siteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);

  await prisma.site.create({ data: parsed.data });
  revalidatePath("/sites");
  redirect("/sites");
}

export async function updateSite(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = siteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);

  const exists = await prisma.site.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return { error: "This site no longer exists." };

  await prisma.site.update({ where: { id }, data: parsed.data });
  revalidatePath("/sites");
  redirect("/sites");
}

export async function deleteSite(id: string, _prev: ActionState, _formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const workers = await prisma.user.count({ where: { siteId: id } });
  if (workers > 0) {
    return {
      error: `${workers} worker${workers === 1 ? " is" : "s are"} still assigned to this site. Move them to another site first.`,
    };
  }
  await prisma.site.delete({ where: { id } });
  revalidatePath("/sites");
  redirect("/sites");
}
