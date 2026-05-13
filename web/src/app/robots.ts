import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://imhere.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/cadastro", "/cardapio/", "/esqueci-senha"],
        disallow: [
          "/api/",
          "/admin",
          "/admin/",
          "/app",
          "/app/",
          "/estabelecimento",
          "/estabelecimento/",
          "/comercial",
          "/comercial/",
          "/redefinir-senha",
          "/auth/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
