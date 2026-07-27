// Página estática de manutenção — sem banco, sem env, estilos inline.
export const dynamic = "force-static";

export const metadata = {
  title: "EM MANUTENÇÃO",
  robots: { index: false, follow: false },
};

export default function ManutencaoPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "32px 20px",
        background:
          "radial-gradient(900px 500px at 50% -10%, rgba(239,44,57,0.18), transparent 60%), #0a0a0b",
        color: "#f5f5f7",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 72,
          lineHeight: 1,
          marginBottom: 28,
          filter: "drop-shadow(0 10px 40px rgba(239,44,57,0.45))",
        }}
        aria-hidden
      >
        🔧
      </div>

      <h1
        style={{
          fontSize: 34,
          fontWeight: 800,
          letterSpacing: "0.06em",
          margin: 0,
        }}
      >
        EM MANUTENÇÃO
      </h1>

      <p
        style={{
          marginTop: 10,
          fontSize: 18,
          fontWeight: 700,
          color: "#ef2c39",
        }}
      >
        📍 I&apos;m Here
      </p>

      <p
        style={{
          marginTop: 18,
          maxWidth: 420,
          fontSize: 16,
          lineHeight: 1.6,
          color: "#b8b8c0",
        }}
      >
        Estamos fazendo uma melhoria rápida. Já já estamos de volta.
      </p>

      <div
        style={{
          marginTop: 36,
          width: 56,
          height: 4,
          borderRadius: 999,
          background: "linear-gradient(90deg, #ef2c39, #ff5a65)",
        }}
        aria-hidden
      />

      <footer
        style={{
          position: "fixed",
          bottom: 20,
          left: 0,
          right: 0,
          fontSize: 12,
          color: "#6b6b75",
        }}
      >
        Diretório Web ·{" "}
        <a
          href="https://diretoriow.com.br"
          style={{ color: "#6b6b75", textDecoration: "none" }}
        >
          diretoriow.com.br
        </a>
      </footer>
    </main>
  );
}
