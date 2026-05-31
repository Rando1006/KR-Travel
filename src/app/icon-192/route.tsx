import { ImageResponse } from "next/og";

export function GET() {
  const size = 192;
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
          fontSize: 88,
          fontWeight: 700,
          letterSpacing: -2,
        }}
      >
        KR
      </div>
    ),
    { width: size, height: size }
  );
}
