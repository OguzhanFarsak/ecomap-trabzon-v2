const DEFAULT_ADMIN_PASSWORD = "admin123";
const STORAGE_KEY = "ecomap_admin_pw_hash";
const MIN_PASSWORD_LENGTH = 4;
const MAX_PASSWORD_LENGTH = 64;

async function hashPassword(value: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoded = new TextEncoder().encode(`ecomap:${value}`);
    const digest = await crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  let h = 2166136261;
  const salted = `ecomap:${value}`;
  for (let i = 0; i < salted.length; i += 1) {
    h ^= salted.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `fnv:${(h >>> 0).toString(16)}`;
}

function readStoredHash(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function hasCustomAdminPassword(): boolean {
  return Boolean(readStoredHash());
}

export async function verifyAdminPassword(input: string): Promise<boolean> {
  const stored = readStoredHash();
  if (!stored) {
    return input === DEFAULT_ADMIN_PASSWORD;
  }
  const candidate = await hashPassword(input);
  return candidate === stored;
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!currentPassword) {
    return { ok: false, error: "Mevcut şifreyi girin." };
  }
  const matches = await verifyAdminPassword(currentPassword);
  if (!matches) {
    return { ok: false, error: "Mevcut şifre hatalı." };
  }
  const trimmed = newPassword.trim();
  if (trimmed.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: `Yeni şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalıdır.` };
  }
  if (trimmed.length > MAX_PASSWORD_LENGTH) {
    return { ok: false, error: `Yeni şifre en fazla ${MAX_PASSWORD_LENGTH} karakter olabilir.` };
  }
  if (trimmed !== confirmPassword.trim()) {
    return { ok: false, error: "Yeni şifreler birbiriyle eşleşmiyor." };
  }
  if (trimmed === currentPassword) {
    return { ok: false, error: "Yeni şifre mevcut şifreden farklı olmalıdır." };
  }

  const nextHash = await hashPassword(trimmed);
  try {
    window.localStorage.setItem(STORAGE_KEY, nextHash);
  } catch {
    return { ok: false, error: "Şifre tarayıcıya kaydedilemedi." };
  }
  return { ok: true };
}