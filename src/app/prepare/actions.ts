"use server";

import { getSql, ensureSchema } from "@/lib/db";
import { revalidatePath } from "next/cache";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/** 把表單的 trip_id 轉成 number 或 null（通用清單）。 */
function tripIdOf(formData: FormData): number | null {
  const raw = str(formData, "trip_id");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const DEFAULT_ITEMS: { category: string; text: string }[] = [
  { category: "證件文件", text: "護照（效期 6 個月以上）" },
  { category: "證件文件", text: "K-ETA / 簽證確認" },
  { category: "證件文件", text: "電子機票" },
  { category: "證件文件", text: "訂房確認單" },
  { category: "證件文件", text: "旅遊平安險 / 不便險" },
  { category: "金錢", text: "韓元現金" },
  { category: "金錢", text: "可海外刷卡的信用卡" },
  { category: "金錢", text: "T-money 交通卡" },
  { category: "通訊網路", text: "韓國上網 SIM / eSIM 或 WiFi 分享器" },
  { category: "通訊網路", text: "下載 Naver Map（導航）" },
  { category: "通訊網路", text: "下載 KakaoMap" },
  { category: "通訊網路", text: "下載 Papago 翻譯" },
  { category: "通訊網路", text: "下載 Kakao T 叫車" },
  { category: "行李", text: "萬國轉接頭（韓國 220V，C/F 型插座）" },
  { category: "行李", text: "保暖 / 換洗衣物" },
  { category: "行李", text: "常備藥品" },
  { category: "行李", text: "行動電源" },
];

export async function addChecklistItem(formData: FormData) {
  await ensureSchema();
  const sql = getSql();
  const tripId = tripIdOf(formData);
  const text = str(formData, "text");
  if (!text) return;
  const category = str(formData, "category") || "其他";
  const parentRaw = str(formData, "parent_id");
  const parentId = parentRaw ? Number(parentRaw) : null;
  await sql`
    insert into checklist_items (trip_id, category, text, parent_id)
    values (${tripId}, ${category}, ${text}, ${parentId})
  `;
  revalidatePath("/prepare");
}

export async function toggleChecklistItem(formData: FormData) {
  await ensureSchema();
  const sql = getSql();
  const id = Number(formData.get("id"));
  if (!id) return;
  await sql`update checklist_items set checked = not checked where id = ${id}`;
  revalidatePath("/prepare");
}

export async function deleteChecklistItem(formData: FormData) {
  await ensureSchema();
  const sql = getSql();
  const id = Number(formData.get("id"));
  if (!id) return;
  await sql`delete from checklist_items where id = ${id}`;
  revalidatePath("/prepare");
}

export async function seedDefaults(formData: FormData) {
  await ensureSchema();
  const sql = getSql();
  const tripId = tripIdOf(formData);
  for (let i = 0; i < DEFAULT_ITEMS.length; i++) {
    const item = DEFAULT_ITEMS[i];
    await sql`
      insert into checklist_items (trip_id, category, text, sort_order)
      values (${tripId}, ${item.category}, ${item.text}, ${i})
    `;
  }
  revalidatePath("/prepare");
}
