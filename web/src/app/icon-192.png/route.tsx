import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ef2c39, #dc1f2b)",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#ef2c39",
            }}
          />
        </div>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
