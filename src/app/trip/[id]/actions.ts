"use server";

import { getSql, ensureSchema } from "@/lib/db";
import { revalidatePath } from "next/cache";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function updateTrip(formData: FormData) {
  await ensureSchema();
  const sql = getSql();
  const id = Number(formData.get("id"));
  if (!id) return;
  const title = str(formData, "title");
  if (!title) return;
  const start = str(formData, "start_date") || null;
  const end = str(formData, "end_date") || null;
  const notes = str(formData, "notes") || null;
  await sql`
    update trips
    set title = ${title}, start_date = ${start}, end_date = ${end}, notes = ${notes}
    where id = ${id}
  `;
  revalidatePath(`/trip/${id}`);
}

export async function addSpot(formData: FormData) {
  await ensureSchema();
  const sql = getSql();
  const tripId = Number(formData.get("trip_id"));
  if (!tripId) return;
  const nameZh = str(formData, "name_zh");
  if (!nameZh) return;
  const dayIndex = Math.max(1, Number(formData.get("day_index")) || 1);
  const time = str(formData, "time") || null;
  const nameKr = str(formData, "name_kr") || null;
  const address = str(formData, "address") || null;
  const category = str(formData, "category") || null;
  const memo = str(formData, "memo") || null;

  const maxRows = await sql`
    select coalesce(max(sort_order), 0) as m from spots where trip_id = ${tripId} and day_index = ${dayIndex}
  `;
  const sortOrder = Number(maxRows[0].m) + 1;

  await sql`
    insert into spots (trip_id, day_index, time, name_zh, name_kr, address, category, memo, sort_order)
    values (${tripId}, ${dayIndex}, ${time}, ${nameZh}, ${nameKr}, ${address}, ${category}, ${memo}, ${sortOrder})
  `;
  revalidatePath(`/trip/${tripId}`);
}

export async function deleteSpot(formData: FormData) {
  await ensureSchema();
  const sql = getSql();
  const id = Number(formData.get("id"));
  const tripId = Number(formData.get("trip_id"));
  if (!id) return;
  await sql`delete from spots where id = ${id}`;
  revalidatePath(`/trip/${tripId}`);
}
