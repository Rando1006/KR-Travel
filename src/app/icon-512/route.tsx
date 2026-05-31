import { ImageResponse } from "next/og";

export function GET() {
  const size = 512;
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
          fontSize: 232,
          fontWeight: 700,
          letterSpacing: -6,
        }}
      >
        KR
      </div>
    ),
    { width: size, height: size }
  );
}
