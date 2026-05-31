"use server";

import { getSql, ensureSchema } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function createTrip(formData: FormData) {
  await ensureSchema();
  const sql = getSql();
  const title = str(formData, "title");
  if (!title) return;
  const start = str(formData, "start_date") || null;
  const end = str(formData, "end_date") || null;
  const notes = str(formData, "notes") || null;
  const rows = await sql`
    insert into trips (title, start_date, end_date, notes)
    values (${title}, ${start}, ${end}, ${notes})
    returning id
  `;
  revalidatePath("/");
  redirect(`/trip/${rows[0].id}`);
}

export async function deleteTrip(formData: FormData) {
  await ensureSchema();
  const sql = getSql();
  const id = Number(formData.get("id"));
  if (!id) return;
  await sql`delete from trips where id = ${id}`;
  revalidatePath("/");
}
