import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "韓國旅遊規劃",
  description: "規劃韓國旅遊行程、景點 Naver 地圖導航與行前準備清單",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
          <nav className="mx-auto flex max-w-3xl items-center gap-1 px-4 py-3">
            <span className="mr-2 text-lg font-bold text-blue-600">🇰🇷 韓國旅遊</span>
            <Link
              href="/"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              行程規劃
            </Link>
            <Link
              href="/prepare"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              行前準備
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-3xl px-4 py-8 text-center text-xs text-slate-400">
          祝旅途愉快 · 즐거운 여행 되세요
        </footer>
      </body>
    </html>
  );
}
