"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { endSession, startSession } from "@/lib/auth";
import type { ActionState } from "@/lib/action-state";

// Compared against when the username does not exist, so response time does not reveal valid usernames.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return { error: "Enter your username and password." };

  const user = await prisma.user.findUnique({ where: { username } });
  const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !passwordOk || user.role !== "ADMIN" || !user.active) {
    return { error: "Wrong username or password." };
  }

  await startSession({ uid: user.id, role: "ADMIN" });
  redirect("/dashboard");
}

export async function logout() {
  await endSession();
  redirect("/login");
}
