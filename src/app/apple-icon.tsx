import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#646cb0",
          color: "white",
          fontSize: 82,
          fontWeight: 700,
          letterSpacing: -2,
        }}
      >
        KR
      </div>
    ),
    size
  );
}
