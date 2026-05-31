"use client";

import { useEffect } from "react";

/**
 * 註冊 Service Worker，讓網站可離線開啟、可加到手機主畫面。
 * 本機開發（localhost）不註冊，避免快取干擾熱重載。
 */
export function PWARegister() {
  useEffect(() => {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // 註冊失敗不影響網站使用，靜默處理
      });
    }
  }, []);

  return null;
}
