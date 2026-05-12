import fs from "node:fs";
import https from "node:https";
import {
  EFI_BASE_URL,
  EFI_CARD_BASE_URL,
  EFI_CERT_PATH,
  EFI_CLIENT_ID,
  EFI_CLIENT_SECRET,
  isEfiConfigured,
} from "./config";

interface CachedToken {
  token: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;

function buildAgent(): https.Agent | undefined {
  if (!EFI_CERT_PATH || !fs.existsSync(EFI_CERT_PATH)) return undefined;
  return new https.Agent({
    pfx: fs.readFileSync(EFI_CERT_PATH),
    passphrase: "",
  });
}

async function getAccessToken(target: "pix" | "card" = "pix"): Promise<string> {
  if (!isEfiConfigured()) throw new Error("EFI_NOT_CONFIGURED");

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const base = target === "pix" ? EFI_BASE_URL : EFI_CARD_BASE_URL;
  const url = `${base}/oauth/token`;
  const auth = Buffer.from(`${EFI_CLIENT_ID}:${EFI_CLIENT_SECRET}`).toString("base64");

  const agent = target === "pix" ? buildAgent() : undefined;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ grant_type: "client_credentials" }),
    // @ts-expect-error node-fetch agent
    agent,
  });

  if (!res.ok) {
    throw new Error(`Falha ao autenticar Efí: ${res.status}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

export async function efiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
  target: "pix" | "card" = "pix"
): Promise<T> {
  const token = await getAccessToken(target);
  const base = target === "pix" ? EFI_BASE_URL : EFI_CARD_BASE_URL;
  const agent = target === "pix" ? buildAgent() : undefined;

  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    // @ts-expect-error node-fetch agent
    agent,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Efí ${path}: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}
