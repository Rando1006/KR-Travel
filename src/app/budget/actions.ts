"use server";

import { getSql, ensureSchema } from "@/lib/db";
import { revalidatePath } from "next/cache";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function addExpense(formData: FormData) {
  await ensureSchema();
  const sql = getSql();
  const amount = Math.round(Number(formData.get("amount_krw")));
  if (!Number.isFinite(amount) || amount <= 0) return;
  const category = str(formData, "category") || "其他";
  const note = str(formData, "note") || null;
  const spentOn = str(formData, "spent_on") || null;
  await sql`
    insert into expenses (category, amount_krw, note, spent_on)
    values (${category}, ${amount}, ${note}, ${spentOn})
  `;
  revalidatePath("/budget");
}

export async function deleteExpense(formData: FormData) {
  await ensureSchema();
  const sql = getSql();
  const id = Number(formData.get("id"));
  if (!id) return;
  await sql`delete from expenses where id = ${id}`;
  revalidatePath("/budget");
}

export async function updateRate(formData: FormData) {
  await ensureSchema();
  const sql = getSql();
  const rate = Number(formData.get("krw_per_twd"));
  if (!Number.isFinite(rate) || rate <= 0) return;
  await sql`
    insert into app_settings (key, value)
    values ('krw_per_twd', ${String(rate)})
    on conflict (key) do update set value = excluded.value
  `;
  revalidatePath("/budget");
}
