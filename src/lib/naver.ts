/** 判斷字串是否為 http(s) 連結。 */
export function isLink(value: string | null | undefined): boolean {
  return !!value && /^https?:\/\//i.test(value.trim());
}

/**
 * 產生 Naver 地圖（네이버 지도）的搜尋連結。
 * 在韓國當地的手機上點擊後，會自動開啟 Naver Map App 並定位／可進一步「길찾기」導航；
 * 在電腦或沒裝 App 的裝置上則開啟 Naver 地圖網頁版。
 */
export function naverSearchUrl(query: string): string {
  return `https://map.naver.com/p/search/${encodeURIComponent(query)}`;
}

/**
 * 依景點資訊決定導航要開啟的連結，優先順序：
 * 1. 地址欄直接填的 Naver 連結（例如從 App 分享的 naver.me 短網址，最準）
 * 2. 韓文名稱搜尋
 * 3. 中文名稱 + 地址文字搜尋
 */
export function spotNaverUrl(spot: {
  name_kr: string | null;
  name_zh: string;
  address: string | null;
}): string {
  const addr = spot.address?.trim();
  if (isLink(addr)) return addr!;

  const kr = spot.name_kr?.trim();
  const query = kr && kr.length > 0
    ? kr
    : [spot.name_zh, addr].filter(Boolean).join(" ");
  return naverSearchUrl(query);
}
