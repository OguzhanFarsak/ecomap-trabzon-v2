import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://hfidenpnaatwcqslbjoq.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_cmufEKGDfpkHCUGvJANAsw_Tg0GADsE";

const supabaseUrl =
  (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined) ||
  (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined) ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Do not throw at module load: a missing env var would blank the whole app.
export const supabaseClient: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error(
      "Veritabanı bağlantısı henüz yapılandırılmadı (VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY eksik).",
    );
  }
  return supabaseClient;
}
