import { getExpenses, getKrwPerTwd, type Expense } from "@/lib/queries";
import { ConfirmSubmit } from "../components/ConfirmSubmit";
import { addExpense, deleteExpense, updateRate } from "./actions";

export const dynamic = "force-dynamic";

const CATEGORIES = ["餐飲", "交通", "購物", "住宿", "門票", "其他"];

function categoryStyle(category: string): string {
  switch (category) {
    case "餐飲": return "bg-orange-100 text-orange-700";
    case "交通": return "bg-emerald-100 text-emerald-700";
    case "購物": return "bg-pink-100 text-pink-700";
    case "住宿": return "bg-purple-100 text-purple-700";
    case "門票": return "bg-brand-100 text-brand-700";
    default: return "bg-slate-100 text-slate-600";
  }
}

const krw = (n: number) => `₩${Math.round(n).toLocaleString("en-US")}`;
const twd = (n: number) => `NT$${Math.round(n).toLocaleString("en-US")}`;

export default async function BudgetPage() {
  const [expenses, ratePerTwd] = await Promise.all([getExpenses(), getKrwPerTwd()]);

  const totalKrw = expenses.reduce((s, e) => s + e.amount_krw, 0);
  const totalTwd = totalKrw / ratePerTwd;

  // 各分類小計
  const byCategory = new Map<string, number>();
  for (const e of expenses) {
    byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount_krw);
  }
  const categorySubtotals = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">旅費記帳</h1>
        <p className="mt-1 text-sm text-slate-500">記錄韓元花費，自動加總並換算台幣</p>
      </div>

      {/* 總計 */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">目前總花費</p>
        <p className="mt-1 text-3xl font-bold text-slate-800">{krw(totalKrw)}</p>
        <p className="mt-0.5 text-sm text-slate-500">≈ {twd(totalTwd)}</p>

        {categorySubtotals.length > 0 && (
          <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
            {categorySubtotals.map(([cat, amt]) => (
              <div key={cat} className="flex items-center justify-between text-sm">
                <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${categoryStyle(cat)}`}>{cat}</span>
                <span className="text-slate-600">
                  {krw(amt)}
                  <span className="ml-2 text-xs text-slate-400">
                    {totalKrw ? Math.round((amt / totalKrw) * 100) : 0}%
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 匯率設定 */}
        <details className="mt-4 border-t border-slate-100 pt-3">
          <summary className="text-xs text-slate-400 hover:text-brand-600">
            匯率：1 元台幣 ≈ {ratePerTwd} 韓元（點此調整）
          </summary>
          <form action={updateRate} className="mt-2 flex items-center gap-2">
            <span className="text-sm text-slate-500">1 NT$ =</span>
            <input
              name="krw_per_twd"
              type="number"
              step="0.1"
              min="1"
              defaultValue={ratePerTwd}
              className="w-24 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-brand-400"
            />
            <span className="text-sm text-slate-500">韓元</span>
            <button
              type="submit"
              className="rounded-lg bg-slate-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-600"
            >
              儲存
            </button>
          </form>
        </details>
      </div>

      {/* 新增支出 */}
      <details className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" open={expenses.length === 0}>
        <summary className="flex items-center gap-2 font-semibold text-brand-600">
          <span className="text-xl leading-none">＋</span> 新增一筆花費
        </summary>
        <form action={addExpense} className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">分類</label>
              <select
                name="category"
                defaultValue="餐飲"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-400"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">金額（韓元）*</label>
              <input
                name="amount_krw"
                type="number"
                min="1"
                required
                placeholder="例如 12000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">日期</label>
              <input
                name="spent_on"
                type="date"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">備註</label>
              <input
                name="note"
                placeholder="例如：廣藏市場午餐"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
            </div>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            記一筆
          </button>
        </form>
      </details>

      {/* 花費列表 */}
      {expenses.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-400">
          還沒有任何花費紀錄，從上方「新增一筆花費」開始記帳吧！
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {expenses.map((e: Expense) => (
            <li key={e.id} className="flex items-center gap-3 px-4 py-3">
              <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${categoryStyle(e.category)}`}>
                {e.category}
              </span>
              <div className="min-w-0 flex-1">
                {e.note && <p className="truncate text-sm text-slate-700">{e.note}</p>}
                {e.spent_on && <p className="text-xs text-slate-400">{e.spent_on}</p>}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-slate-800">{krw(e.amount_krw)}</p>
                <p className="text-xs text-slate-400">≈ {twd(e.amount_krw / ratePerTwd)}</p>
              </div>
              <ConfirmSubmit
                action={deleteExpense}
                hidden={{ id: e.id }}
                confirmText={`確定要刪除這筆${e.category}花費 ${krw(e.amount_krw)} 嗎？`}
                className="shrink-0 rounded px-2 py-1 text-xs text-slate-300 hover:bg-red-50 hover:text-red-600"
                title="刪除"
              >
                ✕
              </ConfirmSubmit>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
