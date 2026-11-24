import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const REPORT_CATEGORIES = [
  "Sokak Çöpü",
  "Sahil ve Deniz Kirliliği",
  "Dere ve Akarsu Atıkları",
  "Kaçak Moloz Dökümü",
  "Ormanlık Alan Kirliliği",
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export const REPORT_STATUSES = ["Beklemede", "İnceleniyor", "Temizlendi"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export type Report = {
  id: string;
  created_at: string;
  reporter_name: string;
  reporter_email: string;
  description: string | null;
  category: ReportCategory;
  status: ReportStatus;
  lat: number;
  lng: number;
  photo_url: string | null;
  cleaned_photo_url: string | null;
  cleaned_at: string | null;
};

export type NewReport = {
  reporter_name: string;
  reporter_email: string;
  description: string;
  category: ReportCategory;
  lat: number;
  lng: number;
  photo_url: string | null;
};

export const TRABZON_CENTER = { lat: 41.0027, lng: 39.7168 };
export const TRABZON_ZOOM = 13;

export const STATUS_COLORS: Record<ReportStatus, string> = {
  Beklemede: "#dc2626",
  İnceleniyor: "#f59e0b",
  Temizlendi: "#10b981",
};

type ReportRow = {
  id: string;
  created_at: string;
  title: string | null;
  reporter_name: string | null;
  reporter_email: string | null;
  description: string | null;
  category: string | null;
  status: string | null;
  latitude: number;
  longitude: number;
  image_url: string | null;
  clean_image_url: string | null;
};

function normalizeStatus(status: string | null | undefined): ReportStatus {
  if (status === "Beklemede" || status === "İnceleniyor" || status === "Temizlendi") {
    return status;
  }
  const lower = (status ?? "").toLowerCase();
  if (lower === "cleaned" || lower === "resolved") return "Temizlendi";
  if (lower === "in_progress" || lower === "reviewing") return "İnceleniyor";
  return "Beklemede";
}

function normalizeCategory(category: string | null | undefined): ReportCategory {
  if (category && (REPORT_CATEGORIES as readonly string[]).includes(category)) {
    return category as ReportCategory;
  }
  return REPORT_CATEGORIES[0];
}

function mapRow(row: ReportRow): Report {
  return {
    id: row.id,
    created_at: row.created_at,
    reporter_name: row.reporter_name ?? "",
    reporter_email: row.reporter_email ?? "",
    description: row.description,
    category: normalizeCategory(row.category),
    status: normalizeStatus(row.status),
    lat: Number(row.latitude),
    lng: Number(row.longitude),
    photo_url: row.image_url,
    cleaned_photo_url: row.clean_image_url,
    cleaned_at: null,
  };
}

function logSupabaseError(operation: string, error: unknown) {
  console.error(`[EcoMap] Supabase hatası — ${operation}:`, error);
  if (error && typeof error === "object" && "code" in error) {
    console.error(`[EcoMap] Hata kodu: ${(error as { code: string }).code}`);
  }
  if (error && typeof error === "object" && "message" in error) {
    console.error(`[EcoMap] Hata mesajı: ${(error as { message: string }).message}`);
  }
  if (error && typeof error === "object" && "details" in error) {
    console.error(`[EcoMap] Detay: ${(error as { details: string }).details}`);
  }
  if (error && typeof error === "object" && "hint" in error) {
    console.error(`[EcoMap] İpucu: ${(error as { hint: string }).hint}`);
  }
}

export async function listReports(): Promise<Report[]> {
  if (!isSupabaseConfigured) {
    console.warn("[EcoMap] Supabase yapılandırılmadı — boş liste döndürülüyor.");
    return [];
  }
  const { data, error } = await getSupabase()
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    logSupabaseError("listReports (SELECT *)", error);
    throw error;
  }

  console.log(`[EcoMap] listReports başarılı — ${data?.length ?? 0} kayıt döndü.`);
  return ((data ?? []) as ReportRow[]).map(mapRow);
}

export async function createReport(input: NewReport): Promise<Report> {
  const payload = {
    title: input.category,
    reporter_name: input.reporter_name,
    reporter_email: input.reporter_email,
    description: input.description || null,
    category: input.category,
    status: "Beklemede",
    latitude: input.lat,
    longitude: input.lng,
    image_url: input.photo_url,
  };

  console.log("[EcoMap] createReport — insert ediliyor:", payload);

  const { data, error } = await getSupabase()
    .from("reports")
    .insert(payload)
    .select()
    .single();

  if (error) {
    logSupabaseError("createReport (INSERT)", error);
    throw error;
  }

  console.log("[EcoMap] createReport başarılı — kayıt oluşturuldu:", data?.id);
  return mapRow(data as ReportRow);
}

export async function updateReportStatus(
  id: string,
  status: ReportStatus,
  cleanedPhotoUrl?: string | null,
): Promise<void> {
  const updates: Record<string, unknown> = { status };

  if (cleanedPhotoUrl !== undefined) {
    updates["clean_image_url"] = cleanedPhotoUrl;
  }

  console.log(`[EcoMap] updateReportStatus — id=${id}, güncelleme:`, updates);

  const { error } = await getSupabase().from("reports").update(updates).eq("id", id);

  if (error) {
    logSupabaseError("updateReportStatus (UPDATE)", error);
    throw error;
  }

  console.log(`[EcoMap] updateReportStatus başarılı — id=${id}`);
}

export async function deleteReport(id: string): Promise<void> {
  console.log(`[EcoMap] deleteReport — id=${id}`);

  const { data, error } = await getSupabase()
    .from("reports")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    logSupabaseError("deleteReport (DELETE)", error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error(
      "İhbar silinemedi. Veritabanında silme yetkisini (DELETE politikası) kontrol edin.",
    );
  }

  console.log(`[EcoMap] deleteReport başarılı — id=${id}`);
}

export async function uploadPhoto(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const filePath = `${fileName}`;

  console.log(`[EcoMap] uploadPhoto — 'reports' bucket'ına yükleniyor: ${filePath}`);

  const { error: uploadError } = await getSupabase().storage
    .from("reports")
    .upload(filePath, file, { contentType: file.type });

  if (uploadError) {
    logSupabaseError("uploadPhoto (Storage UPLOAD)", uploadError);
    throw uploadError;
  }

  const { data } = getSupabase().storage.from("reports").getPublicUrl(filePath);
  console.log(`[EcoMap] uploadPhoto başarılı — public URL: ${data.publicUrl}`);
  return data.publicUrl;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function isInTrabzon(lat: number, lng: number): boolean {
  return lat > 40.5 && lat < 41.25 && lng > 38.8 && lng < 40.6;
}
