import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | null = null;

/** 取得 Neon 連線（延遲初始化，避免 build 階段缺少環境變數時報錯）。 */
export function getSql(): NeonQueryFunction<false, false> {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "環境變數 DATABASE_URL 尚未設定。請參考 README，將 Neon 連線字串填入 .env.local（本機）或 Vercel 環境變數（部署）。"
      );
    }
    client = neon(url);
  }
  return client;
}

let schemaPromise: Promise<void> | null = null;

/** 第一次查詢時自動建立資料表（冪等，可重複呼叫）。 */
export function ensureSchema(): Promise<void> {
  if (!schemaPromise) {
    const sql = getSql();
    schemaPromise = (async () => {
      await sql`create table if not exists trips (
        id serial primary key,
        title text not null,
        start_date date,
        end_date date,
        notes text,
        created_at timestamptz not null default now()
      )`;
      await sql`create table if not exists spots (
        id serial primary key,
        trip_id integer not null references trips(id) on delete cascade,
        day_index integer not null default 1,
        time text,
        name_zh text not null,
        name_kr text,
        address text,
        category text,
        memo text,
        sort_order integer not null default 0,
        created_at timestamptz not null default now()
      )`;
      await sql`create table if not exists checklist_items (
        id serial primary key,
        trip_id integer references trips(id) on delete cascade,
        category text not null default '其他',
        text text not null,
        checked boolean not null default false,
        sort_order integer not null default 0,
        created_at timestamptz not null default now()
      )`;
      // 子項目支援：parent_id 指向同表的母項目（母項目刪除時連帶刪除子項目）
      await sql`alter table checklist_items
        add column if not exists parent_id integer references checklist_items(id) on delete cascade`;
    })().catch((err) => {
      // 失敗時清掉 promise，下一次請求可重試
      schemaPromise = null;
      throw err;
    });
  }
  return schemaPromise;
}
