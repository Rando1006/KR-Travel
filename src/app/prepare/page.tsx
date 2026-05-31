import { getTrips, getChecklist, type ChecklistItem } from "@/lib/queries";
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

  const grouped = new Map<string, ChecklistItem[]>();
  for (const item of items) {
    const list = grouped.get(item.category) ?? [];
    list.push(item);
    grouped.set(item.category, list);
  }
  const orderedCategories = [
    ...CATEGORIES.filter((c) => grouped.has(c)),
    ...[...grouped.keys()].filter((c) => !CATEGORIES.includes(c)),
  ];

  const total = items.length;
  const done = items.filter((i) => i.checked).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">行前準備</h1>
        <p className="mt-1 text-sm text-slate-500">出發前一項一項打勾，避免漏帶東西</p>
      </div>

      {/* 切換清單範圍 */}
      <form method="get" className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="text-sm font-medium text-slate-600">清單對象：</label>
        <select
          name="trip"
          defaultValue={scopeValue}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="">通用清單</option>
          {trips.map((t) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
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

      {total === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-slate-400">這份清單還是空的</p>
          <form action={seedDefaults} className="mt-4">
            <input type="hidden" name="trip_id" value={scopeValue} />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
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
                {grouped.get(category)!.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <form action={toggleChecklistItem}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-sm ${
                          item.checked
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 text-transparent hover:border-emerald-400"
                        }`}
                        title={item.checked ? "標記為未完成" : "標記為完成"}
                      >
                        ✓
                      </button>
                    </form>
                    <span className={`flex-1 text-sm ${item.checked ? "text-slate-400 line-through" : "text-slate-700"}`}>
                      {item.text}
                    </span>
                    <form action={deleteChecklistItem}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-red-50 hover:text-red-600"
                        title="刪除"
                      >
                        ✕
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {/* 新增項目 */}
      <details className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <summary className="flex items-center gap-2 font-semibold text-blue-600">
          <span className="text-xl leading-none">＋</span> 新增準備項目
        </summary>
        <form action={addChecklistItem} className="mt-4 flex flex-wrap items-end gap-3">
          <input type="hidden" name="trip_id" value={scopeValue} />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">分類</label>
            <select
              name="category"
              defaultValue="其他"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
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
              placeholder="例如：相機電池"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            新增
          </button>
        </form>
      </details>
    </div>
  );
}
