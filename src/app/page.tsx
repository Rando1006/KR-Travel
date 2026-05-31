import Link from "next/link";
import { getTrips } from "@/lib/queries";
import { formatDateRange } from "@/lib/date";
import { ConfirmSubmit } from "./components/ConfirmSubmit";
import { createTrip, deleteTrip } from "./actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const trips = await getTrips();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">我的韓國行程</h1>
          <p className="mt-1 text-sm text-slate-500">點進每一趟行程安排每天的景點與導航</p>
        </div>
      </div>

      <details className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <summary className="flex items-center gap-2 font-semibold text-brand-600">
          <span className="text-xl leading-none">＋</span> 新增行程
        </summary>
        <form action={createTrip} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">行程名稱 *</label>
            <input
              name="title"
              required
              placeholder="例如：首爾五日自由行"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">出發日期</label>
              <input
                name="start_date"
                type="date"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">回程日期</label>
              <input
                name="end_date"
                type="date"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">備註</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="同行人、航班、訂房資訊…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            建立行程
          </button>
        </form>
      </details>

      {trips.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-400">
          還沒有任何行程，從上方「新增行程」開始吧！
        </p>
      ) : (
        <ul className="space-y-3">
          {trips.map((trip) => (
            <li
              key={trip.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <Link href={`/trip/${trip.id}`} className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold text-slate-700">{trip.title}</p>
                <p className="mt-0.5 text-sm text-slate-500">{formatDateRange(trip.start_date, trip.end_date)}</p>
                {trip.notes && (
                  <p className="mt-1 truncate text-xs text-slate-400">{trip.notes}</p>
                )}
              </Link>
              <ConfirmSubmit
                action={deleteTrip}
                hidden={{ id: trip.id }}
                confirmText={`確定要刪除「${trip.title}」嗎？\n此行程底下的所有景點也會一併刪除，且無法復原。`}
                className="rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-red-50 hover:text-red-600"
                title="刪除行程"
              >
                刪除
              </ConfirmSubmit>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
