import { ImageResponse } from "next/og";
import { listMenuBySlug } from "@/lib/db/menu";
import { supabaseServer } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/supabase/config";

export const runtime = "nodejs";
export const alt = "I'm Here · estabelecimento";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function getPresentNow(establishmentId: string): Promise<number> {
  if (isMockMode()) return 18;
  try {
    const sb = await supabaseServer();
    const { count } = await sb
      .from("checkins")
      .select("*", { count: "exact", head: true })
      .eq("establishment_id", establishmentId)
      .eq("status", "active");
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function Image({ params }: { params: { slug: string } }) {
  const { establishment } = await listMenuBySlug(params.slug);
  if (!establishment) {
    return new ImageResponse(<DefaultOg />, size);
  }
  const presentNow = await getPresentNow(establishment.id);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0a0a0b 0%, #2a0a0e 50%, #0a0a0b 100%)",
          padding: "64px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Watermark gradient corner */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 600,
            height: 600,
            background:
              "radial-gradient(circle at top right, rgba(239,44,57,0.35) 0%, rgba(239,44,57,0) 60%)",
          }}
        />

        {/* Header: logo + brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #ef2c39, #dc1f2b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px rgba(239,44,57,0.5)",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "white",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            I&apos;m <span style={{ color: "#ef2c39" }}>Here</span>
          </div>
        </div>

        {/* Main: establishment name */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            {establishment.city}/{establishment.state}
          </div>

          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              color: "white",
              letterSpacing: "-0.03em",
              lineHeight: 1.0,
              maxWidth: 1000,
            }}
          >
            {establishment.name}
          </div>

          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              marginTop: 32,
            }}
          >
            {presentNow > 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 20px",
                  borderRadius: 999,
                  background: "rgba(34, 197, 94, 0.15)",
                  border: "2px solid rgba(34, 197, 94, 0.6)",
                  color: "#22c55e",
                  fontSize: 26,
                  fontWeight: 800,
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "#22c55e",
                  }}
                />
                {presentNow} pessoas agora
              </div>
            ) : (
              <div
                style={{
                  padding: "12px 20px",
                  borderRadius: 999,
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "2px solid rgba(255, 255, 255, 0.18)",
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                Veja quem está aqui agora
              </div>
            )}

            <div
              style={{
                padding: "12px 20px",
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
        </div>
      </div>
    ),
    size
  );
}

function DefaultOg() {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0b",
        color: "white",
        fontSize: 64,
        fontWeight: 900,
      }}
    >
      I&apos;m Here
    </div>
  );
}
