/**
 * 產生 Naver 地圖（네이버 지도）的搜尋連結。
 * 在韓國當地的手機上點擊後，會自動開啟 Naver Map App 並定位／可進一步「길찾기」導航；
 * 在電腦或沒裝 App 的裝置上則開啟 Naver 地圖網頁版。
 */
export function naverSearchUrl(query: string): string {
  return `https://map.naver.com/p/search/${encodeURIComponent(query)}`;
}

/** 依景點資訊挑選最適合丟給 Naver 搜尋的關鍵字（韓文地名在 Naver 上最準）。 */
export function spotNaverUrl(spot: {
  name_kr: string | null;
  name_zh: string;
  address: string | null;
}): string {
  const kr = spot.name_kr?.trim();
  const query = kr && kr.length > 0
    ? kr
    : [spot.name_zh, spot.address].filter(Boolean).join(" ");
  return naverSearchUrl(query);
}
