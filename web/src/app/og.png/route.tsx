import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0b 0%, #2a0a0e 50%, #0a0a0b 100%)",
          padding: "80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "linear-gradient(135deg, #ef2c39, #dc1f2b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 12px 40px rgba(239,44,57,0.5)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "white",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            I&apos;m <span style={{ color: "#ef2c39" }}>Here</span>
          </div>
        </div>

        <div
          style={{
            fontSize: 84,
            fontWeight: 900,
            color: "white",
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            maxWidth: 1000,
          }}
        >
          Quem está aqui <span style={{ color: "#ef2c39" }}>agora?</span>
        </div>

        <div
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.7)",
            marginTop: 24,
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          Check-in social em bares, restaurantes e baladas. Conheça gente real, em tempo real.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 48,
            padding: "12px 24px",
            borderRadius: 999,
            background: "linear-gradient(90deg, #dc1f2b, #ef2c39, #ff5a65)",
            color: "white",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          imhere.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
