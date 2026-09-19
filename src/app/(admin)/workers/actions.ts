"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { ActionState } from "@/lib/action-state";
import { invalid, num } from "@/lib/validation";

const password = z
  .string()
  .min(6, "Use at least 6 characters")
  .max(72, "Use at most 72 characters"); // bcrypt only reads the first 72 bytes

const profile = {
  name: z.string().trim().min(2, "Enter the worker's name").max(80, "Keep the name under 80 characters"),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9._-]{3,30}$/, "3 to 30 characters: letters, numbers, dot, dash or underscore"),
  siteId: z.preprocess((v) => (v === "" || v == null ? null : v), z.string().nullable()),
  hourlyWage: num("Enter the hourly wage (0 or more)", 0, 100000),
};

const createSchema = z.object({ ...profile, password });
const updateSchema = z.object(profile);

async function siteMissing(siteId: string | null) {
  if (!siteId) return false;
  return !(await prisma.site.findUnique({ where: { id: siteId }, select: { id: true } }));
}

const usernameTaken: ActionState = {
  error: "Please fix the highlighted fields.",
  fieldErrors: { username: "That username is already used. Choose another." },
};

export async function createWorker(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { password: plain, ...data } = parsed.data;

  if (await siteMissing(data.siteId)) return { error: "The selected site no longer exists." };

  try {
    await prisma.user.create({
      data: { ...data, passwordHash: await bcrypt.hash(plain, 10), role: "WORKER" },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return usernameTaken;
    throw e;
  }
  revalidatePath("/workers");
  redirect("/workers");
}

export async function updateWorker(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const data = parsed.data;

  if (await siteMissing(data.siteId)) return { error: "The selected site no longer exists." };

  try {
    const result = await prisma.user.updateMany({ where: { id, role: "WORKER" }, data });
    if (result.count === 0) return { error: "This worker no longer exists." };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return usernameTaken;
    throw e;
  }
  revalidatePath("/workers");
  redirect("/workers");
}

export async function setWorkerPassword(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = password.safeParse(formData.get("password"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const result = await prisma.user.updateMany({
    where: { id, role: "WORKER" },
    data: { passwordHash: await bcrypt.hash(parsed.data, 10) },
  });
  if (result.count === 0) return { error: "This worker no longer exists." };
  return { message: "Password changed. Give the new password to the worker." };
}

export async function resetDevice(id: string, _prev: ActionState, _formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const result = await prisma.user.updateMany({ where: { id, role: "WORKER" }, data: { deviceId: null } });
  if (result.count === 0) return { error: "This worker no longer exists." };
  revalidatePath(`/workers/${id}`);
  return { message: "Phone unlinked. The next sign-in links the new phone." };
}

export async function setWorkerActive(
  id: string,
  active: boolean,
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const result = await prisma.user.updateMany({ where: { id, role: "WORKER" }, data: { active } });
  if (result.count === 0) return { error: "This worker no longer exists." };
  revalidatePath("/workers");
  revalidatePath(`/workers/${id}`);
  return { message: active ? "Worker reactivated." : "Worker deactivated. They can no longer sign in." };
}
