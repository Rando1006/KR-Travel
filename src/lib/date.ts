/** 將 'YYYY-MM-DD' 轉成中文「2026年9月10日」。空值回傳空字串。 */
export function formatDateZh(value: string | null): string {
  if (!value) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return value;
  return `${Number(m[1])}年${Number(m[2])}月${Number(m[3])}日`;
}

/** 將出發、回程日期組成顯示字串（中文年月日，不含時間）。 */
export function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return "尚未設定日期";
  if (start && end) return `${formatDateZh(start)} ~ ${formatDateZh(end)}`;
  return formatDateZh(start || end);
}
