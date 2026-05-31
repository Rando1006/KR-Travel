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
  parent_id: number | null;
  category: string;
  text: string;
  checked: boolean;
  sort_order: number;
}

export async function getTrips(): Promise<Trip[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    select id, title,
      to_char(start_date, 'YYYY-MM-DD') as start_date,
      to_char(end_date, 'YYYY-MM-DD') as end_date,
      notes
    from trips
    order by coalesce(start_date, created_at::date) asc, id asc
  `;
  return rows as Trip[];
}

export async function getTrip(id: number): Promise<Trip | null> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    select id, title,
      to_char(start_date, 'YYYY-MM-DD') as start_date,
      to_char(end_date, 'YYYY-MM-DD') as end_date,
      notes
    from trips where id = ${id}
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

export interface Expense {
  id: number;
  category: string;
  amount_krw: number;
  note: string | null;
  spent_on: string | null;
}

export async function getExpenses(): Promise<Expense[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    select id, category, amount_krw, note, to_char(spent_on, 'YYYY-MM-DD') as spent_on
    from expenses
    order by spent_on desc nulls last, id desc
  `;
  return rows as Expense[];
}

/** 取得「1 元台幣 = 幾韓元」匯率，未設定時預設 42。 */
export async function getKrwPerTwd(): Promise<number> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`select value from app_settings where key = 'krw_per_twd'`;
  const n = rows[0]?.value ? Number(rows[0].value) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 42;
}

export async function getChecklist(tripId: number | null): Promise<ChecklistItem[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = tripId === null
    ? await sql`
        select id, trip_id, parent_id, category, text, checked, sort_order
        from checklist_items
        where trip_id is null
        order by category asc, sort_order asc, id asc
      `
    : await sql`
        select id, trip_id, parent_id, category, text, checked, sort_order
        from checklist_items
        where trip_id = ${tripId}
        order by category asc, sort_order asc, id asc
      `;
  return rows as ChecklistItem[];
}
