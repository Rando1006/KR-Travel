import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "瓜峰韓國旅遊",
    short_name: "韓國旅遊",
    description: "韓國旅遊行程規劃、Naver 導航與行前準備",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f5f4",
    theme_color: "#646cb0",
    lang: "zh-Hant",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
