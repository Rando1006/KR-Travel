import { getSql, ensureSchema } from "./db";

export interface Trip {
  id: number;
  title: string;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
}

export interface Spot {
  id: number;
  trip_id: number;
  day_index: number;
  time: string | null;
  name_zh: string;
  name_kr: string | null;
  address: string | null;
  category: string | null;
  memo: string | null;
  sort_order: number;
}

export interface ChecklistItem {
  id: number;
  trip_id: number | null;
  category: string;
  text: string;
  checked: boolean;
  sort_order: number;
}

export async function getTrips(): Promise<Trip[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    select id, title, start_date, end_date, notes
    from trips
    order by coalesce(start_date, created_at::date) asc, id asc
  `;
  return rows as Trip[];
}

export async function getTrip(id: number): Promise<Trip | null> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    select id, title, start_date, end_date, notes from trips where id = ${id}
  `;
  return (rows[0] as Trip) ?? null;
}

export async function getSpots(tripId: number): Promise<Spot[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    select id, trip_id, day_index, time, name_zh, name_kr, address, category, memo, sort_order
    from spots
    where trip_id = ${tripId}
    order by day_index asc, sort_order asc, time asc nulls last, id asc
  `;
  return rows as Spot[];
}

export async function getChecklist(tripId: number | null): Promise<ChecklistItem[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = tripId === null
    ? await sql`
        select id, trip_id, category, text, checked, sort_order
        from checklist_items
        where trip_id is null
        order by category asc, sort_order asc, id asc
      `
    : await sql`
        select id, trip_id, category, text, checked, sort_order
        from checklist_items
        where trip_id = ${tripId}
        order by category asc, sort_order asc, id asc
      `;
  return rows as ChecklistItem[];
}
