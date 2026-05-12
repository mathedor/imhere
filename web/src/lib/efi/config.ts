export const EFI_CLIENT_ID = process.env.EFI_CLIENT_ID ?? "";
export const EFI_CLIENT_SECRET = process.env.EFI_CLIENT_SECRET ?? "";
export const EFI_SANDBOX = process.env.EFI_SANDBOX !== "false";
export const EFI_PIX_KEY = process.env.EFI_PIX_KEY ?? "";
export const EFI_CERT_PATH = process.env.EFI_CERT_PATH ?? "";
export const EFI_WEBHOOK_URL = process.env.EFI_WEBHOOK_URL ?? "";

export const EFI_BASE_URL = EFI_SANDBOX
  ? "https://pix-h.api.efipay.com.br"
  : "https://pix.api.efipay.com.br";

export const EFI_CARD_BASE_URL = EFI_SANDBOX
  ? "https://sandbox.gerencianet.com.br"
  : "https://api.gerencianet.com.br";

export function isEfiConfigured(): boolean {
  return Boolean(EFI_CLIENT_ID && EFI_CLIENT_SECRET);
}
