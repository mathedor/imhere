#!/usr/bin/env node
/**
 * Verifica se as migrations do Supabase foram aplicadas.
 * Uso: node scripts/check-db.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const envPath = join(here, "..", "web", ".env.local");

const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("❌ Faltam NEXT_PUBLIC_SUPABASE_URL/KEY em web/.env.local");
  process.exit(1);
}

const REQUIRED = [
  "profiles",
  "establishments",
  "checkins",
  "moments",
  "contact_requests",
  "conversations",
  "messages",
  "plans",
  "subscriptions",
  "payments",
  "courtesies",
  "notifications",
];

console.log(`🔍 Checando ${url}\n`);

let ok = 0, missing = 0;
for (const table of REQUIRED) {
  const r = await fetch(`${url}/rest/v1/${table}?select=*&limit=0`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (r.ok) {
    const count = r.headers.get("content-range")?.split("/")[1] ?? "?";
    console.log(`  ✅ ${table.padEnd(20)} (${count} registros)`);
    ok++;
  } else {
    const body = await r.text();
    const code = body.includes("PGRST205") ? "não existe" : `erro ${r.status}`;
    console.log(`  ❌ ${table.padEnd(20)} ${code}`);
    missing++;
  }
}

console.log(`\n📊 ${ok}/${REQUIRED.length} tabelas OK${missing ? `, ${missing} faltando` : ""}`);
if (missing > 0) {
  console.log("\n👉 Cole os 4 SQLs em ordem no SQL Editor:");
  console.log("   https://supabase.com/dashboard/project/hnaxjcnbpfjvkiluiobt/sql/new");
  process.exit(1);
}
console.log("\n🎉 Todas as tabelas presentes. Pronto pra usar.");
