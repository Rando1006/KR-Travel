import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip, getSpots, type Spot } from "@/lib/queries";
import { spotNaverUrl } from "@/lib/naver";
import { updateTrip, addSpot, deleteSpot } from "./actions";

export const dynamic = "force-dynamic";

const CATEGORIES = ["景點", "美食", "購物", "住宿", "交通", "其他"];

function categoryStyle(category: string | null): string {
  switch (category) {
    case "景點": return "bg-blue-100 text-blue-700";
    case "美食": return "bg-orange-100 text-orange-700";
    case "購物": return "bg-pink-100 text-pink-700";
    case "住宿": return "bg-purple-100 text-purple-700";
    case "交通": return "bg-emerald-100 text-emerald-700";
    default: return "bg-slate-100 text-slate-600";
  }
}

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tripId = Number(id);
  if (!tripId) notFound();

  const trip = await getTrip(tripId);
  if (!trip) notFound();

  const spots = await getSpots(tripId);
  const maxDay = spots.reduce((m, s) => Math.max(m, s.day_index), 1);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);
  const spotsByDay = new Map<number, Spot[]>();
  for (const s of spots) {
    const list = spotsByDay.get(s.day_index) ?? [];
    list.push(s);
    spotsByDay.set(s.day_index, list);
  }

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-slate-500 hover:text-blue-600">
        ← 回到行程列表
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold">{trip.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {trip.start_date && trip.end_date
            ? `${trip.start_date} ~ ${trip.end_date}`
            : trip.start_date || trip.end_date || "尚未設定日期"}
        </p>
        {trip.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{trip.notes}</p>}

        <details className="mt-3">
          <summary className="text-sm text-slate-400 hover:text-blue-600">編輯行程資訊</summary>
          <form action={updateTrip} className="mt-3 space-y-3 border-t border-slate-100 pt-3">
            <input type="hidden" name="id" value={trip.id} />
            <input
              name="title"
              required
              defaultValue={trip.title}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                name="start_date"
                type="date"
                defaultValue={trip.start_date ?? ""}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <input
                name="end_date"
                type="date"
                defaultValue={trip.end_date ?? ""}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <textarea
              name="notes"
              rows={2}
              defaultValue={trip.notes ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              儲存
            </button>
          </form>
        </details>
      </div>

      {days.map((day) => {
        const list = spotsByDay.get(day) ?? [];
        return (
          <section key={day} className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-700">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {day}
              </span>
              第 {day} 天
            </h2>

            {list.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-center text-sm text-slate-400">
                這天還沒有安排景點
              </p>
            ) : (
              <ul className="space-y-2">
                {list.map((spot) => (
                  <li key={spot.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {spot.time && (
                            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-xs font-medium text-white">
                              {spot.time}
                            </span>
                          )}
                          {spot.category && (
                            <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${categoryStyle(spot.category)}`}>
                              {spot.category}
                            </span>
                          )}
                          <span className="font-semibold text-slate-800">{spot.name_zh}</span>
                        </div>
                        {spot.name_kr && (
                          <p className="mt-0.5 text-sm text-slate-500">{spot.name_kr}</p>
                        )}
                        {spot.address && (
                          <p className="mt-0.5 text-xs text-slate-400">📍 {spot.address}</p>
                        )}
                        {spot.memo && (
                          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{spot.memo}</p>
                        )}
                        <a
                          href={spotNaverUrl(spot)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
                        >
                          🧭 Naver 地圖導航
                        </a>
                      </div>
                      <form action={deleteSpot}>
                        <input type="hidden" name="id" value={spot.id} />
                        <input type="hidden" name="trip_id" value={trip.id} />
                        <button
                          type="submit"
                          className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600"
                          title="刪除景點"
                        >
                          刪除
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      <details className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" open={spots.length === 0}>
        <summary className="flex items-center gap-2 font-semibold text-blue-600">
          <span className="text-xl leading-none">＋</span> 新增景點
        </summary>
        <form action={addSpot} className="mt-4 space-y-3">
          <input type="hidden" name="trip_id" value={trip.id} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">第幾天 *</label>
              <input
                name="day_index"
                type="number"
                min={1}
                max={maxDay + 1}
                defaultValue={maxDay}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-slate-400">填 {maxDay + 1} 可新增一天</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">時間</label>
              <input
                name="time"
                placeholder="例如 09:30"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">景點名稱（中文）*</label>
            <input
              name="name_zh"
              required
              placeholder="例如：景福宮"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">景點名稱（韓文）</label>
            <input
              name="name_kr"
              placeholder="例如：경복궁（填韓文 Naver 導航最準）"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">地址</label>
            <input
              name="address"
              placeholder="選填"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">分類</label>
            <select
              name="category"
              defaultValue="景點"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">備註</label>
            <textarea
              name="memo"
              rows={2}
              placeholder="開放時間、票價、注意事項…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            加入景點
          </button>
        </form>
      </details>
    </div>
  );
}
