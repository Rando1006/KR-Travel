import { getTrips, getChecklist, type ChecklistItem } from "@/lib/queries";
import { ConfirmSubmit } from "../components/ConfirmSubmit";
import {
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  seedDefaults,
} from "./actions";

export const dynamic = "force-dynamic";

const CATEGORIES = ["證件文件", "金錢", "通訊網路", "行李", "其他"];

export default async function PreparePage({
  searchParams,
}: {
  searchParams: Promise<{ trip?: string }>;
}) {
  const { trip } = await searchParams;
  const tripId = trip && Number(trip) > 0 ? Number(trip) : null;

  const [trips, items] = await Promise.all([getTrips(), getChecklist(tripId)]);
  const scopeValue = tripId === null ? "" : String(tripId);
  const currentTrip = trips.find((t) => t.id === tripId);

  // 建立母子關係
  const childrenOf = new Map<number, ChecklistItem[]>();
  const topLevel: ChecklistItem[] = [];
  for (const item of items) {
    if (item.parent_id == null) {
      topLevel.push(item);
    } else {
      const arr = childrenOf.get(item.parent_id) ?? [];
      arr.push(item);
      childrenOf.set(item.parent_id, arr);
    }
  }
  const kidsOf = (id: number) => childrenOf.get(id) ?? [];

  // 母項目依大分類分組
  const grouped = new Map<string, ChecklistItem[]>();
  for (const item of topLevel) {
    const list = grouped.get(item.category) ?? [];
    list.push(item);
    grouped.set(item.category, list);
  }
  const orderedCategories = [
    ...CATEGORIES.filter((c) => grouped.has(c)),
    ...[...grouped.keys()].filter((c) => !CATEGORIES.includes(c)),
  ];

  // 進度只計算「最細的項目」（沒有子項目的才算一項）
  const leaves = items.filter((i) => kidsOf(i.id).length === 0);
  const total = leaves.length;
  const done = leaves.filter((i) => i.checked).length;

  // 勾選圓圈
  const checkButton = (item: ChecklistItem) => (
    <form action={toggleChecklistItem}>
      <input type="hidden" name="id" value={item.id} />
      <button
        type="submit"
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-sm ${
          item.checked
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-300 text-transparent hover:border-emerald-400"
        }`}
        title={item.checked ? "標記為未完成" : "標記為完成"}
      >
        ✓
      </button>
    </form>
  );

  const deleteX = (item: ChecklistItem, confirmText: string) => (
    <ConfirmSubmit
      action={deleteChecklistItem}
      hidden={{ id: item.id }}
      confirmText={confirmText}
      className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-red-50 hover:text-red-600"
      title="刪除"
    >
      ✕
    </ConfirmSubmit>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">行前準備</h1>
        <p className="mt-1 text-sm text-slate-500">出發前一項一項打勾，避免漏帶東西。項目可再展開新增細項</p>
      </div>

      {/* 切換清單範圍 */}
      <form method="get" className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="text-sm font-medium text-slate-600">清單對象：</label>
        <select
          name="trip"
          defaultValue={scopeValue}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-400"
        >
          <option value="">通用清單</option>
          {trips.map((t) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-slate-500 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-600"
        >
          切換
        </button>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">
          目前清單：<span className="font-semibold text-slate-700">{currentTrip ? currentTrip.title : "通用清單"}</span>
        </p>
        {total > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>完成進度</span>
              <span>{done} / {total}</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${total ? Math.round((done / total) * 100) : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-slate-400">這份清單還是空的</p>
          <form action={seedDefaults} className="mt-4">
            <input type="hidden" name="trip_id" value={scopeValue} />
            <button
              type="submit"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
            >
              載入韓國旅遊預設清單
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-5">
          {orderedCategories.map((category) => (
            <section key={category}>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-400">{category}</h2>
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {grouped.get(category)!.map((item) => {
                  const kids = kidsOf(item.id);
                  const hasKids = kids.length > 0;
                  return (
                    <li key={item.id}>
                      {/* 母項目 / 一般項目列 */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        {hasKids ? (
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center text-base">📂</span>
                        ) : (
                          checkButton(item)
                        )}
                        <span
                          className={`flex-1 text-sm ${
                            hasKids
                              ? "font-semibold text-slate-700"
                              : item.checked
                                ? "text-slate-400 line-through"
                                : "text-slate-700"
                          }`}
                        >
                          {item.text}
                          {hasKids && (
                            <span className="ml-2 text-xs font-normal text-slate-400">
                              {kids.filter((k) => k.checked).length} / {kids.length}
                            </span>
                          )}
                        </span>
                        {deleteX(
                          item,
                          hasKids
                            ? `確定要刪除「${item.text}」及其底下所有細項嗎？`
                            : `確定要刪除「${item.text}」嗎？`
                        )}
                      </div>

                      {/* 子項目 */}
                      {hasKids && (
                        <ul className="ml-7 border-l border-slate-200">
                          {kids.map((kid) => (
                            <li key={kid.id} className="flex items-center gap-3 py-2 pl-4 pr-4">
                              {checkButton(kid)}
                              <span className={`flex-1 text-sm ${kid.checked ? "text-slate-400 line-through" : "text-slate-600"}`}>
                                {kid.text}
                              </span>
                              {deleteX(kid, `確定要刪除「${kid.text}」嗎？`)}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* 新增子項目 */}
                      <details className="px-4 pb-3">
                        <summary className="ml-9 text-xs font-medium text-brand-600 hover:text-brand-700">
                          ＋ 新增細項
                        </summary>
                        <form action={addChecklistItem} className="ml-9 mt-2 flex gap-2">
                          <input type="hidden" name="trip_id" value={scopeValue} />
                          <input type="hidden" name="category" value={item.category} />
                          <input type="hidden" name="parent_id" value={item.id} />
                          <input
                            name="text"
                            required
                            placeholder="例如：普拿疼、腸胃藥…"
                            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-brand-400"
                          />
                          <button
                            type="submit"
                            className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-600"
                          >
                            新增
                          </button>
                        </form>
                      </details>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {/* 新增項目（大分類底下的項目） */}
      <details className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <summary className="flex items-center gap-2 font-semibold text-brand-600">
          <span className="text-xl leading-none">＋</span> 新增準備項目
        </summary>
        <form action={addChecklistItem} className="mt-4 flex flex-wrap items-end gap-3">
          <input type="hidden" name="trip_id" value={scopeValue} />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">分類</label>
            <select
              name="category"
              defaultValue="其他"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-600">項目內容 *</label>
            <input
              name="text"
              required
              placeholder="例如：常備藥品（新增後可再展開細項）"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            新增
          </button>
        </form>
      </details>
    </div>
  );
}
